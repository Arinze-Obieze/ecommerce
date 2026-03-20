import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/adminAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { writeAdminAuditLog } from '@/utils/adminAudit';

export async function POST(request) {
  const admin = await requireAdminApi([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN, ADMIN_ROLES.SUPPORT_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_product_review_write',
    identifier: admin.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = Number.parseInt(body?.product_id, 10);
  const decision = String(body?.decision || '').trim().toLowerCase();
  const rejectionReason = String(body?.rejection_reason || '').trim();

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: 'Valid product_id is required' }, { status: 400 });
  }

  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json({ error: 'Decision must be approve or reject' }, { status: 400 });
  }

  if (decision === 'reject' && !rejectionReason) {
    return NextResponse.json({ error: 'Rejection reason is required when rejecting' }, { status: 400 });
  }

  const { data: before, error: lookupError } = await admin.adminClient
    .from('products')
    .select('id, store_id, name, slug, is_active, moderation_status, submitted_at, reviewed_at, reviewed_by, rejection_reason')
    .eq('id', productId)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  if (!before) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const nowIso = new Date().toISOString();
  const updates = decision === 'approve'
    ? {
        moderation_status: 'approved',
        is_active: true,
        reviewed_at: nowIso,
        reviewed_by: admin.user.id,
        rejection_reason: null,
        published_at: nowIso,
      }
    : {
        moderation_status: 'rejected',
        is_active: false,
        reviewed_at: nowIso,
        reviewed_by: admin.user.id,
        rejection_reason: rejectionReason,
      };

  const { data: after, error: updateError } = await admin.adminClient
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select('id, store_id, name, slug, is_active, moderation_status, submitted_at, reviewed_at, reviewed_by, rejection_reason, published_at')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await writeAdminAuditLog(admin.adminClient, {
    actorUserId: admin.user.id,
    actorAdminUserId: admin.membership.id,
    action: decision === 'approve' ? 'PRODUCT_APPROVED' : 'PRODUCT_REJECTED',
    targetType: 'product',
    targetId: String(productId),
    beforeData: before,
    afterData: after,
    metadata: {
      decision,
      ...(decision === 'reject' ? { rejectionReason } : {}),
    },
  });

  return NextResponse.json({ success: true, data: after });
}
