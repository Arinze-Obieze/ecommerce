import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import {
  isMissingNotificationsTableError,
  NOTIFICATIONS_MIGRATION_HINT,
} from '@/utils/messaging/notifications';

async function getAuthedContext(request) {
  const authClient = await createClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'account_notifications',
    identifier: user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return { ok: false, response: NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) }) };
  }

  const adminClient = await createAdminClient();
  return { ok: true, user, adminClient };
}

export async function GET(request) {
  const ctx = await getAuthedContext(request);
  if (!ctx.ok) return ctx.response;

  const result = await ctx.adminClient
    .from('user_notifications')
    .select('id, type, title, body, action_url, entity_type, entity_id, status, metadata, read_at, created_at, store_id')
    .eq('user_id', ctx.user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (isMissingNotificationsTableError(result.error)) {
    return NextResponse.json({ error: NOTIFICATIONS_MIGRATION_HINT }, { status: 500 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message || 'Failed to load notifications' }, { status: 500 });
  }

  const rows = result.data || [];
  return NextResponse.json({
    success: true,
    data: rows,
    meta: {
      unreadCount: rows.filter((row) => row.status === 'unread').length,
    },
  });
}

export async function PATCH(request) {
  const ctx = await getAuthedContext(request);
  if (!ctx.ok) return ctx.response;

  const body = await request.json().catch(() => ({}));
  const notificationId = String(body?.notificationId || '').trim();
  const markAllRead = body?.markAllRead === true;
  const nextStatus = String(body?.status || 'read').trim().toLowerCase();

  if (!['read', 'archived', 'unread'].includes(nextStatus)) {
    return NextResponse.json({ error: 'Status must be unread, read, or archived' }, { status: 400 });
  }

  let query = ctx.adminClient
    .from('user_notifications')
    .update({
      status: nextStatus,
      read_at: nextStatus === 'unread' ? null : new Date().toISOString(),
    })
    .eq('user_id', ctx.user.id);

  if (markAllRead) {
    query = query.in('status', ['unread', 'read']);
  } else {
    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required unless markAllRead is true' }, { status: 400 });
    }
    query = query.eq('id', notificationId);
  }

  const result = await query.select('id, status, read_at');

  if (isMissingNotificationsTableError(result.error)) {
    return NextResponse.json({ error: NOTIFICATIONS_MIGRATION_HINT }, { status: 500 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message || 'Failed to update notifications' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: result.data || [] });
}
