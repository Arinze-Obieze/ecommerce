import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';

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

function hasValidCronSecret(request) {
  const expectedSecret = process.env.CHECKOUT_CLEANUP_SECRET;
  if (!expectedSecret) return false;

  const headerSecret = request.headers.get('x-cleanup-secret');
  const authHeader = request.headers.get('authorization');
  const bearerSecret = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  return headerSecret === expectedSecret || bearerSecret === expectedSecret;
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
    if (!hasValidCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'checkout-cleanup',
      identifier: 'cron',
      limit: 30,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitPayload('Too many cleanup requests', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
    }

    const ttlMinutes = Number.parseInt(process.env.CHECKOUT_RESERVATION_TTL_MINUTES || '30', 10);
    const safeTtlMinutes = Number.isInteger(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes : 30;
    const cutoffIso = new Date(Date.now() - safeTtlMinutes * 60 * 1000).toISOString();

    const serviceClient = createServiceClient();

    const { data: candidates, error: selectError } = await serviceClient
      .from('orders')
      .select('id')
      .eq('status', 'pending')
      .is('payment_reference', null)
      .lt('created_at', cutoffIso)
      .order('created_at', { ascending: true })
      .limit(500);

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    const ids = (candidates || []).map((order) => order.id);
    let cancelledCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const orderId of ids) {
      const { data: claimedRows, error: claimError } = await serviceClient
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', orderId)
        .eq('status', 'pending')
        .is('payment_reference', null)
        .select('id');

      if (claimError) {
        errors.push({ orderId, error: claimError.message });
        continue;
      }

      if (!claimedRows || claimedRows.length === 0) {
        skippedCount += 1;
        continue;
      }

      try {
        await releaseOrderStockAtomic(serviceClient, orderId);

        const { error: cancelError } = await serviceClient
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)
          .eq('status', 'processing')
          .is('payment_reference', null);

        if (cancelError) {
          throw new Error(cancelError.message);
        }

        cancelledCount += 1;
      } catch (error) {
        await serviceClient
          .from('orders')
          .update({ status: 'pending' })
          .eq('id', orderId)
          .eq('status', 'processing')
          .is('payment_reference', null);

        errors.push({ orderId, error: error.message || 'Unknown cleanup error' });
      }
    }

    return NextResponse.json({
      success: true,
      checked: ids.length,
      cancelled: cancelledCount,
      skipped: skippedCount,
      errors,
      cutoffIso,
      ttlMinutes: safeTtlMinutes,
    });
  } catch (error) {
    console.error('Checkout cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return POST(request);
}
