import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const REVIEW_WINDOW_DAYS = 90;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get('productId'));

    if (!productId) {
      return NextResponse.json({ canReview: false, reason: 'invalid_product' });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ canReview: false, reason: 'unauthenticated' });
    }

    // Self-review guard
    const { data: productStore } = await supabase
      .from('products')
      .select('id, stores!inner(user_id)')
      .eq('id', productId)
      .maybeSingle();

    const storeOwnerId = Array.isArray(productStore?.stores)
      ? productStore.stores[0]?.user_id
      : productStore?.stores?.user_id;

    if (storeOwnerId && storeOwnerId === user.id) {
      return NextResponse.json({ canReview: false, reason: 'self_review' });
    }

    // Already reviewed?
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ canReview: false, reason: 'already_reviewed' });
    }

    // Find a qualifying delivered order
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('product_id', productId)
      .limit(200);

    const orderIds = [...new Set((orderItems || []).map((r) => r.order_id).filter(Boolean))];

    if (orderIds.length === 0) {
      return NextResponse.json({ canReview: false, reason: 'not_purchased' });
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('id, fulfillment_status, status, delivered_at, buyer_confirmed_at')
      .eq('user_id', user.id)
      .in('id', orderIds)
      .limit(200);

    const delivered = (orders || []).find((o) =>
      ['delivered', 'delivered_confirmed'].includes(String(o.fulfillment_status || '').toLowerCase()) &&
      String(o.status || '').toLowerCase() !== 'cancelled'
    );

    if (!delivered) {
      return NextResponse.json({ canReview: false, reason: 'not_delivered' });
    }

    // Review window check
    const deliveryTs = delivered.delivered_at || delivered.buyer_confirmed_at;
    if (deliveryTs) {
      const daysSince = (Date.now() - new Date(deliveryTs).getTime()) / 86_400_000;
      if (daysSince > REVIEW_WINDOW_DAYS) {
        return NextResponse.json({ canReview: false, reason: 'window_expired' });
      }
    }

    return NextResponse.json({ canReview: true });
  } catch (err) {
    return NextResponse.json({ canReview: false, reason: 'error', detail: err.message });
  }
}
