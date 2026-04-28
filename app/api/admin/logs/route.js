import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/admin/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { getPagination, paginationMeta } from '@/utils/platform/pagination';
import { privateJson } from '@/utils/platform/api-response';

export async function GET(request) {
  const admin = await requireAdminApi([ADMIN_ROLES.ANALYST, ADMIN_ROLES.SUPPORT_ADMIN, ADMIN_ROLES.OPS_ADMIN, ADMIN_ROLES.SUPER_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_logs_read',
    identifier: admin.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { searchParams } = new URL(request.url);
  const { page, limit, from: rangeFrom, to: rangeTo } = getPagination(searchParams, { defaultLimit: 40, maxLimit: 100 });

  const level = (searchParams.get('level') || '').trim();
  const service = (searchParams.get('service') || '').trim();
  const action = (searchParams.get('action') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const from = (searchParams.get('from') || '').trim();
  const to = (searchParams.get('to') || '').trim();
  const search = (searchParams.get('search') || '').trim();

  let query = admin.adminClient
    .from('activity_logs')
    .select(
      'id, created_at, request_id, user_id, ip_address, user_agent, level, service, action, status, status_code, message, error_code, duration_ms, metadata',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (level) query = query.eq('level', level);
  if (service) query = query.eq('service', service);
  if (action) query = query.eq('action', action);
  if (status) query = query.eq('status', status);
  if (from) query = query.gte('created_at', new Date(from).toISOString());
  if (to) query = query.lte('created_at', new Date(to).toISOString());

  if (search) {
    query = query.or(`message.ilike.%${search}%,action.ilike.%${search}%,service.ilike.%${search}%`);
  }

  query = query.range(rangeFrom, rangeTo);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: last24Logs, error: last24Error } = await admin.adminClient
    .from('activity_logs')
    .select('level, action, service, status, status_code, duration_ms, created_at')
    .gte('created_at', since24h);

  if (last24Error) {
    return NextResponse.json({ error: last24Error.message }, { status: 500 });
  }

  const logs24 = last24Logs || [];
  const errorCounts = logs24.filter((l) => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  const warnCounts = logs24.filter((l) => l.level === 'WARN').length;
  const paymentFailures = logs24.filter((l) => l.action?.startsWith('PAYMENT_') && l.status === 'failure').length;
  const rateLimitHits = logs24.filter((l) => l.status_code === 429).length;

  const apiDurations = logs24
    .map((l) => Number(l.duration_ms))
    .filter((v) => Number.isFinite(v) && v >= 0)
    .sort((a, b) => a - b);

  const p95 = apiDurations.length ? apiDurations[Math.floor((apiDurations.length - 1) * 0.95)] : 0;

  const topFailingActions = [...logs24
    .filter((l) => l.level === 'ERROR' || l.level === 'CRITICAL' || l.status === 'failure')
    .reduce((map, item) => {
      const key = `${item.service}:${item.action}`;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map())]
    .map(([key, occurrences]) => {
      const [svc, act] = key.split(':');
      return { service: svc, action: act, occurrences };
    })
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);

  return privateJson({
    success: true,
    data: data || [],
    meta: paginationMeta({ page, limit, total: count || 0 }),
    summary24h: {
      errors: errorCounts,
      warnings: warnCounts,
      paymentFailures,
      rateLimitHits,
      apiP95LatencyMs: p95,
      topFailingActions,
    },
  });
}
