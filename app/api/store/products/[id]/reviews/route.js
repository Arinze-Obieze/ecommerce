import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';

const MIGRATION_HINT =
  'Database is missing the hardened review columns. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function isMissingReviewColumnsError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42703' ||
    message.includes('seller_reply') ||
    message.includes('deleted_at');
}

export async function GET(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_reviews_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { id } = await params;
  const { data: product, error: productError } = await ctx.adminClient
    .from('products')
    .select('id, store_id, name')
    .eq('id', id)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: productError.message || 'Failed to load product' }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const result = await ctx.adminClient
    .from('reviews')
    .select('id, product_id, user_id, rating, comment, created_at, edited_at, status, is_verified_purchase, seller_reply, seller_replied_at')
    .eq('product_id', product.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (isMissingReviewColumnsError(result.error)) {
    return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message || 'Failed to load reviews' }, { status: 500 });
  }

  const userIds = [...new Set((result.data || []).map((row) => row.user_id).filter(Boolean))];
  let usersById = new Map();

  if (userIds.length > 0) {
    const usersResult = await ctx.adminClient
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);

    if (!usersResult.error) {
      usersById = new Map((usersResult.data || []).map((row) => [row.id, row]));
    }
  }

  return NextResponse.json({
    success: true,
    data: (result.data || []).map((review) => ({
      ...review,
      user: usersById.get(review.user_id) || null,
    })),
    meta: {
      product,
    },
  });
}
