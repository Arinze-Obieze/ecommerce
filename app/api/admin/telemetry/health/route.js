import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/admin/auth';
import { getRedisHealth } from '@/utils/platform/redis';

export async function GET() {
  const admin = await requireAdminApi([ADMIN_ROLES.ANALYST, ADMIN_ROLES.SUPPORT_ADMIN, ADMIN_ROLES.OPS_ADMIN, ADMIN_ROLES.SUPER_ADMIN]);
  if (!admin.ok) return admin.response;

  const now = Date.now();
  const last5m = new Date(now - 5 * 60 * 1000).toISOString();
  const last24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const [events5m, events24h, logs5m, logs24h, redis] = await Promise.all([
    admin.adminClient.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', last5m),
    admin.adminClient.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', last24h),
    admin.adminClient.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', last5m),
    admin.adminClient.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', last24h),
    getRedisHealth(),
  ]);

  if (events5m.error || events24h.error || logs5m.error || logs24h.error) {
    return NextResponse.json(
      {
        error: events5m.error?.message || events24h.error?.message || logs5m.error?.message || logs24h.error?.message,
      },
      { status: 500 }
    );
  }

  const analytics5m = events5m.count || 0;
  const analytics24h = events24h.count || 0;
  const logsRecent5m = logs5m.count || 0;
  const logsRecent24h = logs24h.count || 0;

  let status = 'healthy';
  if (!redis.connected || analytics24h === 0 || logsRecent24h === 0) {
    status = 'critical';
  } else if (analytics5m === 0 || logsRecent5m === 0) {
    status = 'degraded';
  }

  return NextResponse.json({
    success: true,
    data: {
      status,
      analytics: {
        events5m: analytics5m,
        events24h: analytics24h,
      },
      logs: {
        logs5m: logsRecent5m,
        logs24h: logsRecent24h,
      },
      redis,
      generatedAt: new Date().toISOString(),
    },
  });
}
