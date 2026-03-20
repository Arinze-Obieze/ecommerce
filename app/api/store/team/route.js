import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { writeActivityLog } from '@/utils/serverTelemetry';
import { sendStoreAccessGrantedEmail } from '@/utils/emailNotifications';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validRole(role) {
  return role === STORE_ROLES.MANAGER || role === STORE_ROLES.STAFF;
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { data: assignments, error } = await ctx.adminClient
    .from('store_users')
    .select('id, store_id, user_id, role, status, created_at, created_by')
    .eq('store_id', ctx.membership.store_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  return NextResponse.json({
    success: true,
    data: (assignments || []).map((assignment) => ({
      ...assignment,
      user: usersById.get(assignment.user_id) || null,
      isCurrentUser: assignment.user_id === ctx.user.id,
    })),
    meta: {
      store: ctx.store,
      currentMembership: {
        id: ctx.membership.id,
        role: ctx.membership.role,
        store_id: ctx.membership.store_id,
      },
    },
  });
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json();
  const email = normalizeEmail(body?.email);
  const role = String(body?.role || STORE_ROLES.STAFF).trim();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  if (!validRole(role)) {
    return NextResponse.json({ error: 'Role must be manager or staff' }, { status: 400 });
  }

  if (ctx.membership.role === STORE_ROLES.MANAGER && role !== STORE_ROLES.STAFF) {
    return NextResponse.json({ error: 'Managers can only add staff members' }, { status: 403 });
  }

  const { data: targetUser, error: targetUserError } = await ctx.adminClient
    .from('users')
    .select('id, email, full_name')
    .ilike('email', email)
    .maybeSingle();

  if (targetUserError) {
    return NextResponse.json({ error: targetUserError.message }, { status: 500 });
  }

  if (!targetUser) {
    return NextResponse.json(
      { error: 'No user account found for this email. Ask the teammate to sign up first.' },
      { status: 404 }
    );
  }

  const { data: assignmentRows, error: upsertError } = await ctx.adminClient
    .from('store_users')
    .upsert(
      {
        store_id: ctx.membership.store_id,
        user_id: targetUser.id,
        role,
        status: 'active',
        created_by: ctx.user.id,
      },
      { onConflict: 'store_id,user_id' }
    )
    .select('id, store_id, user_id, role, status, created_at, created_by');

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 });
  }

  const assignment = assignmentRows?.[0];
  let emailStatus = 'skipped';
  let emailError = null;

  if (targetUser.email) {
    const { data: actorProfile } = await ctx.adminClient
      .from('users')
      .select('full_name')
      .eq('id', ctx.user.id)
      .maybeSingle();

    const emailResult = await sendStoreAccessGrantedEmail({
      to: targetUser.email,
      recipientName: targetUser.full_name,
      storeName: ctx.store?.name || 'your store',
      role,
      assignedByName:
        actorProfile?.full_name ||
        (ctx.membership.role === STORE_ROLES.OWNER ? 'Store Owner' : 'Store Manager'),
    });

    emailStatus = emailResult.ok ? 'sent' : 'failed';
    emailError = emailResult.ok ? null : emailResult.error || 'Failed to send notification email';
  }

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
      memberUserId: targetUser.id,
      role,
      emailStatus,
      ...(emailError ? { emailError } : {}),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      ...assignment,
      user: targetUser,
      email_status: emailStatus,
      ...(emailError ? { email_error: emailError } : {}),
    },
  });
}
