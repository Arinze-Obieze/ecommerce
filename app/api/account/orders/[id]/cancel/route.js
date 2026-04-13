import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';
import { writeActivityLog } from '@/utils/serverTelemetry';

const MISSING_TABLE_HINT = 'Database is missing public.order_cancellation_requests. Apply documentation/migrations/2026-04-09_order_cancellation_requests.sql and retry.';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

function normalizeReason(value) {
  return String(value || '').trim().slice(0, 1000);
}

function isMissingCancellationTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('order_cancellation_requests') && message.includes('does not exist'));
}

function canRequestCancellation(order) {
  const status = String(order?.status || '').toLowerCase();
  const fulfillment = String(order?.fulfillment_status || '').toLowerCase();

  if (status === 'cancelled') {
    return { allowed: false, reason: 'This order is already cancelled.' };
  }

  if (fulfillment === 'packed' || fulfillment === 'shipped' || fulfillment === 'delivered') {
    return { allowed: false, reason: 'This order has already moved beyond the cancellable stage.' };
  }

  return { allowed: true };
}

async function getAuthedUser(request) {
  const authClient = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return { user: null, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'account_order_cancel',
    identifier: user.id,
    limit: 30,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return { user: null, response: NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) }) };
  }

  return { user, response: null };
}

export async function GET(request, { params }) {
  const auth = await getAuthedUser(request);
  if (!auth.user) return auth.response;

  const { id } = await params;
  const serviceClient = createServiceClient();

  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, user_id, status, fulfillment_status')
    .eq('id', id)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  if (!order || order.user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const requestResult = await serviceClient
    .from('order_cancellation_requests')
    .select('id, status, reason, resolution_note, reviewed_at, created_at, updated_at')
    .eq('order_id', id)
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (isMissingCancellationTableError(requestResult.error)) {
    return NextResponse.json({ error: MISSING_TABLE_HINT }, { status: 500 });
  }

  if (requestResult.error && requestResult.error.code !== 'PGRST116') {
    return NextResponse.json({ error: requestResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      order_id: order.id,
      order_status: order.status,
      fulfillment_status: order.fulfillment_status,
      cancellation_request: requestResult.data || null,
    },
  });
}

export async function POST(request, { params }) {
  const auth = await getAuthedUser(request);
  if (!auth.user) return auth.response;

  const { id } = await params;
  const serviceClient = createServiceClient();
  const body = await request.json().catch(() => ({}));
  const reason = normalizeReason(body?.reason);

  if (!reason) {
    return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
  }

  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, user_id, status, fulfillment_status, payment_reference, created_at')
    .eq('id', id)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  if (!order || order.user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const eligibility = canRequestCancellation(order);
  if (!eligibility.allowed) {
    return NextResponse.json({ error: eligibility.reason }, { status: 409 });
  }

  const existingResult = await serviceClient
    .from('order_cancellation_requests')
    .select('id, status')
    .eq('order_id', id)
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (isMissingCancellationTableError(existingResult.error)) {
    return NextResponse.json({ error: MISSING_TABLE_HINT }, { status: 500 });
  }

  if (existingResult.error && existingResult.error.code !== 'PGRST116') {
    return NextResponse.json({ error: existingResult.error.message }, { status: 500 });
  }

  if (existingResult.data?.status === 'pending') {
    return NextResponse.json({ error: 'A cancellation request is already pending for this order.' }, { status: 409 });
  }

  const saveResult = await serviceClient
    .from('order_cancellation_requests')
    .upsert({
      order_id: order.id,
      user_id: auth.user.id,
      status: 'pending',
      reason,
      resolution_note: null,
      reviewed_at: null,
      reviewed_by: null,
    }, { onConflict: 'order_id' })
    .select('id, status, reason, resolution_note, reviewed_at, created_at, updated_at')
    .single();

  if (isMissingCancellationTableError(saveResult.error)) {
    return NextResponse.json({ error: MISSING_TABLE_HINT }, { status: 500 });
  }

  if (saveResult.error) {
    return NextResponse.json({ error: saveResult.error.message || 'Failed to submit cancellation request' }, { status: 400 });
  }

  await writeActivityLog({
    request,
    level: 'INFO',
    service: 'account-orders-service',
    action: 'ORDER_CANCELLATION_REQUEST_CREATED',
    status: 'success',
    statusCode: 200,
    userId: auth.user.id,
    message: 'Order cancellation request submitted',
    metadata: {
      orderId: order.id,
      orderStatus: order.status,
      fulfillmentStatus: order.fulfillment_status,
    },
  });

  return NextResponse.json({
    success: true,
    data: saveResult.data,
  });
}
