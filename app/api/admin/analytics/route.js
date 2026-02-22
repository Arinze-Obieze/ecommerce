import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/utils/adminAuth';
import { enforceRateLimit } from '@/utils/rateLimit';

function dayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function actorKey(event) {
  return event.user_id || event.anon_id || event.session_id || null;
}

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_analytics_read',
    identifier: admin.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const now = Date.now();
  const last30Iso = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const last90Iso = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [eventsRes, ordersRes, usersRes, logsRes] = await Promise.all([
    admin.adminClient
      .from('analytics_events')
      .select('id, created_at, event_name, user_id, session_id, anon_id, device_type, state, country, properties')
      .gte('created_at', last30Iso),
    admin.adminClient
      .from('orders')
      .select('id, user_id, created_at, status, total_amount')
      .gte('created_at', last90Iso),
    admin.adminClient
      .from('users')
      .select('id, created_at, state')
      .gte('created_at', last90Iso),
    admin.adminClient
      .from('activity_logs')
      .select('created_at, action, service, status, level')
      .gte('created_at', last30Iso),
  ]);

  if (eventsRes.error || ordersRes.error || usersRes.error || logsRes.error) {
    return NextResponse.json(
      { error: eventsRes.error?.message || ordersRes.error?.message || usersRes.error?.message || logsRes.error?.message },
      { status: 500 }
    );
  }

  const events = eventsRes.data || [];
  const orders = (ordersRes.data || []).filter((o) => new Date(o.created_at).toISOString() >= last30Iso);
  const orders90 = ordersRes.data || [];
  const users = usersRes.data || [];
  const logs = logsRes.data || [];

  const uniqueUsersByDay = new Map();
  for (const event of events) {
    const key = dayKey(event.created_at);
    if (!uniqueUsersByDay.has(key)) uniqueUsersByDay.set(key, new Set());
    const actor = actorKey(event);
    if (actor) uniqueUsersByDay.get(key).add(actor);
  }

  const dauTrend = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dauTrend.push({ day: key, dau: uniqueUsersByDay.get(key)?.size || 0 });
  }

  const allActors30 = new Set(events.map(actorKey).filter(Boolean));
  const actors7 = new Set(events.filter((e) => new Date(e.created_at).getTime() >= now - 7 * 24 * 60 * 60 * 1000).map(actorKey).filter(Boolean));
  const actors1 = new Set(events.filter((e) => new Date(e.created_at).getTime() >= now - 24 * 60 * 60 * 1000).map(actorKey).filter(Boolean));

  const funnel = {
    view_item: new Set(events.filter((e) => e.event_name === 'view_item').map(actorKey).filter(Boolean)).size,
    add_to_cart: new Set(events.filter((e) => e.event_name === 'add_to_cart').map(actorKey).filter(Boolean)).size,
    begin_checkout: new Set(events.filter((e) => e.event_name === 'begin_checkout').map(actorKey).filter(Boolean)).size,
    purchase: new Set(events.filter((e) => e.event_name === 'purchase').map(actorKey).filter(Boolean)).size,
  };

  if (funnel.purchase === 0) {
    funnel.purchase = new Set(
      orders
        .filter((o) => o.status === 'completed')
        .map((o) => o.user_id || o.id)
        .filter(Boolean)
    ).size;
  }

  const searchEvents = events.filter((e) => e.event_name === 'search');
  const searchTermMap = new Map();
  let zeroResultSearches = 0;

  for (const event of searchEvents) {
    const query = String(event.properties?.query || '').trim().toLowerCase();
    if (query) {
      searchTermMap.set(query, (searchTermMap.get(query) || 0) + 1);
    }
    const resultCount = Number(event.properties?.results_count);
    if (Number.isFinite(resultCount) && resultCount === 0) {
      zeroResultSearches += 1;
    }
  }

  const topSearchTerms = [...searchTermMap.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const completedByUser = new Map();
  for (const order of orders90.filter((o) => o.status === 'completed' && o.user_id)) {
    const arr = completedByUser.get(order.user_id) || [];
    arr.push(order.created_at);
    completedByUser.set(order.user_id, arr);
  }

  let newBuyers = 0;
  let returningBuyers = 0;
  for (const [, dates] of completedByUser) {
    const inLast30 = dates.some((d) => new Date(d).toISOString() >= last30Iso);
    if (!inLast30) continue;
    if (dates.length === 1) newBuyers += 1;
    else returningBuyers += 1;
  }

  const revenueByDayMap = new Map();
  for (const order of orders.filter((o) => o.status === 'completed')) {
    const key = dayKey(order.created_at);
    revenueByDayMap.set(key, (revenueByDayMap.get(key) || 0) + Number(order.total_amount || 0));
  }

  const revenueTrend = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    revenueTrend.push({ day: key, revenue: Number((revenueByDayMap.get(key) || 0).toFixed(2)) });
  }

  const ordersByState = new Map();
  const usersStateById = new Map(users.map((u) => [u.id, u.state || 'Unknown']));
  for (const order of orders.filter((o) => o.status === 'completed')) {
    const state = usersStateById.get(order.user_id) || 'Unknown';
    ordersByState.set(state, (ordersByState.get(state) || 0) + 1);
  }

  const deviceMap = new Map();
  for (const event of events) {
    const key = event.device_type || 'unknown';
    deviceMap.set(key, (deviceMap.get(key) || 0) + 1);
  }

  const failingActions = [...logs
    .filter((l) => l.status === 'failure' || l.level === 'ERROR' || l.level === 'CRITICAL')
    .reduce((map, entry) => {
      const key = `${entry.service}:${entry.action}`;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map())]
    .map(([key, count]) => {
      const [service, action] = key.split(':');
      return { service, action, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    success: true,
    data: {
      acquisition: {
        dau: actors1.size,
        wau: actors7.size,
        mau: allActors30.size,
        dauTrend,
      },
      funnel,
      behavior: {
        topSearchTerms,
        zeroResultSearches,
      },
      cohorts: {
        newBuyers,
        returningBuyers,
      },
      commerce: {
        revenueTrend,
        completedOrders: orders.filter((o) => o.status === 'completed').length,
      },
      geography: {
        ordersByState: [...ordersByState.entries()]
          .map(([state, count]) => ({ state, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      },
      devices: [...deviceMap.entries()]
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
      reliability: {
        failingActions,
      },
    },
  });
}
