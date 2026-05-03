import { NextResponse } from 'next/server';
import { createAdminClient, createClient as createServerClient } from '@/utils/supabase/server';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { writeActivityLog, writeAnalyticsEvent } from '@/utils/telemetry/server';
import { calculateBulkPricing } from '@/utils/catalog/bulk-pricing';
import { calculateShippingFee } from '@/constants/shipping';

function toPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateShipping(subtotal) {
  return calculateShippingFee(subtotal);
}

function sanitizeText(value, maxLength = 255) {
  const normalized = String(value || '').trim();
  return normalized ? normalized.slice(0, maxLength) : '';
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 255);
}

function normalizeDeliveryAddress(value) {
  const address = value && typeof value === 'object' ? value : {};

  return {
    id: sanitizeText(address.id, 64) || null,
    type: sanitizeText(address.type, 40) || 'Address',
    address: sanitizeText(address.address, 200),
    addressLine2: sanitizeText(address.addressLine2, 200),
    city: sanitizeText(address.city, 100),
    state: sanitizeText(address.state, 100),
    postalCode: sanitizeText(address.postalCode, 20),
    country: sanitizeText(address.country, 100) || 'Nigeria',
    phone: sanitizeText(address.phone, 32),
    isDefault: Boolean(address.isDefault),
  };
}

function validateDeliveryAddress(address) {
  if (!address.address || !address.city || !address.state || !address.phone) {
    throw new Error('A valid delivery address is required before payment.');
  }
}

async function saveOrderShippingAddress(serviceClient, orderId, userId, address, contactEmail) {
  const payload = {
    order_id: orderId,
    user_id: userId || null,
    contact_email: normalizeEmail(contactEmail),
    source_address_id: address.id || null,
    label: address.type || 'Address',
    address_line1: address.address,
    address_line2: address.addressLine2 || null,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode || null,
    country: address.country || 'Nigeria',
    phone: address.phone,
  };

  const { error } = await serviceClient
    .from('order_shipping_addresses')
    .upsert(payload, { onConflict: 'order_id' });

  if (error) {
    throw new Error(`Could not save order delivery address: ${error.message}`);
  }
}

async function buildAuthoritativeOrder(serviceClient, rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Cart is empty');
  }

  const normalizedItems = rawItems.map((item) => ({
    product_id: toPositiveInt(item?.product_id),
    variant_id: item?.variant_id ?? null,
    quantity: toPositiveInt(item?.quantity),
  }));

  if (normalizedItems.some((item) => !item.product_id || !item.quantity)) {
    throw new Error('Invalid cart item payload');
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.product_id))];
  const variantIds = [...new Set(
    normalizedItems.map((item) => item.variant_id).filter((id) => id !== null)
  )];

  const { data: products, error: productsError } = await serviceClient
    .from('products')
    .select('id, price, discount_price, bulk_discount_tiers, is_active')
    .in('id', productIds);

  if (productsError) {
    throw new Error(`Could not validate products: ${productsError.message}`);
  }

  const productMap = new Map((products || []).map((product) => [product.id, product]));

  let variantMap = new Map();
  if (variantIds.length > 0) {
    const { data: variants, error: variantsError } = await serviceClient
      .from('product_variants')
      .select('id, product_id')
      .in('id', variantIds);

    if (variantsError) {
      throw new Error(`Could not validate product variants: ${variantsError.message}`);
    }

    variantMap = new Map((variants || []).map((variant) => [variant.id, variant]));
  }

  let computedSubtotal = 0;
  const items = normalizedItems.map((item) => {
    const product = productMap.get(item.product_id);
    if (!product || !product.is_active) {
      throw new Error(`Product is unavailable: ${item.product_id}`);
    }

    if (item.variant_id !== null) {
      const variant = variantMap.get(item.variant_id);
      if (!variant) {
        throw new Error(`Variant not found: ${item.variant_id}`);
      }
      if (variant.product_id !== item.product_id) {
        throw new Error(`Variant ${item.variant_id} does not belong to product ${item.product_id}`);
      }
    }

    const unitPrice = toNumber(calculateBulkPricing(product, item.quantity).finalUnitPrice);
    if (unitPrice === null || unitPrice < 0) {
      throw new Error(`Invalid product price for product ${item.product_id}`);
    }

    computedSubtotal += unitPrice * item.quantity;

    return {
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: unitPrice,
    };
  });

  return {
    items,
    subtotal: computedSubtotal,
    shipping: calculateShipping(computedSubtotal),
    total: computedSubtotal + calculateShipping(computedSubtotal),
  };
}

export async function POST(request) {
  const startedAt = Date.now();
  let currentUser = null;
  try {
    const { items, customerEmail, deliveryAddress, addressMode, saveAddress } = await request.json();

    const authClient = await createServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    currentUser = user;
    const resolvedEmail = normalizeEmail(user?.email || customerEmail);
    if (!resolvedEmail || !resolvedEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid checkout email is required' }, { status: 400 });
    }

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'checkout',
      identifier: user?.id || resolvedEmail || request.headers.get('x-forwarded-for') || 'guest',
      limit: 20,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      await writeActivityLog({
        request,
        level: 'WARN',
        service: 'checkout-service',
        action: 'CHECKOUT_RATE_LIMITED',
        status: 'failure',
        statusCode: 429,
        message: 'Checkout rate limit exceeded',
        userId: user?.id || null,
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json(rateLimitPayload('Too many checkout attempts. Please try again shortly.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
    }

    const adminClient = await createAdminClient();
    const authoritativeOrder = await buildAuthoritativeOrder(adminClient, items);
    const normalizedDeliveryAddress = normalizeDeliveryAddress(deliveryAddress);
    validateDeliveryAddress(normalizedDeliveryAddress);

    const { data: orderId, error } = await adminClient.rpc('checkout_transaction', {
      p_user_id: user?.id || null,
      p_items: authoritativeOrder.items,
      p_total: authoritativeOrder.total,
    });

    if (error) {
      console.error('Checkout Transaction Error:', error);
      // F011: map known DB errors to safe user-facing messages; never return raw postgres text.
      const KNOWN_ERRORS = {
        'Insufficient stock': 'One or more items in your cart are out of stock.',
        'Cart is empty': 'Your cart is empty.',
      };
      const userMsg = Object.entries(KNOWN_ERRORS)
        .find(([key]) => error.message?.includes(key))?.[1]
        ?? 'Checkout failed. Please try again.';
      const statusCode = error.message?.includes('Insufficient stock') ? 409 : 400;
      await writeActivityLog({
        request,
        level: 'ERROR',
        service: 'checkout-service',
        action: 'CHECKOUT_TRANSACTION_FAILED',
        status: 'failure',
        statusCode,
        message: error.message,
        userId: user?.id || null,
        errorCode: error.code || null,
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json({ error: userMsg }, { status: statusCode });
    }

    await saveOrderShippingAddress(adminClient, orderId, user?.id || null, normalizedDeliveryAddress, resolvedEmail);

    await writeAnalyticsEvent({
      eventName: 'begin_checkout',
      userId: user?.id || null,
      path: '/cart',
      properties: {
        order_id: orderId,
        items_count: authoritativeOrder.items.length,
        subtotal: authoritativeOrder.subtotal,
        shipping: authoritativeOrder.shipping,
        total: authoritativeOrder.total,
        checkout_type: user ? 'authenticated' : 'guest',
        checkout_email: resolvedEmail,
        address_mode: sanitizeText(addressMode, 24) || 'saved',
        used_saved_address: Boolean(normalizedDeliveryAddress.id),
        saved_address_for_future: Boolean(saveAddress),
      },
    });

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'checkout-service',
      action: 'CHECKOUT_INITIATED',
      status: 'success',
      statusCode: 200,
      message: 'Checkout reservation created',
      userId: user?.id || null,
      metadata: {
        orderId,
        itemsCount: authoritativeOrder.items.length,
        total: authoritativeOrder.total,
        checkoutType: user ? 'authenticated' : 'guest',
        addressMode: sanitizeText(addressMode, 24) || 'saved',
        saveAddress: Boolean(saveAddress),
        // F004: delivery address (phone, street) must not appear in logs.
        // user_id above is sufficient for traceability; join to users/order_shipping_addresses for details.
      },
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      success: true,
      orderId,
      subtotal: authoritativeOrder.subtotal,
      shipping: authoritativeOrder.shipping,
      total: authoritativeOrder.total,
      message: 'Stock reserved. Proceed to payment.',
    });
  } catch (err) {
    console.error('Server Error:', err);
    await writeActivityLog({
      request,
      level: 'ERROR',
      service: 'checkout-service',
      action: 'CHECKOUT_INTERNAL_ERROR',
      status: 'failure',
      statusCode: 500,
      message: err.message || 'Internal Server Error',
      userId: currentUser?.id || null,
      errorCode: err.code || null,
      errorStack: err.stack || null,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
