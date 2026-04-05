import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/adminAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import {
  DEFAULT_RETURN_POLICY,
  normalizeReturnPolicyRecord,
  buildReturnPolicyUpdatePayload,
} from '@/utils/returnPolicy';

const EDITOR_ROLES = [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN, ADMIN_ROLES.SUPPORT_ADMIN];

export async function GET(request) {
  const admin = await requireAdminApi(EDITOR_ROLES);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_return_policy_read',
    identifier: admin.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { data, error } = await admin.adminClient
    .from('platform_content')
    .select('id, title, description, data, updated_at, updated_by')
    .eq('content_key', 'return_policy')
    .maybeSingle();

  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data ? normalizeReturnPolicyRecord(data) : DEFAULT_RETURN_POLICY,
    meta: {
      role: admin.membership.role,
      can_edit: true,
    },
  });
}

export async function PATCH(request) {
  const admin = await requireAdminApi(EDITOR_ROLES);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_return_policy_write',
    identifier: admin.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const payload = buildReturnPolicyUpdatePayload(body);

  if (payload.error) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const { data, error } = await admin.adminClient
    .from('platform_content')
    .upsert(
      {
        content_key: 'return_policy',
        title: payload.title,
        description: payload.description,
        data: payload.data,
        updated_by: admin.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'content_key' }
    )
    .select('id, title, description, data, updated_at, updated_by')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: normalizeReturnPolicyRecord(data),
  });
}
