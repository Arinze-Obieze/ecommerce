import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';
import { writeActivityLog } from '@/utils/serverTelemetry';
import { createUserNotification } from '@/utils/notifications';
import { sendReturnRequestStatusEmail } from '@/utils/emailNotifications';

const MISSING_TABLE_HINT =
  'Database is missing public.order_return_requests. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function normalizeText(value, max = 1000) {
  const text = String(value || '').trim().slice(0, max);
  return text || null;
}

function isMissingReturnsTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('order_return_requests') && message.includes('does not exist'));
}

async function getStoreOrderIds(ctx) {
  const { data: productRows, error: productError } = await ctx.adminClient
    .from('products')
    .select('id')
    .eq('store_id', ctx.membership.store_id)
    .limit(5000);

  if (productError) {
    throw new Error(productError.message || 'Failed to load store products');
  }

  const productIds = (productRows || []).map((row) => row.id);
  if (productIds.length === 0) return [];

  const { data: orderItems, error: itemsError } = await ctx.adminClient
    .from('order_items')
    .select('order_id, product_id')
    .in('product_id', productIds)
    .limit(10000);

  if (itemsError) {
    throw new Error(itemsError.message || 'Failed to load store order items');
  }

  return [...new Set((orderItems || []).map((row) => row.order_id).filter(Boolean))];
}

export async function PATCH(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_orders_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const nextStatus = String(body?.status || '').trim().toLowerCase();
  const nextRefundStatus = String(body?.refund_status || '').trim().toLowerCase();
  const note = normalizeText(body?.note, 1500);
  const refundReference = normalizeText(body?.refund_reference, 255);
  const refundAmount = body?.refund_amount === undefined || body?.refund_amount === null || body?.refund_amount === ''
    ? null
    : Number(body.refund_amount);

  const validStatuses = new Set(['pending', 'approved', 'rejected', 'received', 'refunded', 'closed']);
  const validRefundStatuses = new Set(['not_requested', 'pending', 'processing', 'refunded', 'rejected']);

  if (!validStatuses.has(nextStatus)) {
    return NextResponse.json({ error: 'Invalid return status' }, { status: 400 });
  }

  if (nextRefundStatus && !validRefundStatuses.has(nextRefundStatus)) {
    return NextResponse.json({ error: 'Invalid refund status' }, { status: 400 });
  }

  try {
    const { id } = await params;
    const orderIds = await getStoreOrderIds(ctx);

    if (!orderIds.includes(id)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentResult = await ctx.adminClient
      .from('order_return_requests')
      .select('id, order_id, user_id, status, refund_status, refund_amount')
      .eq('order_id', id)
      .maybeSingle();

    if (isMissingReturnsTableError(currentResult.error)) {
      return NextResponse.json({ error: MISSING_TABLE_HINT }, { status: 500 });
    }

    if (currentResult.error) {
      return NextResponse.json({ error: currentResult.error.message || 'Failed to load return request' }, { status: 500 });
    }

    if (!currentResult.data) {
      return NextResponse.json({ error: 'No return request exists for this order' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updates = {
      status: nextStatus,
      seller_note: note,
      reviewed_at: now,
      reviewed_by: ctx.user.id,
    };

    if (nextStatus === 'approved') updates.approved_at = now;
    if (nextStatus === 'received') updates.received_at = now;
    if (nextStatus === 'refunded') updates.refunded_at = now;

    if (nextRefundStatus) {
      updates.refund_status = nextRefundStatus;
    } else if (nextStatus === 'approved' || nextStatus === 'received') {
      updates.refund_status = 'pending';
    } else if (nextStatus === 'refunded') {
      updates.refund_status = 'refunded';
    }

    if (refundReference) updates.refund_reference = refundReference;
    if (refundAmount !== null && Number.isFinite(refundAmount)) updates.refund_amount = refundAmount;
    if (updates.refund_status === 'pending' || updates.refund_status === 'processing') {
      updates.refund_requested_at = now;
    }

    const result = await ctx.adminClient
      .from('order_return_requests')
      .update(updates)
      .eq('id', currentResult.data.id)
      .select('id, order_id, status, refund_status, reason, requested_resolution, details, seller_note, buyer_note, admin_note, refund_amount, refund_reference, approved_at, received_at, refund_requested_at, refunded_at, reviewed_at, created_at, updated_at')
      .single();

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to update return request' }, { status: 400 });
    }

    const { data: buyer } = await ctx.adminClient
      .from('users')
      .select('id, full_name, email')
      .eq('id', currentResult.data.user_id)
      .maybeSingle();

    if (buyer?.id) {
      await createUserNotification(ctx.adminClient, {
        userId: buyer.id,
        storeId: ctx.membership.store_id,
        type: 'return_request_updated',
        title: `Return updated for order ${id.slice(0, 8)}`,
        body: `Status: ${result.data.status}. Refund: ${result.data.refund_status}.`,
        actionUrl: `/profile/orders/${id}`,
        entityType: 'order_return_request',
        entityId: result.data.id,
      });

      if (buyer.email) {
        await sendReturnRequestStatusEmail({
          to: buyer.email,
          recipientName: buyer.full_name,
          orderId: id,
          status: result.data.status,
          refundStatus: result.data.refund_status,
          note,
        });
      }
    }

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'store-orders-service',
      action: 'STORE_ORDER_RETURN_UPDATED',
      status: 'success',
      statusCode: 200,
      userId: ctx.user.id,
      message: 'Store return request updated',
      metadata: {
        storeId: ctx.membership.store_id,
        orderId: id,
        status: result.data.status,
        refundStatus: result.data.refund_status,
      },
    });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update return request' }, { status: 500 });
  }
}
