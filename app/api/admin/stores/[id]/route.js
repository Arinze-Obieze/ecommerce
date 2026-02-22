import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/adminAuth';
import { writeAdminAuditLog } from '@/utils/adminAudit';
import { enforceRateLimit } from '@/utils/rateLimit';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '');
}

function sanitizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

async function resolveStore(supabase, idOrSlug) {
  let query = supabase
    .from('stores')
    .select('id, name, slug, description, logo_url, rating, followers, status, kyc_status, payout_ready, approved_at, approved_by, created_at');

  query = isUuid(idOrSlug) ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);

  const { data, error } = await query.maybeSingle();
  return { data, error };
}

export async function GET(request, { params }) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_store_detail_read',
    identifier: admin.user.id,
    limit: 180,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  const storeResult = await resolveStore(admin.adminClient, id);

  if (storeResult.error) {
    return NextResponse.json({ error: storeResult.error.message }, { status: 500 });
  }

  if (!storeResult.data) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const store = storeResult.data;

  const [assignmentsRes, productsRes] = await Promise.all([
    admin.adminClient
      .from('store_users')
      .select('id, user_id, role, status, created_at, created_by')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false }),
    admin.adminClient
      .from('products')
      .select('id, is_active, stock_quantity')
      .eq('store_id', store.id),
  ]);

  if (assignmentsRes.error || productsRes.error) {
    return NextResponse.json(
      { error: assignmentsRes.error?.message || productsRes.error?.message },
      { status: 500 }
    );
  }

  const assignments = assignmentsRes.data || [];
  const userIds = [...new Set(assignments.map((a) => a.user_id).filter(Boolean))];

  let usersById = new Map();
  if (userIds.length > 0) {
    const usersRes = await admin.adminClient
      .from('users')
      .select('id, full_name, email, phone')
      .in('id', userIds);

    if (!usersRes.error) {
      usersById = new Map((usersRes.data || []).map((u) => [u.id, u]));
    }
  }

  const enrichedAssignments = assignments.map((assignment) => ({
    ...assignment,
    user: usersById.get(assignment.user_id) || null,
  }));

  const products = productsRes.data || [];
  const productStats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    outOfStock: products.filter((p) => Number(p.stock_quantity) <= 0).length,
  };

  return NextResponse.json({
    success: true,
    data: {
      store,
      assignments: enrichedAssignments,
      productStats,
    },
  });
}

export async function PATCH(request, { params }) {
  const admin = await requireAdminApi([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_store_write',
    identifier: admin.user.id,
    limit: 90,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  const storeResult = await resolveStore(admin.adminClient, id);

  if (storeResult.error) {
    return NextResponse.json({ error: storeResult.error.message }, { status: 500 });
  }

  if (!storeResult.data) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const before = storeResult.data;
  const body = await request.json();
  const updates = {};

  if (body.name !== undefined) updates.name = String(body.name || '').trim();
  if (body.description !== undefined) updates.description = body.description ? String(body.description).trim() : null;
  if (body.logo_url !== undefined) updates.logo_url = body.logo_url ? String(body.logo_url).trim() : null;
  if (body.slug !== undefined) {
    const nextSlug = sanitizeSlug(body.slug);
    if (!nextSlug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    updates.slug = nextSlug;
  }
  if (body.status !== undefined) updates.status = body.status;
  if (body.kyc_status !== undefined) updates.kyc_status = body.kyc_status;
  if (body.payout_ready !== undefined) updates.payout_ready = Boolean(body.payout_ready);

  if (updates.status === 'active' && before.status !== 'active') {
    updates.approved_by = admin.user.id;
    updates.approved_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  const { data: store, error } = await admin.adminClient
    .from('stores')
    .update(updates)
    .eq('id', before.id)
    .select('id, name, slug, description, logo_url, status, kyc_status, payout_ready, approved_at, approved_by, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAdminAuditLog(admin.adminClient, {
    actorUserId: admin.user.id,
    actorAdminUserId: admin.membership.id,
    action: 'STORE_UPDATED',
    targetType: 'store',
    targetId: store.id,
    beforeData: before,
    afterData: store,
    metadata: { updatedFields: Object.keys(updates) },
  });

  return NextResponse.json({ success: true, data: store });
}
