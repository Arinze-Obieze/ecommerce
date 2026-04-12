import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/utils/rateLimit';
import { writeActivityLog } from '@/utils/serverTelemetry';
import { createUserNotification } from '@/utils/notifications';

const MISSING_TABLE_HINT =
  'Database is missing public.order_return_requests. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function normalizeText(value, max = 1000) {
  return String(value || '').trim().slice(0, max);
}

function isMissingReturnsTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('order_return_requests') && message.includes('does not exist'));
}

async function getAuthedContext(request) {
  const authClient = await createClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'account_order_returns',
    identifier: user.id,
    limit: 30,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return { ok: false, response: NextResponse.json({ error: 'Too many requests' }, { status: 429 }) };
  }

  const adminClient = await createAdminClient();
  return { ok: true, user, adminClient };
}

async function loadOrderContext(adminClient, orderId, userId) {
  const { data: order, error } = await adminClient
    .from('orders')
    .select('id, user_id, status, fulfillment_status, total_amount, created_at')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to load order');
  }

  if (!order || order.user_id !== userId) {
    return { order: null, storeId: null, storeName: null };
  }

  const { data: itemRows, error: itemError } = await adminClient
    .from('order_items')
    .select('product_id')
    .eq('order_id', order.id)
    .limit(50);

  if (itemError) {
    throw new Error(itemError.message || 'Failed to load order items');
  }

  const productIds = [...new Set((itemRows || []).map((row) => row.product_id).filter(Boolean))];
  if (productIds.length === 0) {
    return { order, storeId: null, storeName: null };
  }

  const { data: productRows, error: productError } = await adminClient
    .from('products')
    .select('id, store_id, stores(name)')
    .in('id', productIds)
    .limit(50);

  if (productError) {
    throw new Error(productError.message || 'Failed to load store context');
  }

  const first = productRows?.[0] || null;
  return {
    order,
    storeId: first?.store_id || null,
    storeName: Array.isArray(first?.stores) ? first.stores[0]?.name || null : first?.stores?.name || null,
  };
}

function canRequestReturn(order) {
  const orderStatus = String(order?.status || '').toLowerCase();
  const fulfillment = String(order?.fulfillment_status || '').toLowerCase();

  if (orderStatus === 'cancelled') {
    return { allowed: false, reason: 'Cancelled orders cannot be returned.' };
  }

  if (!['delivered', 'delivered_confirmed'].includes(fulfillment)) {
    return { allowed: false, reason: 'Returns are only available after delivery.' };
  }

  return { allowed: true };
}

export async function GET(request, { params }) {
  const ctx = await getAuthedContext(request);
  if (!ctx.ok) return ctx.response;

  try {
    const { id } = await params;
    const context = await loadOrderContext(ctx.adminClient, id, ctx.user.id);

    if (!context.order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const result = await ctx.adminClient
      .from('order_return_requests')
      .select('id, order_id, status, refund_status, reason, requested_resolution, details, seller_note, buyer_note, admin_note, refund_amount, refund_reference, approved_at, received_at, refund_requested_at, refunded_at, reviewed_at, created_at, updated_at')
      .eq('order_id', id)
      .eq('user_id', ctx.user.id)
      .maybeSingle();

    if (isMissingReturnsTableError(result.error)) {
      return NextResponse.json({ error: MISSING_TABLE_HINT }, { status: 500 });
    }

    if (result.error && result.error.code !== 'PGRST116') {
      return NextResponse.json({ error: result.error.message || 'Failed to load return request' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: context.order.id,
        order_status: context.order.status,
        fulfillment_status: context.order.fulfillment_status,
        return_request: result.data || null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to load return request' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const ctx = await getAuthedContext(request);
  if (!ctx.ok) return ctx.response;

  const body = await request.json().catch(() => ({}));
  const reason = normalizeText(body?.reason);
  const requestedResolution = normalizeText(body?.requested_resolution, 30) || 'refund';
  const details = normalizeText(body?.details, 1500) || null;

  if (!reason) {
    return NextResponse.json({ error: 'Return reason is required' }, { status: 400 });
  }

  try {
    const { id } = await params;
    const context = await loadOrderContext(ctx.adminClient, id, ctx.user.id);

    if (!context.order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const eligibility = canRequestReturn(context.order);
    if (!eligibility.allowed) {
      return NextResponse.json({ error: eligibility.reason }, { status: 409 });
    }

    const saveResult = await ctx.adminClient
      .from('order_return_requests')
      .upsert({
        order_id: context.order.id,
        user_id: ctx.user.id,
        store_id: context.storeId,
        status: 'pending',
        refund_status: 'not_requested',
        reason,
        requested_resolution: requestedResolution,
        details,
        buyer_note: null,
        seller_note: null,
        admin_note: null,
        refund_amount: null,
        refund_reference: null,
        approved_at: null,
        received_at: null,
        refund_requested_at: null,
        refunded_at: null,
        reviewed_at: null,
        reviewed_by: null,
      }, { onConflict: 'order_id' })
      .select('id, order_id, status, refund_status, reason, requested_resolution, details, created_at, updated_at')
      .single();

    if (isMissingReturnsTableError(saveResult.error)) {
      return NextResponse.json({ error: MISSING_TABLE_HINT }, { status: 500 });
    }

    if (saveResult.error) {
      return NextResponse.json({ error: saveResult.error.message || 'Failed to submit return request' }, { status: 400 });
    }

    const { data: memberships } = await ctx.adminClient
      .from('store_users')
      .select('user_id, role, status')
      .eq('store_id', context.storeId)
      .eq('status', 'active');

    const sellerUserIds = [...new Set((memberships || []).map((row) => row.user_id).filter(Boolean))];
    for (const sellerUserId of sellerUserIds) {
      await createUserNotification(ctx.adminClient, {
        userId: sellerUserId,
        storeId: context.storeId,
        type: 'return_request_created',
        title: `New return request for order ${context.order.id.slice(0, 8)}`,
        body: `A buyer requested a return${context.storeName ? ` for ${context.storeName}` : ''}.`,
        actionUrl: `/store/dashboard/orders/${context.order.id}`,
        entityType: 'order_return_request',
        entityId: saveResult.data.id,
      });
    }

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'account-orders-service',
      action: 'ORDER_RETURN_REQUEST_CREATED',
      status: 'success',
      statusCode: 200,
      userId: ctx.user.id,
      message: 'Order return request submitted',
      metadata: {
        orderId: context.order.id,
        storeId: context.storeId,
        requestedResolution,
      },
    });

    return NextResponse.json({ success: true, data: saveResult.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to submit return request' }, { status: 500 });
  }
}
