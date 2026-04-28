import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/admin/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '');
}

function dayKey(dateValue) {
  const date = new Date(dateValue);
  return date.toISOString().slice(0, 10);
}

export async function GET(request) {
  const admin = await requireAdminApi([ADMIN_ROLES.ANALYST, ADMIN_ROLES.SUPPORT_ADMIN, ADMIN_ROLES.OPS_ADMIN, ADMIN_ROLES.SUPER_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_overview',
    identifier: admin.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many admin overview requests', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const supabase = admin.adminClient;
  const now = Date.now();
  const last30Iso = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const last14Iso = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
  const last24Iso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const twentyMinutesAgoIso = new Date(now - 20 * 60 * 1000).toISOString();

  const [ordersRes, storesRes, productsRes, logs24Res, logs14Res] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total_amount, created_at, payment_reference, user_id')
      .gte('created_at', last30Iso),
    supabase.from('stores').select('id, status, created_at'),
    supabase.from('products').select('id, store_id, stock_quantity, price, discount_price, is_active'),
    supabase
      .from('activity_logs')
      .select('id, level, action, status, service, duration_ms, created_at, ip_address')
      .gte('created_at', last24Iso),
    supabase
      .from('activity_logs')
      .select('id, level, created_at')
      .gte('created_at', last14Iso),
  ]);

  if (ordersRes.error || storesRes.error || productsRes.error || logs24Res.error || logs14Res.error) {
    return NextResponse.json(
      {
        error: ordersRes.error?.message || storesRes.error?.message || productsRes.error?.message || logs24Res.error?.message || logs14Res.error?.message,
      },
      { status: 500 }
    );
  }

  const orders = ordersRes.data || [];
  const stores = storesRes.data || [];
  const products = productsRes.data || [];
  const logs24 = logs24Res.data || [];
  const logs14 = logs14Res.data || [];

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const gmvPaid = completedOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const gmvTotal = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const paidOrderCount = completedOrders.length;
  const aovPaid = paidOrderCount > 0 ? gmvPaid / paidOrderCount : 0;

  const activeStores = stores.filter((s) => s.status === 'active').length;
  const pendingStores = stores.filter((s) => s.status === 'pending').length;
  const suspendedStores = stores.filter((s) => s.status === 'suspended').length;

  const outOfStock = products.filter((p) => Number(p.stock_quantity) <= 0).length;
  const lowStock = products.filter((p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5).length;

  const stockAtRiskGmv = products
    .filter((p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5)
    .reduce((acc, p) => acc + Number(p.discount_price ?? p.price ?? 0) * Number(p.stock_quantity || 0), 0);

  const stuckPending = pendingOrders.filter(
    (o) => !o.payment_reference && new Date(o.created_at).toISOString() < twentyMinutesAgoIso
  ).length;

  const paymentLogs = logs24.filter((l) => l.action?.startsWith('PAYMENT_'));
  const paymentFailures = paymentLogs.filter((l) => l.status === 'failure').length;
  const paymentFailureRate = paymentLogs.length > 0 ? (paymentFailures / paymentLogs.length) * 100 : 0;

  const suspiciousIpCount = new Set(
    logs24
      .filter((l) => l.level === 'WARN' || l.level === 'ERROR' || l.level === 'CRITICAL')
      .map((l) => l.ip_address)
      .filter(Boolean)
  ).size;

  const reliabilityErrors24h = logs24.filter((l) => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  const p95LatencyMs = (() => {
    const durations = logs24.map((l) => Number(l.duration_ms)).filter((v) => Number.isFinite(v) && v >= 0).sort((a, b) => a - b);
    if (durations.length === 0) return 0;
    return durations[Math.floor((durations.length - 1) * 0.95)] || 0;
  })();

  const completedOrderIds = completedOrders.map((o) => o.id).filter(isUuid);
  let topStores = [];

  if (completedOrderIds.length > 0) {
    const orderItemsRes = await supabase
      .from('order_items')
      .select('order_id, product_id, quantity, price')
      .in('order_id', completedOrderIds);

    if (!orderItemsRes.error) {
      const orderItems = orderItemsRes.data || [];
      const productIds = [...new Set(orderItems.map((i) => i.product_id).filter(Boolean))];
      if (productIds.length > 0) {
        const productMapRes = await supabase
          .from('products')
          .select('id, store_id')
          .in('id', productIds);

        if (!productMapRes.error) {
          const productsById = new Map((productMapRes.data || []).map((p) => [p.id, p]));
          const storeTotals = new Map();

          for (const item of orderItems) {
            const product = productsById.get(item.product_id);
            if (!product?.store_id) continue;

            const current = storeTotals.get(product.store_id) || { revenue: 0, orders: new Set() };
            current.revenue += Number(item.price || 0) * Number(item.quantity || 0);
            current.orders.add(item.order_id);
            storeTotals.set(product.store_id, current);
          }

          const storeIds = [...storeTotals.keys()];
          if (storeIds.length > 0) {
            const storeRowsRes = await supabase
              .from('stores')
              .select('id, name, slug, status')
              .in('id', storeIds);

            if (!storeRowsRes.error) {
              const storeRows = storeRowsRes.data || [];
              topStores = storeRows
                .map((store) => ({
                  id: store.id,
                  name: store.name,
                  slug: store.slug,
                  status: store.status,
                  revenue: Number((storeTotals.get(store.id)?.revenue || 0).toFixed(2)),
                  orders: storeTotals.get(store.id)?.orders.size || 0,
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 8);
            }
          }
        }
      }
    }
  }

  const revenueByDayMap = new Map();
  for (const order of completedOrders.filter((o) => new Date(o.created_at).toISOString() >= last14Iso)) {
    const key = dayKey(order.created_at);
    revenueByDayMap.set(key, (revenueByDayMap.get(key) || 0) + Number(order.total_amount || 0));
  }

  const errorByDayMap = new Map();
  for (const log of logs14.filter((l) => l.level === 'ERROR' || l.level === 'CRITICAL')) {
    const key = dayKey(log.created_at);
    errorByDayMap.set(key, (errorByDayMap.get(key) || 0) + 1);
  }

  const trends = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    trends.push({
      day: key,
      revenue: Number((revenueByDayMap.get(key) || 0).toFixed(2)),
      errors: errorByDayMap.get(key) || 0,
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      kpis: {
        totalOrders,
        paidOrders: paidOrderCount,
        pendingOrders: pendingOrders.length,
        cancelledOrders: cancelledOrders.length,
        gmvPaid: Number(gmvPaid.toFixed(2)),
        gmvTotal: Number(gmvTotal.toFixed(2)),
        aovPaid: Number(aovPaid.toFixed(2)),
        conversionProxy: totalOrders > 0 ? Number(((paidOrderCount / totalOrders) * 100).toFixed(2)) : 0,
        refundOrCancelRate: totalOrders > 0 ? Number(((cancelledOrders.length / totalOrders) * 100).toFixed(2)) : 0,
      },
      stores: {
        active: activeStores,
        pending: pendingStores,
        suspended: suspendedStores,
      },
      inventory: {
        outOfStock,
        lowStock,
        stockAtRiskGmv: Number(stockAtRiskGmv.toFixed(2)),
      },
      operations: {
        stuckPending,
        paymentFailureRate: Number(paymentFailureRate.toFixed(2)),
        reliabilityErrors24h,
        p95LatencyMs,
        suspiciousIpCount,
      },
      topStores,
      trends,
    },
  });
}
