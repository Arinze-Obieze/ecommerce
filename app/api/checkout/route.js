import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/utils/rateLimit';
import { writeActivityLog, writeAnalyticsEvent } from '@/utils/serverTelemetry';
import { calculateBulkPricing } from '@/utils/bulkPricing';

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

function toPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateShipping(subtotal) {
  return subtotal > 50000 ? 0 : 2500;
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
    const { items } = await request.json();

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
        service: 'checkout-service',
        action: 'CHECKOUT_UNAUTHENTICATED',
        status: 'failure',
        statusCode: 401,
        message: 'Authentication required for checkout',
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'checkout',
      identifier: user.id,
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
        userId: user.id,
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please try again shortly.' },
        { status: 429 }
      );
    }

    const serviceClient = createServiceClient();
    const authoritativeOrder = await buildAuthoritativeOrder(serviceClient, items);

    const { data: orderId, error } = await serviceClient.rpc('checkout_transaction', {
      p_user_id: user.id,
      p_items: authoritativeOrder.items,
      p_total: authoritativeOrder.total,
    });

    if (error) {
      console.error('Checkout Transaction Error:', error);
      await writeActivityLog({
        request,
        level: 'ERROR',
        service: 'checkout-service',
        action: 'CHECKOUT_TRANSACTION_FAILED',
        status: 'failure',
        statusCode: error.message?.includes('Insufficient stock') ? 409 : 400,
        message: error.message,
        userId: user.id,
        errorCode: error.code || null,
        durationMs: Date.now() - startedAt,
      });
      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await writeAnalyticsEvent({
      eventName: 'begin_checkout',
      userId: user.id,
      path: '/cart',
      properties: {
        order_id: orderId,
        items_count: authoritativeOrder.items.length,
        subtotal: authoritativeOrder.subtotal,
        shipping: authoritativeOrder.shipping,
        total: authoritativeOrder.total,
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
      userId: user.id,
      metadata: {
        orderId,
        itemsCount: authoritativeOrder.items.length,
        total: authoritativeOrder.total,
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
