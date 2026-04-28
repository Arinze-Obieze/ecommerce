import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { invalidateReviewCache } from '@/utils/platform/cache-invalidation';

export const dynamic = 'force-dynamic';

const REVIEW_WINDOW_DAYS = 90;

// F010: never expose internal migration paths or column names to API callers.
const REVIEWS_MIGRATION_HINT = 'Service temporarily unavailable. Please try again later.';
const _REVIEWS_MIGRATION_HINT_INTERNAL =
  'Database is missing the hardened review columns. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function normalizeText(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

function isMissingReviewColumnsError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42703' ||
    message.includes('is_verified_purchase') ||
    message.includes('seller_reply') ||
    message.includes('deleted_at');
}

async function getAuthedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { user, supabase };
}

// Returns the delivered order or null. Also checks the review window.
async function findVerifiedPurchase(supabase, { userId, productId }) {
  const { data: verifiedItems, error } = await supabase
    .from('order_items')
    .select('order_id, orders!inner(id, user_id, status, fulfillment_status)')
    .eq('product_id', productId)
    .eq('orders.user_id', userId)
    .in('orders.fulfillment_status', ['delivered', 'delivered_confirmed'])
    .neq('orders.status', 'cancelled')
    .limit(1);

  if (error) {
    throw new Error(error.message || 'Failed to verify purchase history');
  }

  const deliveredOrder = verifiedItems?.[0]?.orders ?? null;

  if (!deliveredOrder) return { order: null, windowExpired: false };

  // Check review window using delivered_at, falling back to buyer_confirmed_at.
  const deliveryTimestamp = deliveredOrder.delivered_at || deliveredOrder.buyer_confirmed_at;
  if (deliveryTimestamp) {
    const daysSince = (Date.now() - new Date(deliveryTimestamp).getTime()) / 86_400_000;
    if (daysSince > REVIEW_WINDOW_DAYS) {
      return { order: null, windowExpired: true };
    }
  }

  return { order: deliveredOrder, windowExpired: false };
}

// Scores a review submission for suspicious signals (higher = more suspicious).
// accountCreatedAt comes from auth.getUser() — no extra DB query needed.
async function suspicionScore(supabase, { userId, comment, accountCreatedAt }) {
  let score = 0;
  const signals = [];

  if (comment.trim().length < 20) {
    score += 1;
    signals.push('short_comment');
  }

  if (accountCreatedAt) {
    const ageDays = (Date.now() - new Date(accountCreatedAt).getTime()) / 86_400_000;
    if (ageDays < 3) {
      score += 2;
      signals.push('very_new_account');
    } else if (ageDays < 7) {
      score += 1;
      signals.push('new_account');
    }
  }

  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);

  if ((count || 0) >= 5) {
    score += 2;
    signals.push('review_burst');
  } else if ((count || 0) >= 3) {
    score += 1;
    signals.push('review_burst_mild');
  }

  return { score, signals };
}

export async function POST(request) {
  try {
    const auth = await getAuthedUser();
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { user, supabase } = auth;

    const body = await request.json().catch(() => ({}));
    const productId = Number(body?.productId);
    const rating = Number(body?.rating);
    const comment = normalizeText(body?.comment);

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Self-review guard: store owner cannot review their own product.
    const { data: productStore } = await supabase
      .from('products')
      .select('id, stores!inner(user_id)')
      .eq('id', productId)
      .maybeSingle();

    const storeOwnerId = Array.isArray(productStore?.stores)
      ? productStore.stores[0]?.user_id
      : productStore?.stores?.user_id;

    if (storeOwnerId && storeOwnerId === user.id) {
      return NextResponse.json(
        { error: "Store owners can't review their own products." },
        { status: 403 }
      );
    }

    // Verified purchase + review-window check.
    const { order: verifiedOrder, windowExpired } = await findVerifiedPurchase(supabase, {
      userId: user.id,
      productId,
    });

    if (windowExpired) {
      return NextResponse.json(
        { error: `The review window for this order has closed (${REVIEW_WINDOW_DAYS} days after delivery).` },
        { status: 403 }
      );
    }

    if (!verifiedOrder) {
      return NextResponse.json(
        { error: 'Only verified buyers can review this product after delivery.' },
        { status: 403 }
      );
    }

    // One-review-per-product check.
    const existingResult = await supabase
      .from('reviews')
      .select('id, deleted_at')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (isMissingReviewColumnsError(existingResult.error)) {
      console.error('[reviews]', _REVIEWS_MIGRATION_HINT_INTERNAL);
      return NextResponse.json({ error: REVIEWS_MIGRATION_HINT }, { status: 500 });
    }

    if (existingResult.error && existingResult.error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: existingResult.error.message || 'Failed to check existing review' },
        { status: 500 }
      );
    }

    if (existingResult.data?.id && !existingResult.data.deleted_at) {
      return NextResponse.json(
        { error: 'You have already reviewed this product. Edit your review instead.' },
        { status: 409 }
      );
    }

    // Suspicious-review detection: flag instead of auto-approve when score >= 2.
    const { score, signals } = await suspicionScore(supabase, { userId: user.id, comment, accountCreatedAt: user.created_at });
    const reviewStatus = score >= 2 ? 'flagged' : 'approved';

    const payload = {
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      status: reviewStatus,
      is_verified_purchase: true,
      purchase_order_id: verifiedOrder.id,
      edited_at: null,
      deleted_at: null,
      moderation_note: signals.length ? signals.join(', ') : null,
      moderated_at: null,
      moderated_by: null,
      seller_reply: null,
      seller_replied_at: null,
      seller_replied_by: null,
    };

    const query = existingResult.data?.id
      ? supabase.from('reviews').update(payload).eq('id', existingResult.data.id)
      : supabase.from('reviews').insert(payload);

    const saveResult = await query
      .select('id, product_id, user_id, rating, comment, status, is_verified_purchase, purchase_order_id, seller_reply, seller_replied_at, created_at, edited_at')
      .single();

    if (isMissingReviewColumnsError(saveResult.error)) {
      return NextResponse.json({ error: REVIEWS_MIGRATION_HINT }, { status: 500 });
    }

    if (saveResult.error) {
      return NextResponse.json({ error: saveResult.error.message || 'Failed to submit review' }, { status: 500 });
    }

    invalidateReviewCache(saveResult.data);

    return NextResponse.json({
      ...saveResult.data,
      flagged: reviewStatus === 'flagged',
      user: {
        full_name: user.user_metadata?.full_name || null,
      },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await getAuthedUser();
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { user, supabase } = auth;

    const body = await request.json().catch(() => ({}));
    const reviewId = String(body?.reviewId || '').trim();
    const rating = body?.rating === undefined ? null : Number(body.rating);
    const comment = body?.comment === undefined ? null : normalizeText(body.comment);

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const updates = {};
    if (rating !== null) updates.rating = rating;
    if (comment !== null) updates.comment = comment;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }
    updates.edited_at = new Date().toISOString();

    // Re-run suspicion check on edited content; re-flag if score rises again.
    if (comment !== null) {
      const { score, signals } = await suspicionScore(supabase, { userId: user.id, comment, accountCreatedAt: user.created_at });
      if (score >= 2) {
        updates.status = 'flagged';
        updates.moderation_note = signals.join(', ');
      }
    }

    const result = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select('id, product_id, user_id, rating, comment, status, is_verified_purchase, purchase_order_id, seller_reply, seller_replied_at, created_at, edited_at')
      .single();

    if (isMissingReviewColumnsError(result.error)) {
      return NextResponse.json({ error: REVIEWS_MIGRATION_HINT }, { status: 500 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to update review' }, { status: 400 });
    }

    invalidateReviewCache(result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      flagged: result.data.status === 'flagged',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await getAuthedUser();
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { user, supabase } = auth;

    const { searchParams } = new URL(request.url);
    const reviewId = String(searchParams.get('reviewId') || '').trim();

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    const result = await supabase
      .from('reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select('id, product_id')
      .single();

    if (isMissingReviewColumnsError(result.error)) {
      return NextResponse.json({ error: REVIEWS_MIGRATION_HINT }, { status: 500 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to delete review' }, { status: 400 });
    }

    invalidateReviewCache(result.data);

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
