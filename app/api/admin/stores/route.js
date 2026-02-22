import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/adminAuth';
import { writeAdminAuditLog } from '@/utils/adminAudit';
import { enforceRateLimit } from '@/utils/rateLimit';

function sanitizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_stores_read',
    identifier: admin.user.id,
    limit: 180,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const page = toPositiveInt(searchParams.get('page'), 1);
  const limit = Math.min(100, toPositiveInt(searchParams.get('limit'), 20));
  const offset = (page - 1) * limit;

  let query = admin.adminClient
    .from('stores')
    .select('id, name, slug, description, logo_url, rating, followers, status, kyc_status, payout_ready, approved_at, approved_by, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
    },
  });
}

export async function POST(request) {
  const admin = await requireAdminApi([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_stores_write',
    identifier: admin.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many write requests' }, { status: 429 });
  }

  const body = await request.json();
  const name = String(body?.name || '').trim();
  const slugInput = String(body?.slug || '').trim();
  const description = body?.description ? String(body.description).trim() : null;
  const logoUrl = body?.logo_url ? String(body.logo_url).trim() : null;
  const kycStatus = body?.kyc_status || 'pending';
  const payoutReady = Boolean(body?.payout_ready);
  const requestedStatus = body?.status || 'pending';
  const ownerUserId = body?.owner_user_id ? String(body.owner_user_id).trim() : null;

  if (!name) {
    return NextResponse.json({ error: 'Store name is required' }, { status: 400 });
  }

  const slug = sanitizeSlug(slugInput || name);
  if (!slug) {
    return NextResponse.json({ error: 'Valid slug is required' }, { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const insertPayload = {
    name,
    slug,
    description,
    logo_url: logoUrl,
    status: requestedStatus,
    kyc_status: kycStatus,
    payout_ready: payoutReady,
    approved_at: requestedStatus === 'active' ? nowIso : null,
    approved_by: requestedStatus === 'active' ? admin.user.id : null,
  };

  const { data: store, error } = await admin.adminClient
    .from('stores')
    .insert(insertPayload)
    .select('id, name, slug, status, kyc_status, payout_ready, approved_at, approved_by, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (ownerUserId) {
    const { error: ownerError } = await admin.adminClient
      .from('store_users')
      .insert({
        store_id: store.id,
        user_id: ownerUserId,
        role: 'owner',
        status: 'active',
        created_by: admin.user.id,
      });

    if (ownerError) {
      return NextResponse.json(
        {
          error: `Store created but owner assignment failed: ${ownerError.message}`,
          store,
        },
        { status: 207 }
      );
    }
  }

  await writeAdminAuditLog(admin.adminClient, {
    actorUserId: admin.user.id,
    actorAdminUserId: admin.membership.id,
    action: 'STORE_CREATED',
    targetType: 'store',
    targetId: store.id,
    afterData: store,
    metadata: { ownerUserId },
  });

  return NextResponse.json({ success: true, data: store }, { status: 201 });
}
