import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/admin/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { getPagination, paginationMeta } from '@/utils/platform/pagination';
import { privateJson } from '@/utils/platform/api-response';

export async function GET(request) {
  const admin = await requireAdminApi([ADMIN_ROLES.ANALYST, ADMIN_ROLES.SUPPORT_ADMIN, ADMIN_ROLES.OPS_ADMIN, ADMIN_ROLES.SUPER_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_products_read',
    identifier: admin.user.id,
    limit: 180,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { searchParams } = new URL(request.url);
  const moderationStatus = String(searchParams.get('moderationStatus') || '').trim();
  const { page, limit, from, to } = getPagination(searchParams, { defaultLimit: 25, maxLimit: 100 });

  let query = admin.adminClient
    .from('products')
    .select('id, name, slug, store_id, price, discount_price, stock_quantity, is_active, moderation_status, submitted_at, reviewed_at, reviewed_by, rejection_reason, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (moderationStatus) {
    query = query.eq('moderation_status', moderationStatus);
  }

  const { data: products, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const storeIds = [...new Set((products || []).map((p) => p.store_id).filter(Boolean))];
  const { data: stores } = storeIds.length
    ? await admin.adminClient.from('stores').select('id, name, status').in('id', storeIds)
    : { data: [] };

  const storeMap = new Map((stores || []).map((s) => [s.id, s]));

  return privateJson({
    success: true,
    data: (products || []).map((product) => ({
      ...product,
      store: storeMap.get(product.store_id) || null,
    })),
    meta: paginationMeta({ page, limit, total: count || 0 }),
  });
}
