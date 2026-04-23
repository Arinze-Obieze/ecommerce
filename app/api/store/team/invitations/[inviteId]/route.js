import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { writeActivityLog } from '@/utils/telemetry/server';
import { sendStoreInvitationEmail } from '@/utils/messaging/email-notifications';
import {
  generateStoreInviteLink,
  getStoreInvitationsMigrationHint,
  isMissingStoreInvitationsTableError,
} from '@/utils/store/invitations';
import { createUserNotification } from '@/utils/messaging/notifications';

async function loadInvitation(ctx, inviteId) {
  const result = await ctx.adminClient
    .from('store_team_invitations')
    .select('id, store_id, email, role, status, invited_user_id, invited_by, sent_count, sent_at, accepted_at, revoked_at, expires_at, invite_message')
    .eq('id', inviteId)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

  if (isMissingStoreInvitationsTableError(result.error)) {
    return { invitation: null, error: getStoreInvitationsMigrationHint(), missingTable: true };
  }

  if (result.error) {
    return { invitation: null, error: result.error.message || 'Failed to load invitation', missingTable: false };
  }

  return { invitation: result.data || null, error: null, missingTable: false };
}

export async function PATCH(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_team_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { inviteId } = await params;
  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || '').trim().toLowerCase();

  const current = await loadInvitation(ctx, inviteId);
  if (current.missingTable) {
    return NextResponse.json({ error: current.error }, { status: 500 });
  }
  if (current.error) {
    return NextResponse.json({ error: current.error }, { status: 500 });
  }
  if (!current.invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  if (!['resend', 'revoke'].includes(action)) {
    return NextResponse.json({ error: 'Action must be resend or revoke' }, { status: 400 });
  }

  if (action === 'revoke') {
    const result = await ctx.adminClient
      .from('store_team_invitations')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: ctx.user.id,
      })
      .eq('id', current.invitation.id)
      .select('id, status, revoked_at')
      .single();

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to revoke invitation' }, { status: 400 });
    }

    await createUserNotification(ctx.adminClient, {
      userId: ctx.user.id,
      storeId: ctx.membership.store_id,
      type: 'store_invitation_revoked',
      title: `Invitation revoked for ${current.invitation.email}`,
      body: 'The pending team invite was revoked.',
      actionUrl: '/store/dashboard/team',
      entityType: 'store_team_invitation',
      entityId: current.invitation.id,
    });

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'store-team-service',
      action: 'STORE_TEAM_INVITATION_REVOKED',
      status: 'success',
      statusCode: 200,
      userId: ctx.user.id,
      message: 'Store invitation revoked',
      metadata: {
        storeId: ctx.membership.store_id,
        inviteId: current.invitation.id,
        email: current.invitation.email,
      },
    });

    return NextResponse.json({ success: true, data: result.data });
  }

  const inviteLink = await generateStoreInviteLink(ctx.adminClient, current.invitation.email, null);
  if (!inviteLink.ok) {
    return NextResponse.json({ error: inviteLink.error || 'Failed to refresh invite link' }, { status: inviteLink.status || 500 });
  }

  const result = await ctx.adminClient
    .from('store_team_invitations')
    .update({
      status: 'pending',
      invited_user_id: inviteLink.user.id,
      setup_link: inviteLink.actionLink,
      sent_count: Number(current.invitation.sent_count || 0) + 1,
      sent_at: new Date().toISOString(),
      revoked_at: null,
      revoked_by: null,
    })
    .eq('id', current.invitation.id)
    .select('id, email, role, status, sent_count, sent_at')
    .single();

  if (result.error) {
    return NextResponse.json({ error: result.error.message || 'Failed to resend invitation' }, { status: 400 });
  }

  const { data: actorProfile } = await ctx.adminClient
    .from('users')
    .select('full_name')
    .eq('id', ctx.user.id)
    .maybeSingle();

  const actorName = actorProfile?.full_name || 'Store Administrator';
  const mail = await sendStoreInvitationEmail({
    to: current.invitation.email,
    recipientName: null,
    storeName: ctx.store?.name || 'your store',
    role: current.invitation.role,
    invitedByName: actorName,
    setupLink: inviteLink.actionLink,
    existingAccount: false,
    inviteMessage: current.invitation.invite_message || '',
  });

  await createUserNotification(ctx.adminClient, {
    userId: ctx.user.id,
    storeId: ctx.membership.store_id,
    type: 'store_invitation_resent',
    title: `Invitation resent to ${current.invitation.email}`,
    body: 'A fresh secure invite link was issued.',
    actionUrl: '/store/dashboard/team',
    entityType: 'store_team_invitation',
    entityId: current.invitation.id,
  });

  await writeActivityLog({
    request,
    level: 'INFO',
    service: 'store-team-service',
    action: 'STORE_TEAM_INVITATION_RESENT',
    status: 'success',
    statusCode: 200,
    userId: ctx.user.id,
    message: 'Store invitation resent',
    metadata: {
      storeId: ctx.membership.store_id,
      inviteId: current.invitation.id,
      email: current.invitation.email,
      emailStatus: mail.ok ? 'sent' : 'failed',
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      ...result.data,
      email_status: mail.ok ? 'sent' : 'failed',
      ...(mail.ok ? {} : { email_error: mail.error || 'Failed to send invitation email' }),
    },
  });
}
