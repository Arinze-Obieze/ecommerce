import { NextResponse } from 'next/server';
import { createAdminClient, createClient as createServerClient } from '@/utils/supabase/server';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';

async function releaseOrderStockAtomic(adminClient, orderId) {
  const { error } = await adminClient.rpc('release_order_stock', {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(`Could not release reserved stock: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const authClient = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'checkout-cancel',
      identifier: user.id,
      limit: 40,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
    }

    const { data: order, error: orderError } = await authClient
      .from('orders')
      .select(`
        id,
        user_id,
        status,
        payment_reference
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status === 'completed' || order.payment_reference) {
      return NextResponse.json({ error: 'Paid orders cannot be cancelled from checkout' }, { status: 409 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        orderId,
        message: 'Order already cancelled',
      });
    }

    const adminClient = await createAdminClient();
    const { data: claimedRows, error: claimError } = await adminClient
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId)
      .eq('status', 'pending')
      .is('payment_reference', null)
      .select('id');

    if (claimError) {
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    if (!claimedRows || claimedRows.length === 0) {
      return NextResponse.json(
        { error: 'Order is no longer in cancellable state' },
        { status: 409 }
      );
    }

    try {
      await releaseOrderStockAtomic(adminClient, orderId);
    } catch (releaseError) {
      await adminClient
        .from('orders')
        .update({ status: 'pending' })
        .eq('id', orderId)
        .eq('status', 'processing')
        .is('payment_reference', null);
      throw releaseError;
    }

    const { error: cancelError } = await adminClient
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('status', 'processing');

    if (cancelError) {
      return NextResponse.json({ error: cancelError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order cancelled and stock released',
    });
  } catch (error) {
    console.error('Cancel checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
