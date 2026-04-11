import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { createUserNotification } from '@/utils/notifications';

const MIGRATION_HINT =
  'Database is missing the hardened review columns. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function normalizeText(value, max = 2000) {
  const text = String(value || '').trim().slice(0, max);
  return text || null;
}

function isMissingReviewColumnsError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42703' ||
    message.includes('seller_reply') ||
    message.includes('deleted_at');
}

export async function PATCH(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_reviews_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { reviewId } = await params;
  const body = await request.json().catch(() => ({}));
  const sellerReply = normalizeText(body?.seller_reply, 1500);
  const status = normalizeText(body?.status, 50);

  const current = await ctx.adminClient
    .from('reviews')
    .select('id, product_id, status, seller_reply, products(store_id)')
    .eq('id', reviewId)
    .maybeSingle();

  if (isMissingReviewColumnsError(current.error)) {
    return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
  }

  if (current.error) {
    return NextResponse.json({ error: current.error.message || 'Failed to load review' }, { status: 500 });
  }

  const storeId = Array.isArray(current.data?.products) ? current.data?.products?.[0]?.store_id : current.data?.products?.store_id;
  if (!current.data || storeId !== ctx.membership.store_id) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const updates = {
    seller_reply: sellerReply,
    seller_replied_at: sellerReply ? new Date().toISOString() : null,
    seller_replied_by: sellerReply ? ctx.user.id : null,
  };

  if (status) {
    updates.status = status;
    updates.moderated_at = new Date().toISOString();
    updates.moderated_by = ctx.user.id;
  }

  const result = await ctx.adminClient
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select('id, product_id, user_id, rating, comment, created_at, edited_at, status, is_verified_purchase, seller_reply, seller_replied_at')
    .single();

  if (isMissingReviewColumnsError(result.error)) {
    return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message || 'Failed to update review' }, { status: 400 });
  }

  if (sellerReply && result.data?.user_id) {
    await createUserNotification(ctx.adminClient, {
      userId: result.data.user_id,
      storeId: ctx.membership.store_id,
      type: 'review_reply_added',
      title: 'A seller replied to your review',
      body: sellerReply,
      actionUrl: `/products/${result.data.product_id}`,
      entityType: 'review',
      entityId: result.data.id,
    });
  }

  return NextResponse.json({ success: true, data: result.data });
}
