import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { getPagination, paginateArray, paginationMeta } from '@/utils/platform/pagination';
import { privateJson } from '@/utils/platform/api-response';

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_orders_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { searchParams } = new URL(request.url);
  const { page, limit } = getPagination(searchParams, { defaultLimit: 25, maxLimit: 100 });

  const { data: productRows, error: productError } = await ctx.adminClient
    .from('products')
    .select('id')
    .eq('store_id', ctx.membership.store_id)
    .limit(5000);

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  const productIds = (productRows || []).map((row) => row.id);
  if (productIds.length === 0) {
    return privateJson({ success: true, data: [], meta: paginationMeta({ page: 1, limit, total: 0 }) });
  }

  const { data: orderItems, error: itemsError } = await ctx.adminClient
    .from('order_items')
    .select('order_id, product_id, quantity, price')
    .in('product_id', productIds)
    .limit(10000);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const orderIds = [...new Set((orderItems || []).map((row) => row.order_id).filter(Boolean))];
  if (orderIds.length === 0) {
    return privateJson({ success: true, data: [], meta: paginationMeta({ page: 1, limit, total: 0 }) });
  }

  const { data: orders, error: ordersError } = await ctx.adminClient
    .from('orders')
    .select('id, status, fulfillment_status, escrow_status, total_amount, payment_reference, created_at')
    .in('id', orderIds)
    .order('created_at', { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const itemByOrder = new Map();
  for (const item of orderItems || []) {
    const current = itemByOrder.get(item.order_id) || { itemsCount: 0, subtotal: 0 };
    current.itemsCount += Number(item.quantity || 0);
    current.subtotal += Number(item.quantity || 0) * Number(item.price || 0);
    itemByOrder.set(item.order_id, current);
  }

  const enriched = (orders || []).map((order) => {
    const stats = itemByOrder.get(order.id) || { itemsCount: 0, subtotal: 0 };
    return {
      ...order,
      items_count: stats.itemsCount,
      store_subtotal: Number(stats.subtotal.toFixed(2)),
    };
  });

  const paginated = paginateArray(enriched, { page, limit });

  return privateJson({
    success: true,
    data: paginated.data,
    meta: paginated.meta,
  });
}
