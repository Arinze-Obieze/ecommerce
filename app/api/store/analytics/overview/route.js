import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitHeaders, rateLimitPayload } from '@/utils/platform/rate-limit';

function money(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
}

function utcDayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function utcMonthKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 7);
}

function addUtcMonths(date, amount) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
  return next;
}

function parseRange(value, storeCreatedAt) {
  const normalized = String(value || '').trim().toLowerCase();
  const presets = {
    '7d': { days: 7, label: '7 days' },
    '30d': { days: 30, label: '30 days' },
    '90d': { days: 90, label: '90 days' },
    '1y': { days: 365, label: '1 year' },
  };

  if (normalized === 'all') {
    const createdAt = new Date(storeCreatedAt || Date.now());
    const since = Number.isNaN(createdAt.getTime()) ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) : createdAt;
    return {
      key: 'all',
      label: 'Since opening',
      since: since.toISOString(),
      granularity: (Date.now() - since.getTime()) / (24 * 60 * 60 * 1000) > 120 ? 'month' : 'day',
    };
  }

  const preset = presets[normalized] || presets['30d'];
  return {
    key: presets[normalized] ? normalized : '30d',
    label: preset.label,
    since: new Date(Date.now() - (preset.days - 1) * 24 * 60 * 60 * 1000).toISOString(),
    granularity: preset.days > 120 ? 'month' : 'day',
  };
}

function buildDaySeriesFrom(startIso) {
  const start = new Date(startIso);
  const startTime = Number.isNaN(start.getTime()) ? Date.now() : start.getTime();
  const startDay = new Date(startTime);
  startDay.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const list = [];
  for (let cursor = startDay; cursor.getTime() <= today.getTime(); cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)) {
    list.push({ period: utcDayKey(cursor.toISOString()), label: utcDayKey(cursor.toISOString()) });
  }
  return list;
}

function buildMonthSeriesFrom(startIso) {
  const start = new Date(startIso);
  const safeStart = Number.isNaN(start.getTime()) ? new Date() : start;
  const startMonth = new Date(Date.UTC(safeStart.getUTCFullYear(), safeStart.getUTCMonth(), 1));
  const now = new Date();
  const endMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const list = [];
  for (let cursor = startMonth; cursor.getTime() <= endMonth.getTime(); cursor = addUtcMonths(cursor, 1)) {
    list.push({ period: utcMonthKey(cursor.toISOString()), label: utcMonthKey(cursor.toISOString()) });
  }
  return list;
}

function buildRangeSeries(range) {
  const base = range.granularity === 'month' ? buildMonthSeriesFrom(range.since) : buildDaySeriesFrom(range.since);
  return base.map((row) => ({ ...row, revenue: 0, orders: 0, netUnits: 0, addUnits: 0, removeUnits: 0 }));
}

function rangeBucketKey(value, granularity) {
  return granularity === 'month' ? utcMonthKey(value) : utcDayKey(value);
}

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_analytics_read',
    identifier: ctx.user.id,
    limit: 240,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      rateLimitPayload('Store analytics is temporarily throttled because the dashboard was refreshed too many times. Please wait a moment and try again.', rateLimit),
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const storeId = ctx.membership.store_id;

  const { data: storeRow, error: storeError } = await ctx.adminClient
    .from('stores')
    .select('id, created_at')
    .eq('id', storeId)
    .maybeSingle();

  if (storeError) {
    return NextResponse.json({ error: storeError.message || 'Failed to load store analytics settings' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const range = parseRange(searchParams.get('range'), storeRow?.created_at);
  const rangeStartTime = new Date(range.since).getTime();

  const productsIdRes = await ctx.adminClient
    .from('products')
    .select('id')
    .eq('store_id', storeId);
  const productIds = (productsIdRes.data || []).map((row) => row.id);

  const [productsRes, teamRes, storeEscrowRes, storePayoutRes, storeOrdersRes, cartEventsRes] = await Promise.all([
    ctx.adminClient
      .from('products')
      .select('id, name, stock_quantity, is_active, moderation_status, created_at')
      .eq('store_id', storeId)
      .limit(5000),
    ctx.adminClient
      .from('store_users')
      .select('id, role, status')
      .eq('store_id', storeId),
    ctx.adminClient
      .from('escrow_transactions')
      .select('id, amount, transaction_type, status, created_at')
      .eq('store_id', storeId)
      .limit(5000),
    ctx.adminClient
      .from('store_payouts')
      .select('id, amount, status, created_at, released_at')
      .eq('store_id', storeId)
      .limit(5000),
    productIds.length > 0
      ? ctx.adminClient
          .from('order_items')
          .select('order_id, quantity, price, product_id')
          .in('product_id', productIds)
          .limit(10000)
      : Promise.resolve({ data: [] }),
    ctx.adminClient
      .from('cart_events')
      .select('id, event_type, product_id, quantity, created_at')
      .eq('store_id', storeId)
      .gte('created_at', range.since)
      .limit(10000),
  ]);

  const products = productsRes.data || [];
  const team = teamRes.data || [];
  const escrowRows = storeEscrowRes.data || [];
  const payoutRows = storePayoutRes.data || [];
  const storeOrderItems = storeOrdersRes.data || [];
  const cartEvents = cartEventsRes.data || [];

  const orderIds = [...new Set(storeOrderItems.map((item) => item.order_id).filter(Boolean))];
  const { data: orders } = orderIds.length
    ? await ctx.adminClient
        .from('orders')
        .select('id, status, escrow_status, fulfillment_status, created_at, total_amount')
        .in('id', orderIds)
    : { data: [] };

  const ordersById = new Map((orders || []).map((row) => [row.id, row]));
  const orderRevenueById = new Map();

  for (const item of storeOrderItems) {
    const orderId = item.order_id;
    if (!orderId) continue;
    const lineAmount = money(Number(item.quantity || 0) * Number(item.price || 0));
    orderRevenueById.set(orderId, money((orderRevenueById.get(orderId) || 0) + lineAmount));
  }

  const uniqueStoreOrders = [...ordersById.values()];

  const orderMetrics = {
    totalOrders: uniqueStoreOrders.length,
    paidOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    grossSales: 0,
  };

  for (const order of uniqueStoreOrders) {
    const fulfillment = String(order.fulfillment_status || '').toLowerCase();
    if (order.status === 'completed') orderMetrics.paidOrders += 1;
    if (fulfillment === 'processing') orderMetrics.processingOrders += 1;
    if (fulfillment === 'delivered_confirmed') orderMetrics.deliveredOrders += 1;
    orderMetrics.grossSales += money(orderRevenueById.get(order.id) || 0);
  }
  orderMetrics.grossSales = money(orderMetrics.grossSales);

  const escrowHeld = escrowRows
    .filter((row) => row.transaction_type === 'hold' && row.status === 'recorded')
    .reduce((sum, row) => sum + money(row.amount), 0);

  const escrowReleased = escrowRows
    .filter((row) => row.transaction_type === 'hold' && row.status === 'released')
    .reduce((sum, row) => sum + money(row.amount), 0);

  const payoutsQueued = payoutRows
    .filter((row) => ['queued', 'pending_gateway'].includes(row.status))
    .reduce((sum, row) => sum + money(row.amount), 0);

  const payoutsReleased = payoutRows
    .filter((row) => row.status === 'released')
    .reduce((sum, row) => sum + money(row.amount), 0);

  const rangeCartEvents = cartEvents.filter((row) => new Date(row.created_at).getTime() >= rangeStartTime);
  const addEvents = rangeCartEvents.filter((row) => row.event_type === 'add');
  const removeEvents = rangeCartEvents.filter((row) => row.event_type === 'remove' || row.event_type === 'clear');
  const cartDemandUnits = addEvents.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
    - removeEvents.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const cartDemandProducts = new Set(addEvents.map((row) => row.product_id)).size;

  const rangeSeriesBase = buildRangeSeries(range);
  const rangeSeriesMap = new Map(rangeSeriesBase.map((row) => [row.period, row]));

  for (const order of uniqueStoreOrders) {
    if (new Date(order.created_at).getTime() < rangeStartTime) continue;
    const key = rangeBucketKey(order.created_at, range.granularity);
    if (!key || !rangeSeriesMap.has(key)) continue;
    const bucket = rangeSeriesMap.get(key);
    bucket.orders += 1;
    if (order.status === 'completed') {
      bucket.revenue = money(bucket.revenue + money(orderRevenueById.get(order.id) || 0));
    }
  }

  for (const row of rangeCartEvents) {
    const key = rangeBucketKey(row.created_at, range.granularity);
    if (!key || !rangeSeriesMap.has(key)) continue;
    const bucket = rangeSeriesMap.get(key);
    const qty = Number(row.quantity || 0);
    if (row.event_type === 'add') {
      bucket.addUnits += qty;
      bucket.netUnits += qty;
    } else if (row.event_type === 'remove' || row.event_type === 'clear') {
      bucket.removeUnits += qty;
      bucket.netUnits -= qty;
    }
  }

  const demandUnitsByProduct = new Map();
  for (const row of rangeCartEvents) {
    if (row.event_type !== 'add') continue;
    const key = row.product_id;
    if (!key) continue;
    demandUnitsByProduct.set(key, (demandUnitsByProduct.get(key) || 0) + Number(row.quantity || 0));
  }

  const productNameById = new Map(products.map((row) => [row.id, row.name]));
  const topDemandProducts = [...demandUnitsByProduct.entries()]
    .map(([productId, units]) => ({
      productId,
      productName: productNameById.get(productId) || `Product #${productId}`,
      units,
    }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  return NextResponse.json({
    success: true,
    data: {
      storeId,
      products: {
        total: products.length,
        active: products.filter((p) => p.is_active).length,
        outOfStock: products.filter((p) => Number(p.stock_quantity || 0) <= 0).length,
        pendingReview: products.filter((p) => p.moderation_status === 'pending_review').length,
        rejected: products.filter((p) => p.moderation_status === 'rejected').length,
      },
      team: {
        active: team.filter((t) => t.status === 'active').length,
        owners: team.filter((t) => t.role === 'owner' && t.status === 'active').length,
        managers: team.filter((t) => t.role === 'manager' && t.status === 'active').length,
        staff: team.filter((t) => t.role === 'staff' && t.status === 'active').length,
      },
      orders: {
        ...orderMetrics,
      },
      escrow: {
        held: money(escrowHeld),
        released: money(escrowReleased),
        queuedPayoutAmount: money(payoutsQueued),
        releasedPayoutAmount: money(payoutsReleased),
      },
      cartDemand: {
        productsInCarts: cartDemandProducts,
        unitsInCarts: Math.max(0, cartDemandUnits),
        eventsCaptured: rangeCartEvents.length,
        productsInCarts7d: cartDemandProducts,
        unitsInCarts7d: Math.max(0, cartDemandUnits),
        eventsCaptured7d: rangeCartEvents.length,
      },
      trends: {
        ordersRevenue: rangeSeriesBase,
        cartNetUnits: rangeSeriesBase,
        topDemandProducts,
        dailyOrdersAndRevenue14d: rangeSeriesBase,
        dailyCartNetUnits7d: rangeSeriesBase,
        topDemandProducts7d: topDemandProducts,
      },
      meta: {
        range,
        storeCreatedAt: storeRow?.created_at || null,
        productCountForOrderJoin: productIds.length,
      },
    },
  });
}
