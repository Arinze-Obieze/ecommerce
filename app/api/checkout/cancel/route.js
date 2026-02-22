import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/utils/rateLimit';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

async function releaseOrderStockAtomic(client, orderId) {
  const { error } = await client.rpc('release_order_stock', {
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
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const serviceClient = createServiceClient();
    const { data: order, error: orderError } = await serviceClient
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

    const { data: claimedRows, error: claimError } = await serviceClient
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
      await releaseOrderStockAtomic(serviceClient, orderId);
    } catch (releaseError) {
      await serviceClient
        .from('orders')
        .update({ status: 'pending' })
        .eq('id', orderId)
        .eq('status', 'processing')
        .is('payment_reference', null);
      throw releaseError;
    }

    const { error: cancelError } = await serviceClient
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
