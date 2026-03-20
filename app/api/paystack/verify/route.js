import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/utils/rateLimit';
import { writeActivityLog, writeAnalyticsEvent } from '@/utils/serverTelemetry';
import { notifyOrderCompletionEmails } from '@/utils/emailNotifications';

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

function extractOrderIdFromMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return null;

  if (metadata.order_id) {
    return String(metadata.order_id);
  }

  if (Array.isArray(metadata.custom_fields)) {
    const orderField = metadata.custom_fields.find(
      (field) => field?.variable_name === 'order_id'
    );
    if (orderField?.value) {
      return String(orderField.value);
    }
  }

  return null;
}

async function releaseOrderStockAtomic(client, orderId) {
  const { error } = await client.rpc('release_order_stock', {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(`Could not release reserved stock: ${error.message}`);
  }
}

async function cancelPendingOrderAndReleaseStock(client, order) {
  const { data: claimedRows, error: claimError } = await client
    .from('orders')
    .update({ status: 'processing' })
    .eq('id', order.id)
    .eq('status', 'pending')
    .is('payment_reference', null)
    .select('id');

  if (claimError) {
    throw new Error(`Could not claim order for cancellation: ${claimError.message}`);
  }

  if (!claimedRows || claimedRows.length === 0) {
    return {
      cancelled: false,
      reason: 'Order is no longer pending',
    };
  }

  try {
    await releaseOrderStockAtomic(client, order.id);
  } catch (releaseError) {
    // Avoid leaving order in transient processing state if stock release fails.
    await client
      .from('orders')
      .update({ status: 'pending' })
      .eq('id', order.id)
      .eq('status', 'processing')
      .is('payment_reference', null);
    throw releaseError;
  }

  const { error: cancelError } = await client
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)
    .eq('status', 'processing');

  if (cancelError) {
    throw new Error(`Could not finalize cancellation: ${cancelError.message}`);
  }

  return { cancelled: true };
}

function buildPaymentValidation(verifyData, order) {
  const paymentData = verifyData?.data;
  const paidAmount = Number(paymentData?.amount);
  const expectedAmount = Math.round(Number(order.total_amount) * 100);
  const currency = String(paymentData?.currency || '').toUpperCase();
  const metadataOrderId = extractOrderIdFromMetadata(paymentData?.metadata);

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    return { ok: false, error: 'Invalid payment amount from Paystack' };
  }

  if (paidAmount !== expectedAmount) {
    return {
      ok: false,
      error: `Payment amount mismatch. Expected ${expectedAmount}, got ${paidAmount}`,
    };
  }

  if (currency && currency !== 'NGN') {
    return { ok: false, error: `Unexpected payment currency: ${currency}` };
  }

  if (metadataOrderId && metadataOrderId !== String(order.id)) {
    return {
      ok: false,
      error: `Payment metadata order mismatch. Expected ${order.id}, got ${metadataOrderId}`,
    };
  }

  return { ok: true };
}

export async function POST(request) {
  const serviceClient = createServiceClient();
  const startedAt = Date.now();
  let currentUser = null;

  try {
    const { reference, orderId } = await request.json();

    if (!reference || !orderId) {
      return NextResponse.json({ error: 'Missing reference or orderId' }, { status: 400 });
    }

    const authClient = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();
    currentUser = user;

    if (authError || !user) {
      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'payment-service',
        action: 'PAYMENT_VERIFY_UNAUTHENTICATED',
        status: 'failure',
        statusCode: 401,
        message: 'Authentication required for payment verification',
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'paystack-verify',
      identifier: user.id,
      limit: 40,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'payment-service',
        action: 'PAYMENT_VERIFY_RATE_LIMITED',
        status: 'failure',
        statusCode: 429,
        message: 'Payment verify rate limit exceeded',
        userId: user.id,
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again shortly.' },
        { status: 429 }
      );
    }

    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .select(`
        id,
        user_id,
        total_amount,
        status,
        payment_reference
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'payment-service',
        action: 'PAYMENT_VERIFY_ORDER_NOT_FOUND',
        status: 'failure',
        statusCode: 404,
        message: 'Order not found during payment verification',
        userId: user.id,
        metadata: { orderId, reference },
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'payment-service',
        action: 'PAYMENT_VERIFY_FORBIDDEN',
        status: 'failure',
        statusCode: 403,
        message: 'User attempted to verify payment for another user order',
        userId: user.id,
        metadata: { orderId, reference },
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status === 'completed') {
      if (order.payment_reference === reference) {
        return NextResponse.json({
          success: true,
          orderId,
          message: 'Order already verified',
        });
      }
      return NextResponse.json(
        { error: 'Order is already completed with a different payment reference' },
        { status: 409 }
      );
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 409 });
    }

    if (order.payment_reference && order.payment_reference !== reference) {
      return NextResponse.json(
        { error: 'Order has already been linked to another payment reference' },
        { status: 409 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY;
    if (!paystackSecret) {
      console.error('Paystack Secret Key Missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const verifyData = await verifyRes.json();
    const paystackStatus = String(verifyData?.data?.status || '').toLowerCase();

    if (!verifyData?.status) {
      await writeActivityLog({
        request,
        level: 'ERROR',
        service: 'payment-service',
        action: 'PAYMENT_GATEWAY_VERIFY_FAILED',
        status: 'failure',
        statusCode: 502,
        message: 'Unable to verify payment with gateway',
        userId: user.id,
        metadata: { orderId, reference },
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json({ error: 'Unable to verify payment with gateway' }, { status: 502 });
    }

    if (paystackStatus !== 'success') {
      // Only cancel and release on definitive failure statuses.
      if (['failed', 'abandoned', 'reversed'].includes(paystackStatus)) {
        const cancelResult = await cancelPendingOrderAndReleaseStock(serviceClient, order);
        if (cancelResult.cancelled) {
          await writeAnalyticsEvent({
            eventName: 'payment_failed',
            userId: user.id,
            path: '/cart',
            properties: {
              order_id: order.id,
              reference,
              status: paystackStatus,
            },
          });
          await writeActivityLog({
            request,
            level: 'WARN',
            service: 'payment-service',
            action: 'PAYMENT_FAILED_STOCK_RELEASED',
            status: 'failure',
            statusCode: 400,
            message: 'Payment failed and stock released',
            userId: user.id,
            metadata: { orderId: order.id, reference, paystackStatus },
            durationMs: Date.now() - startedAt,
          });
          return NextResponse.json(
            { error: 'Payment failed. Reserved stock has been released.' },
            { status: 400 }
          );
        }
      }

      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'payment-service',
        action: 'PAYMENT_NOT_SUCCESSFUL',
        status: 'failure',
        statusCode: 400,
        message: `Payment is not successful (${paystackStatus || 'unknown'})`,
        userId: user.id,
        metadata: { orderId: order.id, reference, paystackStatus },
        durationMs: Date.now() - startedAt,
      });

      return NextResponse.json(
        { error: `Payment is not successful (${paystackStatus || 'unknown'})` },
        { status: 400 }
      );
    }

    const validation = buildPaymentValidation(verifyData, order);
    if (!validation.ok) {
      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'payment-service',
        action: 'PAYMENT_VALIDATION_FAILED',
        status: 'failure',
        statusCode: 409,
        message: validation.error,
        userId: user.id,
        metadata: { orderId: order.id, reference },
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json({ error: validation.error }, { status: 409 });
    }

    const { data: completedRows, error: updateError } = await serviceClient
      .from('orders')
      .update({ status: 'completed', payment_reference: reference })
      .eq('id', orderId)
      .eq('status', 'pending')
      .is('payment_reference', null)
      .select('id');

    if (updateError) {
      console.error('Order Update Error:', updateError);
      await writeActivityLog({
        request,
        level: 'ERROR',
        service: 'payment-service',
        action: 'PAYMENT_ORDER_UPDATE_FAILED',
        status: 'failure',
        statusCode: 500,
        message: updateError.message,
        userId: user.id,
        metadata: { orderId: order.id, reference },
        errorCode: updateError.code || null,
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json(
        { error: 'Failed to update order status: ' + updateError.message },
        { status: 500 }
      );
    }

    if (!completedRows || completedRows.length === 0) {
      const { data: latestOrder } = await serviceClient
        .from('orders')
        .select('status, payment_reference')
        .eq('id', orderId)
        .single();

      if (latestOrder?.status === 'completed' && latestOrder.payment_reference === reference) {
        return NextResponse.json({
          success: true,
          orderId,
          message: 'Order already verified',
        });
      }

      return NextResponse.json(
        { error: 'Order could not be finalized because it is no longer in a payable state' },
        { status: 409 }
      );
    }

    await writeAnalyticsEvent({
      eventName: 'purchase',
      userId: user.id,
      path: '/cart',
      properties: {
        order_id: order.id,
        reference,
        amount: Number(order.total_amount || 0),
      },
    });
    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'payment-service',
      action: 'PAYMENT_VERIFIED',
      status: 'success',
      statusCode: 200,
      message: 'Payment verified and order completed',
      userId: user.id,
      metadata: { orderId: order.id, reference },
      durationMs: Date.now() - startedAt,
    });

    const emailSummary = await notifyOrderCompletionEmails({
      serviceClient,
      orderId: order.id,
    });

    if (!emailSummary.ok || emailSummary.buyer?.status === 'failed' || emailSummary.sellers?.failed > 0) {
      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'payment-service',
        action: 'PAYMENT_EMAIL_NOTIFICATION_PARTIAL_FAILURE',
        status: 'failure',
        statusCode: 200,
        message: 'Payment succeeded but one or more order emails failed',
        userId: user.id,
        metadata: { orderId: order.id, emailSummary },
        durationMs: Date.now() - startedAt,
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Payment verified and order completed',
    });
  } catch (err) {
    console.error('Verify Error:', err);
    await writeActivityLog({
      request,
      level: 'ERROR',
      service: 'payment-service',
      action: 'PAYMENT_VERIFY_INTERNAL_ERROR',
      status: 'failure',
      statusCode: 500,
      message: err.message || 'Internal Server Error',
      userId: currentUser?.id || null,
      errorCode: err.code || null,
      errorStack: err.stack || null,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
