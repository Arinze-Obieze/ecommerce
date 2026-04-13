import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';
import { writeActivityLog, writeAnalyticsEvent } from '@/utils/serverTelemetry';
import { notifyOrderCompletionEmails } from '@/utils/emailNotifications';
import { ensureEscrowFundedForOrder } from '@/utils/escrow';

// ── Ranking engine event logger (server-side, no browser APIs needed) ────────
// We insert directly via the service client instead of using the browser util.
async function logOrderPlacedEvents({ serviceClient, orderId, userId }) {
  try {
    // Fetch all line items for this order
    const { data: items, error: itemsError } = await serviceClient
      .from('order_items')
      .select('product_id, quantity, price')
      .eq('order_id', orderId)

    if (itemsError || !items?.length) {
      console.warn('[webhook] logOrderPlacedEvents — no items found:', itemsError?.message)
      return
    }

    // Build one product_events row per line item
    const now = new Date().toISOString()
    const rows = items.map((item) => ({
      product_id:  Number(item.product_id),
      user_id:     userId ?? null,
      // Webhooks are server-side — no browser session_id available.
      // Use a stable order-scoped ID so the event is never null.
      session_id:  `order_${orderId}`,
      event_type:  'order_placed',
      source:      'checkout',
      metadata: {
        order_id:   orderId,
        quantity:   Number(item.quantity),
        unit_price: Number(item.price),
        // revenue = what the scoring engine uses for revenue_30d
        revenue:    Number(item.price) * Number(item.quantity),
      },
      occurred_at: now,
    }))

    const { error: insertError } = await serviceClient
      .from('product_events')
      .insert(rows)

    if (insertError) {
      console.warn('[webhook] product_events insert failed:', insertError.message)
    } else {
      console.log(`[webhook] Logged order_placed for ${rows.length} products — order ${orderId}`)
    }
  } catch (err) {
    // Non-fatal — never throw from here
    console.warn('[webhook] logOrderPlacedEvents unexpected error:', err?.message)
  }
}

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession:    false,
        autoRefreshToken:  false,
        detectSessionInUrl: false,
      },
    }
  )
}

function extractOrderIdFromMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return null

  if (metadata.order_id) {
    return String(metadata.order_id)
  }

  if (Array.isArray(metadata.custom_fields)) {
    const orderField = metadata.custom_fields.find(
      (field) => field?.variable_name === 'order_id'
    )
    if (orderField?.value) {
      return String(orderField.value)
    }
  }

  return null
}

function verifyWebhookSignature(rawBody, secret, signature) {
  if (!signature || !secret) return false
  const hashHex = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex')

  try {
    const expected = Buffer.from(hashHex, 'hex')
    const received = Buffer.from(signature, 'hex')
    if (expected.length !== received.length) return false
    return crypto.timingSafeEqual(expected, received)
  } catch {
    return false
  }
}

async function updatePayoutTransferStatus({ serviceClient, eventType, eventData }) {
  const reference    = String(eventData?.reference || '').trim()
  const transferCode = String(eventData?.transfer_code || '').trim()
  const lookup = reference
    ? serviceClient
        .from('store_payouts')
        .select('id, order_id, store_id, escrow_transaction_id, status, paystack_reference, paystack_transfer_code')
        .eq('paystack_reference', reference)
        .maybeSingle()
    : serviceClient
        .from('store_payouts')
        .select('id, order_id, store_id, escrow_transaction_id, status, paystack_reference, paystack_transfer_code')
        .eq('paystack_transfer_code', transferCode)
        .maybeSingle()

  const { data: payout, error: payoutError } = await lookup
  if (payoutError) return { ok: false, error: payoutError.message }
  if (!payout?.id) return { ok: false, error: 'Payout not found for transfer webhook' }

  const nowIso     = new Date().toISOString()
  const isSuccess  = eventType === 'transfer.success'
  const isFailure  = eventType === 'transfer.failed' || eventType === 'transfer.reversed'
  const nextStatus = isSuccess ? 'success' : isFailure ? 'failed' : null

  if (!nextStatus) return { ok: true, ignored: true }

  const { error: payoutUpdateError } = await serviceClient
    .from('store_payouts')
    .update({
      status:                 nextStatus,
      released_at:            isSuccess ? nowIso : null,
      failure_reason:         isSuccess ? null : (eventData?.complete_message || eventData?.reason || eventData?.message || eventType),
      paystack_transfer_code: transferCode || payout.paystack_transfer_code || null,
      metadata: {
        gateway_event:       eventType,
        gateway_status:      eventData?.status || nextStatus,
        webhook_received_at: nowIso,
      },
    })
    .eq('id', payout.id)

  if (payoutUpdateError) return { ok: false, error: payoutUpdateError.message }

  if (isSuccess) {
    if (payout.escrow_transaction_id) {
      await serviceClient
        .from('escrow_transactions')
        .update({
          status: 'released',
          metadata: {
            gateway_event:  eventType,
            transfer_code:  transferCode || null,
            transferred_at: nowIso,
          },
        })
        .eq('id', payout.escrow_transaction_id)
    }

    await serviceClient
      .from('orders')
      .update({
        escrow_status:      'released',
        escrow_released_at: nowIso,
      })
      .eq('id', payout.order_id)
  } else {
    await serviceClient
      .from('orders')
      .update({ escrow_status: 'funded' })
      .eq('id', payout.order_id)
      .neq('escrow_status', 'released')
  }

  return { ok: true, payoutId: payout.id, status: nextStatus }
}

export async function POST(request) {
  const startedAt = Date.now()

  try {
    const rateLimit = await enforceRateLimit({
      request,
      scope:         'paystack-webhook',
      identifier:    'webhook',
      limit:         240,
      windowSeconds: 60,
    })

    if (!rateLimit.allowed) {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_RATE_LIMITED',
        status:     'failure',
        statusCode: 429,
        message:    'Webhook rate limited',
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json({ error: 'Missing Paystack secret' }, { status: 500 })
    }

    const signature = request.headers.get('x-paystack-signature')
    const rawBody   = await request.text()

    if (!verifyWebhookSignature(rawBody, paystackSecret, signature)) {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_INVALID_SIGNATURE',
        status:     'failure',
        statusCode: 401,
        message:    'Invalid paystack webhook signature',
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const eventPayload = JSON.parse(rawBody)
    const eventType    = String(eventPayload?.event || '').trim().toLowerCase()

    if (['transfer.success', 'transfer.failed', 'transfer.reversed'].includes(eventType)) {
      const serviceClient  = createServiceClient()
      const transferResult = await updatePayoutTransferStatus({
        serviceClient,
        eventType,
        eventData: eventPayload?.data || {},
      })

      if (!transferResult.ok) {
        await writeActivityLog({
          request,
          level:      'WARN',
          service:    'payment-service',
          action:     'PAYSTACK_TRANSFER_WEBHOOK_FAILED',
          status:     'failure',
          statusCode: 200,
          message:    transferResult.error || 'Transfer webhook processing failed',
          metadata: {
            eventType,
            reference:    eventPayload?.data?.reference || null,
            transferCode: eventPayload?.data?.transfer_code || null,
          },
          durationMs: Date.now() - startedAt,
        })
      }

      return NextResponse.json({ success: true })
    }

    if (eventType !== 'charge.success') {
      return NextResponse.json({ success: true })
    }

    const reference = eventPayload?.data?.reference
    const orderId   = extractOrderIdFromMetadata(eventPayload?.data?.metadata)

    if (!reference || !orderId) {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_INVALID_PAYLOAD',
        status:     'failure',
        statusCode: 400,
        message:    'Missing reference or order metadata in webhook payload',
        metadata:   { reference, orderId },
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json({ error: 'Missing reference or order metadata' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .select('id, user_id, total_amount, status, payment_reference')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_ORDER_NOT_FOUND',
        status:     'failure',
        statusCode: 404,
        message:    'Webhook order lookup failed',
        metadata:   { orderId, reference },
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Order already completed' })
    }

    // Re-verify against Paystack to avoid trusting webhook payload blindly
    const verifyRes  = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    })
    const verifyData = await verifyRes.json()

    if (!verifyData?.status || verifyData?.data?.status !== 'success') {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_VERIFY_FAILED',
        status:     'failure',
        statusCode: 400,
        message:    'Webhook verification from gateway not successful',
        metadata:   { orderId, reference },
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json({ error: 'Payment not verified as successful' }, { status: 400 })
    }

    const paidAmount     = Number(verifyData?.data?.amount)
    const expectedAmount = Math.round(Number(order.total_amount) * 100)
    const currency       = String(verifyData?.data?.currency || '').toUpperCase()

    if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_AMOUNT_MISMATCH',
        status:     'failure',
        statusCode: 409,
        message:    'Webhook amount mismatch',
        metadata:   { orderId, reference, paidAmount, expectedAmount },
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 409 })
    }

    if (currency && currency !== 'NGN') {
      return NextResponse.json({ error: 'Unexpected payment currency' }, { status: 409 })
    }

    const { data: updatedRows, error: updateError } = await serviceClient
      .from('orders')
      .update({ status: 'completed', payment_reference: reference })
      .eq('id', orderId)
      .eq('status', 'pending')
      .is('payment_reference', null)
      .select('id')

    if (updateError) {
      await writeActivityLog({
        request,
        level:      'ERROR',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_UPDATE_FAILED',
        status:     'failure',
        statusCode: 500,
        message:    updateError.message,
        metadata:   { orderId, reference },
        errorCode:  updateError.code || null,
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { data: latestOrder } = await serviceClient
        .from('orders')
        .select('status, payment_reference')
        .eq('id', orderId)
        .single()

      if (latestOrder?.status === 'completed' && latestOrder.payment_reference === reference) {
        return NextResponse.json({ success: true, message: 'Order already completed' })
      }
      return NextResponse.json({ error: 'Order not payable' }, { status: 409 })
    }

    // ── Log order_placed event for every product in this order ────────────
    // Runs after the order row is confirmed updated — non-blocking, never
    // throws. One product_events row per line item so the ranking engine
    // gets per-product sales + revenue signals.
    await logOrderPlacedEvents({
      serviceClient,
      orderId:  order.id,
      userId:   order.user_id || null,
    })

    // ── Existing telemetry (unchanged) ────────────────────────────────────
    await writeAnalyticsEvent({
      eventName: 'purchase',
      userId:    order.user_id || null,
      path:      '/cart',
      properties: {
        order_id:  order.id,
        reference,
        amount:    Number(order.total_amount || 0),
        source:    'webhook',
      },
    })

    await writeActivityLog({
      request,
      level:      'INFO',
      service:    'payment-service',
      action:     'PAYSTACK_WEBHOOK_PROCESSED',
      status:     'success',
      statusCode: 200,
      message:    'Webhook processed and order completed',
      userId:     order.user_id || null,
      metadata:   { orderId, reference },
      durationMs: Date.now() - startedAt,
    })

    const escrowResult = await ensureEscrowFundedForOrder({
      serviceClient,
      orderId: order.id,
    })

    if (!escrowResult.ok) {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_ESCROW_FUNDING_FAILED',
        status:     'failure',
        statusCode: 200,
        message:    escrowResult.error || 'Escrow funding failed after webhook completion',
        userId:     order.user_id || null,
        metadata:   { orderId, reference },
        durationMs: Date.now() - startedAt,
      })
    }

    const emailSummary = await notifyOrderCompletionEmails({
      serviceClient,
      orderId: order.id,
    })

    if (!emailSummary.ok || emailSummary.buyer?.status === 'failed' || emailSummary.sellers?.failed > 0) {
      await writeActivityLog({
        request,
        level:      'WARN',
        service:    'payment-service',
        action:     'PAYSTACK_WEBHOOK_EMAIL_NOTIFICATION_PARTIAL_FAILURE',
        status:     'failure',
        statusCode: 200,
        message:    'Webhook completed order but one or more emails failed',
        userId:     order.user_id || null,
        metadata:   { orderId, reference, emailSummary },
        durationMs: Date.now() - startedAt,
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Paystack webhook error:', error)
    await writeActivityLog({
      request,
      level:      'ERROR',
      service:    'payment-service',
      action:     'PAYSTACK_WEBHOOK_INTERNAL_ERROR',
      status:     'failure',
      statusCode: 500,
      message:    error.message || 'Internal Server Error',
      errorCode:  error.code || null,
      errorStack: error.stack || null,
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}