import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';
import { writeActivityLog } from '@/utils/serverTelemetry';
import { createUserNotification } from '@/utils/notifications';

const FULFILLMENT_STATUSES = ['processing', 'packed', 'shipped', 'delivered', 'issue'];
const MISSING_UPDATES_TABLE_HINT = 'Database is missing public.order_fulfillment_updates. Apply documentation/migrations/2026-04-09_store_order_fulfillment_updates.sql and retry.';

function normalizeText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function isMissingUpdatesTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('order_fulfillment_updates') && message.includes('does not exist'));
}

function isMissingCancellationTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('order_cancellation_requests') && message.includes('does not exist'));
}

function isMissingReturnsTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('order_return_requests') && message.includes('does not exist'));
}

function canUpdateStatus(currentStatus, nextStatus) {
  const current = String(currentStatus || 'processing').toLowerCase();
  const next = String(nextStatus || '').toLowerCase();

  if (!FULFILLMENT_STATUSES.includes(next)) return false;
  if (current === next) return true;

  const order = {
    processing: ['packed', 'issue'],
    packed: ['shipped', 'issue'],
    shipped: ['delivered', 'issue'],
    delivered: [],
    issue: ['processing', 'packed', 'shipped'],
  };

  return (order[current] || []).includes(next);
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

async function loadStoreOrderDetail(ctx, orderId) {
  const storeOrderIds = await getStoreOrderIds(ctx);
  if (!storeOrderIds.includes(orderId)) {
    return { order: null, items: [], shippingAddress: null, customer: null, fulfillmentUpdates: [] };
  }

  const { data: order, error: orderError } = await ctx.adminClient
    .from('orders')
    .select('id, user_id, total_amount, status, payment_reference, created_at, updated_at, fulfillment_status, escrow_status, buyer_confirmed_at, escrow_funded_at, escrow_released_at')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message || 'Failed to load order');
  }

  if (!order) {
    return { order: null, items: [], shippingAddress: null, customer: null, fulfillmentUpdates: [] };
  }

  const { data: allOrderItems, error: allItemsError } = await ctx.adminClient
    .from('order_items')
    .select('id, order_id, product_id, quantity, price, variant_id')
    .eq('order_id', orderId);

  if (allItemsError) {
    throw new Error(allItemsError.message || 'Failed to load order items');
  }

  const { data: shippingAddress, error: shippingError } = await ctx.adminClient
    .from('order_shipping_addresses')
    .select('id, label, address_line1, address_line2, city, state, postal_code, country, phone')
    .eq('order_id', orderId)
    .maybeSingle();

  if (shippingError && shippingError.code !== 'PGRST116') {
    throw new Error(shippingError.message || 'Failed to load shipping address');
  }

  const { data: customer, error: customerError } = await ctx.adminClient
    .from('users')
    .select('id, full_name, email, phone')
    .eq('id', order.user_id)
    .maybeSingle();

  if (customerError && customerError.code !== 'PGRST116') {
    throw new Error(customerError.message || 'Failed to load customer');
  }

  const productIds = [...new Set((allOrderItems || []).map((item) => item.product_id).filter(Boolean))];
  const variantIds = [...new Set((allOrderItems || []).map((item) => item.variant_id).filter(Boolean))];

  let productsById = new Map();
  let variantsById = new Map();

  if (productIds.length > 0) {
    const { data: productRows, error: productsError } = await ctx.adminClient
      .from('products')
      .select('id, store_id, name, slug, sku, image_urls')
      .in('id', productIds);

    if (productsError) {
      throw new Error(productsError.message || 'Failed to load products');
    }

    productsById = new Map((productRows || []).map((row) => [row.id, row]));
  }

  if (variantIds.length > 0) {
    const { data: variantRows, error: variantsError } = await ctx.adminClient
      .from('product_variants')
      .select('id, color, size')
      .in('id', variantIds);

    if (variantsError) {
      throw new Error(variantsError.message || 'Failed to load variants');
    }

    variantsById = new Map((variantRows || []).map((row) => [row.id, row]));
  }

  const items = (allOrderItems || [])
    .map((item) => ({
      ...item,
      product: productsById.get(item.product_id) || null,
      variant: variantsById.get(item.variant_id) || null,
    }))
    .filter((item) => item.product?.store_id === ctx.membership.store_id);

  let fulfillmentUpdates = [];
  let cancellationRequest = null;
  let returnRequest = null;
  const updatesResult = await ctx.adminClient
    .from('order_fulfillment_updates')
    .select('id, created_at, status, tracking_reference, note, created_by')
    .eq('order_id', orderId)
    .eq('store_id', ctx.membership.store_id)
    .order('created_at', { ascending: false });

  if (updatesResult.error && !isMissingUpdatesTableError(updatesResult.error)) {
    throw new Error(updatesResult.error.message || 'Failed to load fulfillment updates');
  }

  if (isMissingUpdatesTableError(updatesResult.error)) {
    fulfillmentUpdates = [];
  } else {
    fulfillmentUpdates = updatesResult.data || [];
  }

  const cancellationResult = await ctx.adminClient
    .from('order_cancellation_requests')
    .select('id, status, reason, resolution_note, created_at, updated_at, reviewed_at')
    .eq('order_id', orderId)
    .maybeSingle();

  if (!isMissingCancellationTableError(cancellationResult.error) && cancellationResult.error && cancellationResult.error.code !== 'PGRST116') {
    throw new Error(cancellationResult.error.message || 'Failed to load cancellation request');
  }

  cancellationRequest = cancellationResult.data || null;

  const returnResult = await ctx.adminClient
    .from('order_return_requests')
    .select('id, status, refund_status, reason, requested_resolution, details, seller_note, buyer_note, admin_note, refund_amount, refund_reference, approved_at, received_at, refund_requested_at, refunded_at, reviewed_at, created_at, updated_at')
    .eq('order_id', orderId)
    .maybeSingle();

  if (!isMissingReturnsTableError(returnResult.error) && returnResult.error && returnResult.error.code !== 'PGRST116') {
    throw new Error(returnResult.error.message || 'Failed to load return request');
  }

  returnRequest = returnResult.data || null;

  return {
    order,
    items,
    shippingAddress: shippingAddress || null,
    customer: customer || null,
    fulfillmentUpdates,
    cancellationRequest,
    returnRequest,
  };
}

export async function GET(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_orders_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  try {
    const { id } = await params;
    const detail = await loadStoreOrderDetail(ctx, id);

    if (!detail.order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to load order detail' }, { status: 500 });
  }
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

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const detail = await loadStoreOrderDetail(ctx, id);

    if (!detail.order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const nextStatus = String(body?.fulfillment_status || '').trim().toLowerCase();
    const trackingReference = normalizeText(body?.tracking_reference);
    const note = normalizeText(body?.note);

    if (!nextStatus) {
      return NextResponse.json({ error: 'fulfillment_status is required' }, { status: 400 });
    }

    if (!canUpdateStatus(detail.order.fulfillment_status, nextStatus)) {
      return NextResponse.json({
        error: `Cannot move fulfillment status from ${detail.order.fulfillment_status || 'processing'} to ${nextStatus}`,
      }, { status: 409 });
    }

    if (nextStatus === 'shipped' && !trackingReference) {
      return NextResponse.json({ error: 'Tracking reference is required before marking an order as shipped' }, { status: 400 });
    }

    if (nextStatus === 'issue' && !note) {
      return NextResponse.json({ error: 'Add an internal note before marking an order as issue' }, { status: 400 });
    }

    const insertResult = await ctx.adminClient
      .from('order_fulfillment_updates')
      .insert({
        order_id: detail.order.id,
        store_id: ctx.membership.store_id,
        status: nextStatus,
        tracking_reference: trackingReference,
        note,
        created_by: ctx.user.id,
      })
      .select('id, created_at, status, tracking_reference, note, created_by')
      .single();

    if (isMissingUpdatesTableError(insertResult.error)) {
      return NextResponse.json({ error: MISSING_UPDATES_TABLE_HINT }, { status: 500 });
    }

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message || 'Failed to record fulfillment update' }, { status: 400 });
    }

    const { error: orderUpdateError } = await ctx.adminClient
      .from('orders')
      .update({
        fulfillment_status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', detail.order.id);

    if (orderUpdateError) {
      await ctx.adminClient
        .from('order_fulfillment_updates')
        .delete()
        .eq('id', insertResult.data.id);
      return NextResponse.json({ error: orderUpdateError.message || 'Failed to update order' }, { status: 400 });
    }

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'store-orders-service',
      action: 'STORE_ORDER_FULFILLMENT_UPDATED',
      status: 'success',
      statusCode: 200,
      userId: ctx.user.id,
      message: 'Store order fulfillment updated',
      metadata: {
        storeId: ctx.membership.store_id,
        orderId: detail.order.id,
        previousStatus: detail.order.fulfillment_status || 'processing',
        nextStatus,
        trackingReference,
      },
    });

    if (detail.order.user_id) {
      await createUserNotification(ctx.adminClient, {
        userId: detail.order.user_id,
        storeId: ctx.membership.store_id,
        type: 'order_fulfillment_updated',
        title: `Order ${detail.order.id.slice(0, 8)} moved to ${nextStatus}`,
        body: trackingReference
          ? `Tracking reference: ${trackingReference}`
          : `Your order is now ${nextStatus.replace(/_/g, ' ')}.`,
        actionUrl: `/profile/orders/${detail.order.id}`,
        entityType: 'order',
        entityId: detail.order.id,
        metadata: {
          status: nextStatus,
          trackingReference,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: detail.order.id,
        fulfillment_status: nextStatus,
        update: insertResult.data,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update order detail' }, { status: 500 });
  }
}
