import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const REVIEWS_MIGRATION_HINT =
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
  return user;
}

async function findVerifiedPurchase(adminClient, { userId, productId }) {
  const { data: orderItems, error } = await adminClient
    .from('order_items')
    .select('order_id, product_id')
    .eq('product_id', productId)
    .limit(200);

  if (error) {
    throw new Error(error.message || 'Failed to verify purchase history');
  }

  const orderIds = [...new Set((orderItems || []).map((row) => row.order_id).filter(Boolean))];
  if (orderIds.length === 0) return null;

  const { data: orders, error: ordersError } = await adminClient
    .from('orders')
    .select('id, user_id, status, fulfillment_status')
    .eq('user_id', userId)
    .in('id', orderIds)
    .limit(200);

  if (ordersError) {
    throw new Error(ordersError.message || 'Failed to verify delivered orders');
  }

  const deliveredOrder = (orders || []).find((order) =>
    ['delivered', 'delivered_confirmed'].includes(String(order.fulfillment_status || '').toLowerCase()) &&
    String(order.status || '').toLowerCase() !== 'cancelled'
  );

  return deliveredOrder || null;
}

export async function POST(request) {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = await createAdminClient();
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

    const verifiedOrder = await findVerifiedPurchase(adminClient, {
      userId: user.id,
      productId,
    });

    if (!verifiedOrder) {
      return NextResponse.json({ error: 'Only verified buyers can review this product after delivery.' }, { status: 403 });
    }

    const existingResult = await adminClient
      .from('reviews')
      .select('id, deleted_at')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (isMissingReviewColumnsError(existingResult.error)) {
      return NextResponse.json({ error: REVIEWS_MIGRATION_HINT }, { status: 500 });
    }

    if (existingResult.error && existingResult.error.code !== 'PGRST116') {
      return NextResponse.json({ error: existingResult.error.message || 'Failed to check existing review' }, { status: 500 });
    }

    if (existingResult.data?.id && !existingResult.data.deleted_at) {
      return NextResponse.json({ error: 'You have already reviewed this product. Edit your review instead.' }, { status: 409 });
    }

    const payload = {
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      status: 'approved',
      is_verified_purchase: true,
      purchase_order_id: verifiedOrder.id,
      edited_at: null,
      deleted_at: null,
      moderation_note: null,
      moderated_at: null,
      moderated_by: null,
      seller_reply: null,
      seller_replied_at: null,
      seller_replied_by: null,
    };

    const query = existingResult.data?.id
      ? adminClient.from('reviews').update(payload).eq('id', existingResult.data.id)
      : adminClient.from('reviews').insert(payload);

    const saveResult = await query
      .select('id, product_id, user_id, rating, comment, status, is_verified_purchase, purchase_order_id, seller_reply, seller_replied_at, created_at, edited_at')
      .single();

    if (isMissingReviewColumnsError(saveResult.error)) {
      return NextResponse.json({ error: REVIEWS_MIGRATION_HINT }, { status: 500 });
    }

    if (saveResult.error) {
      return NextResponse.json({ error: saveResult.error.message || 'Failed to submit review' }, { status: 500 });
    }

    const { data: profile } = await adminClient
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      ...saveResult.data,
      user: {
        full_name: profile?.full_name || user.user_metadata?.full_name || null,
      },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = await createAdminClient();
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

    const result = await adminClient
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

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = await createAdminClient();
    const { searchParams } = new URL(request.url);
    const reviewId = String(searchParams.get('reviewId') || '').trim();

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    const result = await adminClient
      .from('reviews')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select('id')
      .single();

    if (isMissingReviewColumnsError(result.error)) {
      return NextResponse.json({ error: REVIEWS_MIGRATION_HINT }, { status: 500 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to delete review' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
