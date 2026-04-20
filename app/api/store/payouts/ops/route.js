import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { writeActivityLog } from '@/utils/telemetry/server';
import { createUserNotification } from '@/utils/messaging/notifications';
import { sendPayoutExceptionEmail } from '@/utils/messaging/email-notifications';

const MIGRATION_HINT =
  'Database is missing public.store_payout_reconciliations or public.store_payout_exceptions. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function normalizeText(value, max = 2000) {
  const text = String(value || '').trim().slice(0, max);
  return text || null;
}

function isMissingOpsTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    message.includes('store_payout_reconciliations') ||
    message.includes('store_payout_exceptions');
}

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_payouts_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const [reconciliations, exceptions] = await Promise.all([
    ctx.adminClient
      .from('store_payout_reconciliations')
      .select('id, payout_id, escrow_transaction_id, status, notes, amount_expected, amount_recorded, resolved_at, resolved_by, created_by, created_at, updated_at')
      .eq('store_id', ctx.membership.store_id)
      .order('created_at', { ascending: false })
      .limit(100),
    ctx.adminClient
      .from('store_payout_exceptions')
      .select('id, payout_id, severity, status, category, summary, details, assigned_to, resolved_at, resolved_by, created_by, created_at, updated_at')
      .eq('store_id', ctx.membership.store_id)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  if (isMissingOpsTableError(reconciliations.error) || isMissingOpsTableError(exceptions.error)) {
    return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
  }

  if (reconciliations.error || exceptions.error) {
    return NextResponse.json({ error: reconciliations.error?.message || exceptions.error?.message || 'Failed to load payout operations' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      reconciliations: reconciliations.data || [],
      exceptions: exceptions.data || [],
    },
  });
}

export async function POST(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_payouts_write',
    identifier: ctx.user.id,
    limit: 30,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const type = String(body?.type || '').trim().toLowerCase();

  if (type === 'reconciliation') {
    const result = await ctx.adminClient
      .from('store_payout_reconciliations')
      .insert({
        store_id: ctx.membership.store_id,
        payout_id: normalizeText(body?.payout_id, 255),
        escrow_transaction_id: normalizeText(body?.escrow_transaction_id, 255),
        status: 'open',
        notes: normalizeText(body?.notes, 1500),
        amount_expected: body?.amount_expected === '' || body?.amount_expected === undefined ? null : Number(body.amount_expected),
        amount_recorded: body?.amount_recorded === '' || body?.amount_recorded === undefined ? null : Number(body.amount_recorded),
        created_by: ctx.user.id,
      })
      .select('id, payout_id, escrow_transaction_id, status, notes, amount_expected, amount_recorded, resolved_at, resolved_by, created_by, created_at, updated_at')
      .single();

    if (isMissingOpsTableError(result.error)) {
      return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to log reconciliation item' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  }

  if (type === 'exception') {
    const summary = normalizeText(body?.summary, 255);
    const category = normalizeText(body?.category, 80);
    if (!summary || !category) {
      return NextResponse.json({ error: 'summary and category are required' }, { status: 400 });
    }

    const result = await ctx.adminClient
      .from('store_payout_exceptions')
      .insert({
        store_id: ctx.membership.store_id,
        payout_id: normalizeText(body?.payout_id, 255),
        severity: normalizeText(body?.severity, 30) || 'medium',
        status: 'open',
        category,
        summary,
        details: normalizeText(body?.details, 1500),
        created_by: ctx.user.id,
      })
      .select('id, payout_id, severity, status, category, summary, details, assigned_to, resolved_at, resolved_by, created_by, created_at, updated_at')
      .single();

    if (isMissingOpsTableError(result.error)) {
      return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to log payout exception' }, { status: 400 });
    }

    const { data: members } = await ctx.adminClient
      .from('store_users')
      .select('user_id, status')
      .eq('store_id', ctx.membership.store_id)
      .eq('status', 'active');

    const userIds = [...new Set((members || []).map((row) => row.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length > 0
      ? await ctx.adminClient.from('users').select('id, full_name, email').in('id', userIds)
      : { data: [] };

    for (const profile of profiles || []) {
      await createUserNotification(ctx.adminClient, {
        userId: profile.id,
        storeId: ctx.membership.store_id,
        type: 'payout_exception_created',
        title: `Payout exception: ${summary}`,
        body: `${category} issue logged for follow-up.`,
        actionUrl: '/store/dashboard/payouts',
        entityType: 'store_payout_exception',
        entityId: result.data.id,
      });

      if (profile.email) {
        await sendPayoutExceptionEmail({
          to: profile.email,
          recipientName: profile.full_name,
          storeName: ctx.store?.name || 'your store',
          summary,
          category,
        });
      }
    }

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'store-payouts-service',
      action: 'STORE_PAYOUT_EXCEPTION_CREATED',
      status: 'success',
      statusCode: 200,
      userId: ctx.user.id,
      message: 'Store payout exception created',
      metadata: {
        storeId: ctx.membership.store_id,
        category,
        summary,
      },
    });

    return NextResponse.json({ success: true, data: result.data });
  }

  return NextResponse.json({ error: 'type must be reconciliation or exception' }, { status: 400 });
}

export async function PATCH(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_payouts_write',
    identifier: ctx.user.id,
    limit: 30,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const type = String(body?.type || '').trim().toLowerCase();
  const id = String(body?.id || '').trim();
  const nextStatus = String(body?.status || '').trim().toLowerCase();

  if (!id || !nextStatus) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
  }

  if (type === 'reconciliation') {
    const result = await ctx.adminClient
      .from('store_payout_reconciliations')
      .update({
        status: nextStatus,
        resolved_at: nextStatus === 'resolved' ? new Date().toISOString() : null,
        resolved_by: nextStatus === 'resolved' ? ctx.user.id : null,
        notes: normalizeText(body?.notes, 1500) || undefined,
      })
      .eq('id', id)
      .eq('store_id', ctx.membership.store_id)
      .select('id, status, resolved_at, resolved_by, notes')
      .single();

    if (isMissingOpsTableError(result.error)) {
      return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
    }
    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to update reconciliation item' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  }

  if (type === 'exception') {
    const result = await ctx.adminClient
      .from('store_payout_exceptions')
      .update({
        status: nextStatus,
        resolved_at: nextStatus === 'resolved' ? new Date().toISOString() : null,
        resolved_by: nextStatus === 'resolved' ? ctx.user.id : null,
        details: normalizeText(body?.details, 1500) || undefined,
      })
      .eq('id', id)
      .eq('store_id', ctx.membership.store_id)
      .select('id, status, resolved_at, resolved_by, details')
      .single();

    if (isMissingOpsTableError(result.error)) {
      return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
    }
    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to update payout exception' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  }

  return NextResponse.json({ error: 'type must be reconciliation or exception' }, { status: 400 });
}
