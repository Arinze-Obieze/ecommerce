import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';

const PRODUCT_SELECT = 'id, store_id, name, slug, sku, stock_quantity, is_active, moderation_status, updated_at';
const VARIANT_SELECT = 'id, product_id, color, size, stock_quantity, created_at';
const HISTORY_LIMIT = 30;
const LOW_STOCK_THRESHOLD = 5;

function toInteger(value) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : null;
}

function clampStock(value) {
  return Math.max(0, toInteger(value) || 0);
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeReason(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (['correction', 'restock', 'damage', 'return', 'count'].includes(normalized)) {
    return normalized;
  }
  return 'correction';
}

function normalizeMode(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (['set', 'add', 'subtract'].includes(normalized)) {
    return normalized;
  }
  return '';
}

function computeNextStock(currentStock, mode, quantity) {
  if (mode === 'set') return clampStock(quantity);
  if (mode === 'add') return clampStock(currentStock + quantity);
  if (mode === 'subtract') return clampStock(currentStock - quantity);
  return currentStock;
}

function buildVariantLabel(variant) {
  const color = normalizeText(variant?.color);
  const size = normalizeText(variant?.size);
  if (color && size) return `${color} / ${size}`;
  return color || size || 'Unnamed variant';
}

function serializeInventory(products, variants, history) {
  const variantsByProduct = new Map();

  for (const variant of variants) {
    const list = variantsByProduct.get(variant.product_id) || [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  const rows = (products || []).map((product) => {
    const productVariants = (variantsByProduct.get(product.id) || [])
      .slice()
      .sort((left, right) => buildVariantLabel(left).localeCompare(buildVariantLabel(right)));
    const variantStock = productVariants.reduce((sum, variant) => sum + clampStock(variant.stock_quantity), 0);
    const effectiveStock = productVariants.length > 0 ? variantStock : clampStock(product.stock_quantity);

    return {
      ...product,
      stock_quantity: clampStock(product.stock_quantity),
      effective_stock_quantity: effectiveStock,
      has_variants: productVariants.length > 0,
      variant_count: productVariants.length,
      variants: productVariants.map((variant) => ({
        ...variant,
        stock_quantity: clampStock(variant.stock_quantity),
        label: buildVariantLabel(variant),
      })),
      low_stock: effectiveStock <= LOW_STOCK_THRESHOLD,
      out_of_stock: effectiveStock <= 0,
    };
  });

  return {
    rows,
    history: history || [],
    summary: {
      total: rows.length,
      lowStock: rows.filter((row) => row.low_stock && !row.out_of_stock).length,
      outOfStock: rows.filter((row) => row.out_of_stock).length,
      variantManaged: rows.filter((row) => row.has_variants).length,
    },
  };
}

async function loadInventoryData(ctx) {
  const { data: products, error: productsError } = await ctx.adminClient
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', ctx.membership.store_id)
    .order('created_at', { ascending: false })
    .limit(500);

  if (productsError) {
    throw new Error(productsError.message || 'Failed to load products');
  }

  const productIds = (products || []).map((product) => product.id);
  let variants = [];

  if (productIds.length > 0) {
    const { data: variantRows, error: variantsError } = await ctx.adminClient
      .from('product_variants')
      .select(VARIANT_SELECT)
      .in('product_id', productIds);

    if (variantsError) {
      throw new Error(variantsError.message || 'Failed to load variants');
    }

    variants = variantRows || [];
  }

  let history = [];
  const historyResult = await ctx.adminClient
    .from('activity_logs')
    .select('id, created_at, action, message, user_id, metadata')
    .eq('action', 'INVENTORY_ADJUSTMENT')
    .order('created_at', { ascending: false })
    .limit(200);

  if (!historyResult.error) {
    history = (historyResult.data || [])
      .filter((entry) => Number(entry?.metadata?.store_id) === Number(ctx.membership.store_id))
      .slice(0, HISTORY_LIMIT)
      .map((entry) => ({
        id: entry.id,
        created_at: entry.created_at,
        user_id: entry.user_id,
        message: entry.message,
        ...entry.metadata,
      }));
  }

  return serializeInventory(products || [], variants, history);
}

async function logInventoryAdjustment(ctx, request, payload) {
  await ctx.adminClient
    .from('activity_logs')
    .insert({
      user_id: ctx.user.id,
      level: 'INFO',
      service: 'inventory-service',
      action: 'INVENTORY_ADJUSTMENT',
      status: 'success',
      status_code: 200,
      message: payload.message,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      user_agent: request.headers.get('user-agent') || null,
      metadata: {
        ...payload,
        store_id: ctx.membership.store_id,
        actor_role: ctx.membership.role,
        actor_email: ctx.user.email || null,
      },
      environment: process.env.NODE_ENV || 'development',
    });
}

async function adjustProductStock(ctx, request, body) {
  const productId = toInteger(body?.productId);
  const mode = normalizeMode(body?.mode);
  const quantity = toInteger(body?.quantity);

  if (!productId) {
    return NextResponse.json({ error: 'Select a product to adjust.' }, { status: 400 });
  }
  if (!mode) {
    return NextResponse.json({ error: 'Choose how to apply the adjustment.' }, { status: 400 });
  }
  if (quantity === null || quantity < 0) {
    return NextResponse.json({ error: 'Enter a valid stock quantity.' }, { status: 400 });
  }

  const { data: product, error } = await ctx.adminClient
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to load product.' }, { status: 400 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const { count: variantCount, error: variantCountError } = await ctx.adminClient
    .from('product_variants')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', product.id);

  if (variantCountError) {
    return NextResponse.json({ error: variantCountError.message || 'Failed to inspect variants.' }, { status: 400 });
  }

  if ((variantCount || 0) > 0) {
    return NextResponse.json({
      error: 'This product is managed by variants. Adjust its variant stock levels instead.',
    }, { status: 400 });
  }

  const previousQuantity = clampStock(product.stock_quantity);
  const nextQuantity = computeNextStock(previousQuantity, mode, quantity);

  const { error: updateError } = await ctx.adminClient
    .from('products')
    .update({ stock_quantity: nextQuantity })
    .eq('id', product.id)
    .eq('store_id', ctx.membership.store_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message || 'Failed to update stock.' }, { status: 400 });
  }

  await logInventoryAdjustment(ctx, request, {
    target_type: 'product',
    target_id: product.id,
    product_id: product.id,
    product_name: product.name,
    sku: product.sku || null,
    mode,
    reason: normalizeReason(body?.reason),
    note: normalizeText(body?.note),
    quantity,
    previous_quantity: previousQuantity,
    next_quantity: nextQuantity,
    delta: nextQuantity - previousQuantity,
    message: `${product.name} stock ${mode === 'set' ? 'set' : mode === 'add' ? 'increased' : 'decreased'} to ${nextQuantity}`,
  });

  const inventory = await loadInventoryData(ctx);
  return NextResponse.json({ success: true, ...inventory });
}

async function adjustVariantStock(ctx, request, body) {
  const variantId = normalizeText(body?.variantId);
  const mode = normalizeMode(body?.mode);
  const quantity = toInteger(body?.quantity);

  if (!variantId) {
    return NextResponse.json({ error: 'Select a variant to adjust.' }, { status: 400 });
  }
  if (!mode) {
    return NextResponse.json({ error: 'Choose how to apply the adjustment.' }, { status: 400 });
  }
  if (quantity === null || quantity < 0) {
    return NextResponse.json({ error: 'Enter a valid stock quantity.' }, { status: 400 });
  }

  const { data: variant, error: variantError } = await ctx.adminClient
    .from('product_variants')
    .select('id, product_id, color, size, stock_quantity')
    .eq('id', variantId)
    .maybeSingle();

  if (variantError) {
    return NextResponse.json({ error: variantError.message || 'Failed to load variant.' }, { status: 400 });
  }

  if (!variant) {
    return NextResponse.json({ error: 'Variant not found.' }, { status: 404 });
  }

  const { data: product, error: productError } = await ctx.adminClient
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', variant.product_id)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: productError.message || 'Failed to load product.' }, { status: 400 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Variant does not belong to this store.' }, { status: 404 });
  }

  const previousQuantity = clampStock(variant.stock_quantity);
  const nextQuantity = computeNextStock(previousQuantity, mode, quantity);

  const { error: updateVariantError } = await ctx.adminClient
    .from('product_variants')
    .update({ stock_quantity: nextQuantity })
    .eq('id', variant.id);

  if (updateVariantError) {
    return NextResponse.json({ error: updateVariantError.message || 'Failed to update variant stock.' }, { status: 400 });
  }

  const { data: siblingVariants, error: siblingError } = await ctx.adminClient
    .from('product_variants')
    .select('stock_quantity')
    .eq('product_id', product.id);

  if (siblingError) {
    return NextResponse.json({ error: siblingError.message || 'Failed to sync product stock.' }, { status: 400 });
  }

  const totalStock = (siblingVariants || []).reduce((sum, sibling) => sum + clampStock(sibling.stock_quantity), 0);
  const { error: updateProductError } = await ctx.adminClient
    .from('products')
    .update({ stock_quantity: totalStock })
    .eq('id', product.id)
    .eq('store_id', ctx.membership.store_id);

  if (updateProductError) {
    return NextResponse.json({ error: updateProductError.message || 'Failed to sync product stock.' }, { status: 400 });
  }

  const variantLabel = buildVariantLabel(variant);
  await logInventoryAdjustment(ctx, request, {
    target_type: 'variant',
    target_id: variant.id,
    product_id: product.id,
    product_name: product.name,
    variant_id: variant.id,
    variant_label: variantLabel,
    sku: product.sku || null,
    mode,
    reason: normalizeReason(body?.reason),
    note: normalizeText(body?.note),
    quantity,
    previous_quantity: previousQuantity,
    next_quantity: nextQuantity,
    delta: nextQuantity - previousQuantity,
    message: `${product.name} (${variantLabel}) stock ${mode === 'set' ? 'set' : mode === 'add' ? 'increased' : 'decreased'} to ${nextQuantity}`,
  });

  const inventory = await loadInventoryData(ctx);
  return NextResponse.json({ success: true, ...inventory });
}

async function restockLowStock(ctx, request, body) {
  const targetQuantity = toInteger(body?.targetQuantity);
  const scope = normalizeText(body?.scope).toLowerCase() === 'all' ? 'all' : 'low_stock_only';

  if (targetQuantity === null || targetQuantity < 0) {
    return NextResponse.json({ error: 'Enter a valid restock target.' }, { status: 400 });
  }

  const inventory = await loadInventoryData(ctx);
  const targetRows = inventory.rows.filter((row) => {
    if (!row.has_variants) {
      return scope === 'all' ? row.effective_stock_quantity < targetQuantity : row.low_stock;
    }
    return false;
  });

  if (targetRows.length === 0) {
    return NextResponse.json({ error: 'No direct-stock products matched the restock filter.' }, { status: 400 });
  }

  for (const row of targetRows) {
    const { error } = await ctx.adminClient
      .from('products')
      .update({ stock_quantity: targetQuantity })
      .eq('id', row.id)
      .eq('store_id', ctx.membership.store_id);

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to apply restock.' }, { status: 400 });
    }
  }

  await Promise.all(targetRows.map((row) => logInventoryAdjustment(ctx, request, {
    target_type: 'product',
    target_id: row.id,
    product_id: row.id,
    product_name: row.name,
    sku: row.sku || null,
    mode: 'set',
    reason: 'restock',
    note: normalizeText(body?.note),
    quantity: targetQuantity,
    previous_quantity: row.effective_stock_quantity,
    next_quantity: targetQuantity,
    delta: targetQuantity - row.effective_stock_quantity,
    message: `${row.name} restocked to ${targetQuantity}`,
  })));

  const refreshed = await loadInventoryData(ctx);
  return NextResponse.json({ success: true, ...refreshed });
}

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_inventory_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const inventory = await loadInventoryData(ctx);
    return NextResponse.json({ success: true, ...inventory });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to load inventory.' }, { status: 500 });
  }
}

export async function POST(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_inventory_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const action = normalizeText(body?.action).toLowerCase();

  if (!action) {
    return NextResponse.json({ error: 'Inventory action is required.' }, { status: 400 });
  }

  try {
    if (action === 'adjust_product') {
      return await adjustProductStock(ctx, request, body);
    }

    if (action === 'adjust_variant') {
      return await adjustVariantStock(ctx, request, body);
    }

    if (action === 'restock_low_stock') {
      return await restockLowStock(ctx, request, body);
    }

    return NextResponse.json({ error: 'Unsupported inventory action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Inventory update failed.' }, { status: 500 });
  }
}
