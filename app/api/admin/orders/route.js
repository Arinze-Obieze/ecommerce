import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/utils/adminAuth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function toNullableInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function getRangeStart(range) {
  const now = Date.now();
  switch (range) {
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90d':
    default:
      return new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();
  }
}

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_orders_read',
    identifier: admin.user.id,
    limit: 180,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get('page'), 1);
  const limit = Math.min(100, toPositiveInt(searchParams.get('limit'), 25));
  const range = (searchParams.get('range') || '90d').trim();
  const status = (searchParams.get('status') || '').trim();
  const minItems = toNullableInt(searchParams.get('minItems'));
  const maxItems = toNullableInt(searchParams.get('maxItems'));

  const rangeStart = getRangeStart(range);

  let ordersQuery = admin.adminClient
    .from('orders')
    .select('id, user_id, total_amount, status, payment_reference, created_at, updated_at')
    .gte('created_at', rangeStart)
    .order('created_at', { ascending: false })
    .limit(2000);

  if (status) {
    ordersQuery = ordersQuery.eq('status', status);
  }

  const { data: orders, error } = await ordersQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orderIds = (orders || []).map((o) => o.id);
  const { data: orderItems, error: itemsError } = orderIds.length
    ? await admin.adminClient.from('order_items').select('order_id, quantity').in('order_id', orderIds)
    : { data: [], error: null };

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const itemCountMap = new Map();
  for (const item of orderItems || []) {
    itemCountMap.set(item.order_id, (itemCountMap.get(item.order_id) || 0) + Number(item.quantity || 0));
  }

  let filtered = (orders || []).map((order) => ({
    ...order,
    items_count: itemCountMap.get(order.id) || 0,
  }));

  if (minItems !== null) {
    filtered = filtered.filter((o) => o.items_count >= minItems);
  }
  if (maxItems !== null) {
    filtered = filtered.filter((o) => o.items_count <= maxItems);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data,
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
      filters: {
        range,
        status,
        minItems,
        maxItems,
      },
    },
  });
}
