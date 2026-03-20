import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';

function money(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
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

  const [productsRes, teamRes, storeEscrowRes, storePayoutRes, storeOrdersRes, cartEventsRes] = await Promise.all([
    ctx.adminClient
      .from('products')
      .select('id, stock_quantity, is_active, moderation_status, created_at')
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
    ctx.adminClient
      .from('order_items')
      .select('order_id, quantity, price, product_id')
      .in(
        'product_id',
        (await ctx.adminClient.from('products').select('id').eq('store_id', storeId)).data?.map((p) => p.id) || [-1]
      )
      .limit(5000),
    ctx.adminClient
      .from('cart_events')
      .select('id, event_type, product_id, quantity, created_at')
      .eq('store_id', storeId)
      .gte('created_at', since7d)
      .limit(5000),
  ]);

  const products = productsRes.data || [];
  const team = teamRes.data || [];
  const escrowRows = storeEscrowRes.data || [];
  const payoutRows = storePayoutRes.data || [];
  const storeOrderItems = storeOrdersRes.data || [];
  const cartEvents = cartEventsRes.data || [];

  const productIds = products.map((p) => p.id);
  const orderIds = [...new Set(storeOrderItems.map((item) => item.order_id))];

  const { data: orders } = orderIds.length
    ? await ctx.adminClient
        .from('orders')
        .select('id, status, escrow_status, fulfillment_status, created_at, total_amount')
        .in('id', orderIds)
    : { data: [] };

  const ordersById = new Map((orders || []).map((row) => [row.id, row]));

  const orderMetrics = {
    totalOrders: 0,
    paidOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    grossSales: 0,
  };

  for (const item of storeOrderItems) {
    const order = ordersById.get(item.order_id);
    if (!order) continue;
    orderMetrics.totalOrders += 1;
    if (order.status === 'completed') orderMetrics.paidOrders += 1;
    if ((order.fulfillment_status || '').toLowerCase() === 'processing') orderMetrics.processingOrders += 1;
    if ((order.fulfillment_status || '').toLowerCase() === 'delivered_confirmed') orderMetrics.deliveredOrders += 1;
    orderMetrics.grossSales += money(Number(item.quantity || 0) * Number(item.price || 0));
  }

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

  const addEvents = cartEvents.filter((row) => row.event_type === 'add');
  const removeEvents = cartEvents.filter((row) => row.event_type === 'remove');
  const cartDemandUnits7d = addEvents.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
    - removeEvents.reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  const cartDemandProducts7d = new Set(addEvents.map((row) => row.product_id)).size;

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
        held: escrowHeld,
        released: escrowReleased,
        queuedPayoutAmount: payoutsQueued,
        releasedPayoutAmount: payoutsReleased,
      },
      cartDemand: {
        productsInCarts7d: cartDemandProducts7d,
        unitsInCarts7d: Math.max(0, cartDemandUnits7d),
      },
      meta: {
        since7d,
        productCountForOrderJoin: productIds.length,
      },
    },
  });
}
