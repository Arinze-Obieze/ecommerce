import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { enforceRateLimit, rateLimitHeaders, rateLimitPayload } from '@/utils/rateLimit';

function normalizeEventType(value) {
  const eventType = String(value || '').trim().toLowerCase();
  if (['add', 'remove', 'set_quantity', 'clear'].includes(eventType)) return eventType;
  return null;
}

export async function POST(request) {
  const authClient = await createClient();
  const adminClient = await createAdminClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  const body = await request.json().catch(() => ({}));
  const identifier = user?.id || body?.session_id || request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await enforceRateLimit({
    request,
    scope: 'cart_event_write',
    identifier,
    limit: 600,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      rateLimitPayload('Cart analytics tracking is temporarily throttled because too many cart events were sent in a short time. Please wait a moment and try again.', rateLimit),
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const eventType = normalizeEventType(body?.event_type);
  const sessionId = String(body?.session_id || '').trim() || null;
  const item = body?.item || {};
  const productId = Number.parseInt(item?.product_id, 10);
  const quantity = Math.max(1, Number.parseInt(item?.quantity || '1', 10) || 1);

  if (!eventType) {
    return NextResponse.json({ error: 'Valid event_type is required' }, { status: 400 });
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: 'Valid item.product_id is required' }, { status: 400 });
  }

  let storeId = String(item?.store_id || '').trim() || null;
  if (!storeId) {
    const { data: product } = await adminClient
      .from('products')
      .select('id, store_id')
      .eq('id', productId)
      .maybeSingle();
    storeId = product?.store_id || null;
  }

  const payload = {
    event_type: eventType,
    user_id: user?.id || null,
    session_id: sessionId,
    product_id: productId,
    store_id: storeId,
    quantity,
    metadata: {
      source: 'frontend',
      variant_id: item?.variant_id || null,
    },
  };

  const { error } = await adminClient.from('cart_events').insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
