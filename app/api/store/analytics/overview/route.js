import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';

function money(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
}

function utcDayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function buildDaySeries(days) {
  const list = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    list.push({
      day: utcDayKey(date.toISOString()),
    });
  }
  return list;
}

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_analytics_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const storeId = ctx.membership.store_id;
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

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
      .gte('created_at', since14d)
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

  const cartEvents7d = cartEvents.filter((row) => new Date(row.created_at).getTime() >= new Date(since7d).getTime());
  const addEvents7d = cartEvents7d.filter((row) => row.event_type === 'add');
  const removeEvents7d = cartEvents7d.filter((row) => row.event_type === 'remove');
  const cartDemandUnits7d = addEvents7d.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
    - removeEvents7d.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const cartDemandProducts7d = new Set(addEvents7d.map((row) => row.product_id)).size;

  const dailyRevenueBase = buildDaySeries(14).map((row) => ({ ...row, revenue: 0, orders: 0 }));
  const dailyRevenueMap = new Map(dailyRevenueBase.map((row) => [row.day, row]));

  for (const order of uniqueStoreOrders) {
    const key = utcDayKey(order.created_at);
    if (!key || !dailyRevenueMap.has(key)) continue;
    const bucket = dailyRevenueMap.get(key);
    bucket.orders += 1;
    if (order.status === 'completed') {
      bucket.revenue = money(bucket.revenue + money(orderRevenueById.get(order.id) || 0));
    }
  }

  const dailyCartBase = buildDaySeries(7).map((row) => ({ ...row, netUnits: 0, addUnits: 0, removeUnits: 0 }));
  const dailyCartMap = new Map(dailyCartBase.map((row) => [row.day, row]));

  for (const row of cartEvents7d) {
    const key = utcDayKey(row.created_at);
    if (!key || !dailyCartMap.has(key)) continue;
    const bucket = dailyCartMap.get(key);
    const qty = Number(row.quantity || 0);
    if (row.event_type === 'add') {
      bucket.addUnits += qty;
      bucket.netUnits += qty;
    } else if (row.event_type === 'remove') {
      bucket.removeUnits += qty;
      bucket.netUnits -= qty;
    }
  }

  const demandUnitsByProduct = new Map();
  for (const row of cartEvents7d) {
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
        productsInCarts7d: cartDemandProducts7d,
        unitsInCarts7d: Math.max(0, cartDemandUnits7d),
        eventsCaptured7d: cartEvents7d.length,
      },
      trends: {
        dailyOrdersAndRevenue14d: dailyRevenueBase,
        dailyCartNetUnits7d: dailyCartBase,
        topDemandProducts7d: topDemandProducts,
      },
      meta: {
        since7d,
        since14d,
        productCountForOrderJoin: productIds.length,
      },
    },
  });
}
