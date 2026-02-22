import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { writeActivityLog } from '@/utils/serverTelemetry';

function validRole(role) {
  return role === STORE_ROLES.MANAGER || role === STORE_ROLES.STAFF;
}

export async function PATCH(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER]);
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

  const { assignmentId } = await params;
  const body = await request.json();

  const { data: assignment, error: assignmentError } = await ctx.adminClient
    .from('store_users')
    .select('id, store_id, user_id, role, status')
    .eq('id', assignmentId)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignment) {
    return NextResponse.json({ error: 'Team membership not found' }, { status: 404 });
  }

  if (assignment.role === STORE_ROLES.OWNER) {
    return NextResponse.json({ error: 'Owner assignment cannot be changed here' }, { status: 409 });
  }

  const updates = {};
  if (body?.role !== undefined) {
    const role = String(body.role).trim();
    if (!validRole(role)) {
      return NextResponse.json({ error: 'Role must be manager or staff' }, { status: 400 });
    }
    updates.role = role;
  }

  if (body?.status !== undefined) {
    const status = String(body.status).trim();
    if (status !== 'active' && status !== 'revoked') {
      return NextResponse.json({ error: 'Status must be active or revoked' }, { status: 400 });
    }
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
  }

  const { data: rows, error: updateError } = await ctx.adminClient
    .from('store_users')
    .update(updates)
    .eq('id', assignment.id)
    .select('id, store_id, user_id, role, status, created_at, created_by');

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await writeActivityLog({
    request,
    level: 'INFO',
    service: 'store-team-service',
    action: 'STORE_TEAM_MEMBER_UPDATED',
    status: 'success',
    statusCode: 200,
    userId: ctx.user.id,
    message: 'Store team member updated',
    metadata: {
      storeId: ctx.membership.store_id,
      memberUserId: assignment.user_id,
      updates,
    },
  });

  return NextResponse.json({ success: true, data: rows?.[0] || null });
}

export async function DELETE(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER]);
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

  const { assignmentId } = await params;

  const { data: assignment, error: assignmentError } = await ctx.adminClient
    .from('store_users')
    .select('id, store_id, user_id, role, status')
    .eq('id', assignmentId)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignment) {
    return NextResponse.json({ error: 'Team membership not found' }, { status: 404 });
  }

  if (assignment.role === STORE_ROLES.OWNER) {
    return NextResponse.json({ error: 'Owner cannot be removed here' }, { status: 409 });
  }

  const { error: updateError } = await ctx.adminClient
    .from('store_users')
    .update({ status: 'revoked' })
    .eq('id', assignment.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await writeActivityLog({
    request,
    level: 'INFO',
    service: 'store-team-service',
    action: 'STORE_TEAM_MEMBER_REVOKED',
    status: 'success',
    statusCode: 200,
    userId: ctx.user.id,
    message: 'Store team member revoked',
    metadata: {
      storeId: ctx.membership.store_id,
      memberUserId: assignment.user_id,
    },
  });

  return NextResponse.json({ success: true });
}
