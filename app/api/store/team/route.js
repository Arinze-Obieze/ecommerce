import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { writeActivityLog } from '@/utils/telemetry/server';
import {
  sendStoreAccessGrantedEmail,
  sendStoreInvitationEmail,
} from '@/utils/messaging/email-notifications';
import {
  ensureUserProfile,
  findAuthUserByEmail,
  generateStoreInviteLink,
  getStoreInvitationsMigrationHint,
  isMissingStoreInvitationsTableError,
} from '@/utils/store/invitations';
import { createUserNotification } from '@/utils/messaging/notifications';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validRole(role) {
  return role === STORE_ROLES.MANAGER || role === STORE_ROLES.STAFF;
}

async function fetchAssignments(ctx) {
  const { data: assignments, error } = await ctx.adminClient
    .from('store_users')
    .select('id, store_id, user_id, role, status, created_at, created_by')
    .eq('store_id', ctx.membership.store_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to load assignments');
  }

  const userIds = [...new Set((assignments || []).map((row) => row.user_id).filter(Boolean))];
  let usersById = new Map();

  if (userIds.length > 0) {
    const usersRes = await ctx.adminClient
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);

    if (!usersRes.error) {
      usersById = new Map((usersRes.data || []).map((user) => [user.id, user]));
    }
  }

  return (assignments || []).map((assignment) => ({
    ...assignment,
    user: usersById.get(assignment.user_id) || null,
    isCurrentUser: assignment.user_id === ctx.user.id,
  }));
}

async function fetchInvitations(ctx) {
  const inviteResult = await ctx.adminClient
    .from('store_team_invitations')
    .select('id, email, role, status, invited_user_id, invited_by, accepted_by, sent_count, sent_at, accepted_at, revoked_at, expires_at, invite_message, created_at, updated_at')
    .eq('store_id', ctx.membership.store_id)
    .order('created_at', { ascending: false });

  if (isMissingStoreInvitationsTableError(inviteResult.error)) {
    return { rows: [], missingTable: true };
  }

  if (inviteResult.error) {
    throw new Error(inviteResult.error.message || 'Failed to load invitations');
  }

  return { rows: inviteResult.data || [], missingTable: false };
}

export async function GET(request) {
  const ctx = await requireStoreApi();
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_team_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  try {
    const [assignments, invitations] = await Promise.all([
      fetchAssignments(ctx),
      fetchInvitations(ctx),
    ]);

    return NextResponse.json({
      success: true,
      data: assignments,
      invitations: invitations.rows,
      meta: {
        store: ctx.store,
        currentMembership: {
          id: ctx.membership.id,
          role: ctx.membership.role,
          store_id: ctx.membership.store_id,
        },
        ...(invitations.missingTable ? { migrationHint: getStoreInvitationsMigrationHint() } : {}),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to load team' }, { status: 500 });
  }
}

export async function POST(request) {
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

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body?.email);
  const role = String(body?.role || STORE_ROLES.STAFF).trim();
  const inviteMessage = String(body?.invite_message || '').trim().slice(0, 500);

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  if (!validRole(role)) {
    return NextResponse.json({ error: 'Role must be manager or staff' }, { status: 400 });
  }

  if (ctx.membership.role === STORE_ROLES.MANAGER && role !== STORE_ROLES.STAFF) {
    return NextResponse.json({ error: 'Managers can only add staff members' }, { status: 403 });
  }

  const { data: actorProfile } = await ctx.adminClient
    .from('users')
    .select('full_name')
    .eq('id', ctx.user.id)
    .maybeSingle();

  const actorName =
    actorProfile?.full_name ||
    (ctx.membership.role === STORE_ROLES.OWNER ? 'Store Owner' : 'Store Manager');

  const { user: authUser, error: authLookupError } = await findAuthUserByEmail(ctx.adminClient, email);
  if (authLookupError) {
    return NextResponse.json({ error: authLookupError.message || 'Failed to search existing users' }, { status: 500 });
  }

  if (authUser?.id) {
    const ensuredProfile = await ensureUserProfile(ctx.adminClient, {
      userId: authUser.id,
      email,
      fullName: authUser.user_metadata?.full_name || null,
    });

    if (!ensuredProfile.ok) {
      return NextResponse.json({ error: ensuredProfile.error || 'Failed to prepare invited user profile' }, { status: 500 });
    }

    const { data: assignmentRows, error: upsertError } = await ctx.adminClient
      .from('store_users')
      .upsert(
        {
          store_id: ctx.membership.store_id,
          user_id: authUser.id,
          role,
          status: 'active',
          created_by: ctx.user.id,
        },
        { onConflict: 'store_id,user_id' }
      )
      .select('id, store_id, user_id, role, status, created_at, created_by');

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message || 'Failed to add team member' }, { status: 400 });
    }

    const profile = ensuredProfile.user;
    const emailResult = await sendStoreAccessGrantedEmail({
      to: email,
      recipientName: profile?.full_name,
      storeName: ctx.store?.name || 'your store',
      role,
      assignedByName: actorName,
    });

    await createUserNotification(ctx.adminClient, {
      userId: authUser.id,
      storeId: ctx.membership.store_id,
      type: 'store_access_granted',
      title: `You were added to ${ctx.store?.name || 'a store'}`,
      body: `${actorName} added you as ${role}.`,
      actionUrl: '/store/dashboard',
      entityType: 'store_membership',
      entityId: assignmentRows?.[0]?.id || null,
      metadata: {
        role,
        invitedBy: ctx.user.id,
      },
    });

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'store-team-service',
      action: 'STORE_TEAM_MEMBER_UPSERTED',
      status: 'success',
      statusCode: 200,
      userId: ctx.user.id,
      message: 'Store team member added/updated',
      metadata: {
        storeId: ctx.membership.store_id,
        memberUserId: authUser.id,
        role,
        lifecycle: 'existing_user',
        emailStatus: emailResult.ok ? 'sent' : 'failed',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...(assignmentRows?.[0] || {}),
        user: profile,
        lifecycle: 'existing_user',
        email_status: emailResult.ok ? 'sent' : 'failed',
        ...(emailResult.ok ? {} : { email_error: emailResult.error || 'Failed to send access email' }),
      },
    });
  }

  const inviteLink = await generateStoreInviteLink(ctx.adminClient, email, null);
  if (!inviteLink.ok) {
    return NextResponse.json({ error: inviteLink.error || 'Failed to generate invite link' }, { status: inviteLink.status || 500 });
  }

  const ensuredProfile = await ensureUserProfile(ctx.adminClient, {
    userId: inviteLink.user.id,
    email,
    fullName: inviteLink.user.user_metadata?.full_name || null,
  });

  if (!ensuredProfile.ok) {
    await ctx.adminClient.auth.admin.deleteUser(inviteLink.user.id).catch(() => null);
    return NextResponse.json({ error: ensuredProfile.error || 'Failed to prepare invited profile' }, { status: 500 });
  }

  const inviteInsert = await ctx.adminClient
    .from('store_team_invitations')
    .upsert(
      {
        store_id: ctx.membership.store_id,
        email,
        role,
        status: 'pending',
        invited_user_id: inviteLink.user.id,
        invited_by: ctx.user.id,
        setup_link: inviteLink.actionLink,
        invite_message: inviteMessage || null,
        sent_count: 1,
        sent_at: new Date().toISOString(),
        revoked_at: null,
        revoked_by: null,
        accepted_at: null,
        accepted_by: null,
      },
      { onConflict: 'store_id,email' }
    )
    .select('id, email, role, status, invited_user_id, invited_by, sent_count, sent_at, expires_at, invite_message, created_at, updated_at')
    .single();

  if (isMissingStoreInvitationsTableError(inviteInsert.error)) {
    await ctx.adminClient.auth.admin.deleteUser(inviteLink.user.id).catch(() => null);
    return NextResponse.json({ error: getStoreInvitationsMigrationHint() }, { status: 500 });
  }

  if (inviteInsert.error) {
    return NextResponse.json({ error: inviteInsert.error.message || 'Failed to save invitation' }, { status: 400 });
  }

  const emailResult = await sendStoreInvitationEmail({
    to: email,
    recipientName: ensuredProfile.user?.full_name,
    storeName: ctx.store?.name || 'your store',
    role,
    invitedByName: actorName,
    setupLink: inviteLink.actionLink,
    existingAccount: false,
    inviteMessage,
  });

  await createUserNotification(ctx.adminClient, {
    userId: ctx.user.id,
    storeId: ctx.membership.store_id,
    type: 'store_invitation_sent',
    title: `Invitation sent to ${email}`,
    body: `Pending ${role} invitation created for ${ctx.store?.name || 'your store'}.`,
    actionUrl: '/store/dashboard/team',
    entityType: 'store_team_invitation',
    entityId: inviteInsert.data?.id || null,
    metadata: {
      invitedEmail: email,
      role,
    },
  });

  await writeActivityLog({
    request,
    level: 'INFO',
    service: 'store-team-service',
    action: 'STORE_TEAM_INVITATION_CREATED',
    status: 'success',
    statusCode: 200,
    userId: ctx.user.id,
    message: 'Store team invitation created',
    metadata: {
      storeId: ctx.membership.store_id,
      invitedEmail: email,
      role,
      lifecycle: 'new_user_invite',
      emailStatus: emailResult.ok ? 'sent' : 'failed',
    },
  });

  return NextResponse.json({
    success: true,
    invitation: {
      ...inviteInsert.data,
      lifecycle: 'new_user_invite',
      email_status: emailResult.ok ? 'sent' : 'failed',
      ...(emailResult.ok ? {} : { email_error: emailResult.error || 'Failed to send invitation email' }),
    },
  });
}
