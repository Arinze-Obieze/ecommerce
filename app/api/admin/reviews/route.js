import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/admin/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { writeAdminAuditLog } from '@/utils/admin/audit';
import { invalidateReviewCache } from '@/utils/platform/cache-invalidation';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN, ADMIN_ROLES.SUPPORT_ADMIN];

// GET /api/admin/reviews
// Query params: status (default: 'flagged'), page (1-based), limit (default: 30)
export async function GET(request) {
  const admin = await requireAdminApi(ALLOWED_ROLES);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(request.url);
  const status = String(searchParams.get('status') || 'flagged').trim();
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
  const offset = (page - 1) * limit;

  const { data, error, count } = await admin.adminClient
    .from('reviews')
    .select(`
      id, product_id, user_id, rating, comment, status,
      is_verified_purchase, purchase_order_id,
      moderation_note, moderated_at, moderated_by,
      created_at, edited_at, deleted_at,
      seller_reply, seller_replied_at,
      products ( id, name, slug, store_id )
    `, { count: 'exact' })
    .eq('status', status)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // reviews.user_id → auth.users, not public.users, so PostgREST can't auto-join.
  // Fetch public profile rows separately and merge by id.
  const userIds = [...new Set((data || []).map((r) => r.user_id).filter(Boolean))];
  let profileMap = {};
  if (userIds.length > 0) {
    const { data: profiles } = await admin.adminClient
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);
    for (const p of profiles || []) profileMap[p.id] = p;
  }

  const enriched = (data || []).map((r) => ({
    ...r,
    user: profileMap[r.user_id] || null,
  }));

  return NextResponse.json({
    data: enriched,
    total: count || 0,
    page,
    limit,
  });
}

// PATCH /api/admin/reviews
// Body: { reviewId, decision: 'approve' | 'reject', moderation_note? }
export async function PATCH(request) {
  const admin = await requireAdminApi(ALLOWED_ROLES);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_reviews_moderation',
    identifier: admin.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      rateLimitPayload('Too many requests. Please wait a moment.', rateLimit),
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const body = await request.json().catch(() => ({}));
  const reviewId       = String(body?.reviewId || '').trim();
  const decision       = String(body?.decision || '').trim().toLowerCase();
  const moderationNote = String(body?.moderation_note || '').trim() || null;

  if (!reviewId) {
    return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
  }

  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json({ error: 'decision must be "approve" or "reject"' }, { status: 400 });
  }

  const { data: before, error: lookupError } = await admin.adminClient
    .from('reviews')
    .select('id, product_id, user_id, status, rating, comment, moderation_note')
    .eq('id', reviewId)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  if (!before) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const nowIso = new Date().toISOString();
  const updates = {
    status:          decision === 'approve' ? 'approved' : 'rejected',
    moderated_at:    nowIso,
    moderated_by:    admin.user.id,
    moderation_note: moderationNote ?? before.moderation_note,
  };

  const { data: after, error: updateError } = await admin.adminClient
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select('id, product_id, user_id, status, rating, comment, moderation_note, moderated_at, moderated_by')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await writeAdminAuditLog(admin.adminClient, {
    actorUserId:      admin.user.id,
    actorAdminUserId: admin.membership.id,
    action:           decision === 'approve' ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
    targetType:       'review',
    targetId:         reviewId,
    beforeData:       before,
    afterData:        after,
    metadata:         { decision, moderation_note: moderationNote },
  });

  invalidateReviewCache(after);

  return NextResponse.json({ success: true, data: after });
}
