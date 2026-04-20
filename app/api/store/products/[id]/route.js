import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { generateProductSku, normalizeSpecifications } from '@/utils/catalog/product-catalog';
import { normalizeBulkDiscountTiers } from '@/utils/catalog/bulk-pricing';

const PRODUCT_DETAIL_SELECT = 'id, store_id, moderation_status, is_active, name, slug, sku, description, price, discount_price, stock_quantity, image_urls, video_urls, specifications, bulk_discount_tiers, submitted_at, reviewed_at, rejection_reason, published_at, created_at, updated_at';
const PRODUCT_DETAIL_SELECT_FALLBACK = 'id, store_id, moderation_status, is_active, name, slug, sku, description, price, discount_price, stock_quantity, image_urls, video_urls, specifications, submitted_at, reviewed_at, rejection_reason, published_at, created_at, updated_at';
const PRODUCT_VARIANT_SELECT = 'id, product_id, color, size, stock_quantity, created_at';
const BULK_DISCOUNT_MIGRATION_HINT = 'Database is missing products.bulk_discount_tiers. Apply documentation/migrations/2026-03-28_product_bulk_discounts.sql and retry.';

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function isMissingBulkDiscountColumnError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42703' ||
    (message.includes('bulk_discount_tiers') && message.includes('does not exist'));
}

function sanitizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  try {
    return new URL(url).toString();
  } catch {
    return '';
  }
}

function normalizeMediaArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const type = String(item.type || '').trim().toLowerCase();
      if (type !== 'image' && type !== 'video') return null;

      const publicUrl = normalizeUrl(item.public_url || item.url);
      if (!publicUrl) return null;

      return {
        type,
        public_url: publicUrl,
      };
    })
    .filter(Boolean);
}

function canDeleteProduct(product) {
  return ['draft', 'rejected', 'archived'].includes(String(product?.moderation_status || '').trim().toLowerCase());
}

async function loadProduct(ctx, id) {
  let { data: product, error: productError } = await ctx.adminClient
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .eq('id', id)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

  if (productError && isMissingBulkDiscountColumnError(productError)) {
    const fallbackResult = await ctx.adminClient
      .from('products')
      .select(PRODUCT_DETAIL_SELECT_FALLBACK)
      .eq('id', id)
      .eq('store_id', ctx.membership.store_id)
      .maybeSingle();

    product = fallbackResult.data
      ? { ...fallbackResult.data, bulk_discount_tiers: null }
      : fallbackResult.data;
    productError = fallbackResult.error;
  }

  return { product, productError };
}

async function buildDuplicateSlug(adminClient, storeId, sourceSlug) {
  const baseSlug = sanitizeSlug(sourceSlug) || 'product-copy';
  const copyBase = `${baseSlug}-copy`;

  const { data, error } = await adminClient
    .from('products')
    .select('slug')
    .eq('store_id', storeId)
    .ilike('slug', `${copyBase}%`);

  if (error) {
    throw new Error(error.message || 'Failed to prepare duplicate product slug');
  }

  const usedSlugs = new Set((data || []).map((row) => String(row.slug || '').trim().toLowerCase()));
  if (!usedSlugs.has(copyBase)) return copyBase;

  let suffix = 2;
  while (usedSlugs.has(`${copyBase}-${suffix}`)) {
    suffix += 1;
  }
  return `${copyBase}-${suffix}`;
}

export async function GET(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_products_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { id } = await params;
  const { product, productError } = await loadProduct(ctx, id);

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const { data: variants, error: variantsError } = await ctx.adminClient
    .from('product_variants')
    .select(PRODUCT_VARIANT_SELECT)
    .eq('product_id', product.id)
    .order('created_at', { ascending: true });

  if (variantsError) {
    return NextResponse.json({ error: variantsError.message || 'Failed to load variants' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { ...product, variants: variants || [] } });
}

export async function PATCH(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_products_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const { product, productError } = await loadProduct(ctx, id);

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const updates = {};

  if (body?.name !== undefined) updates.name = String(body.name || '').trim();
  if (body?.slug !== undefined) {
    const slug = sanitizeSlug(body.slug);
    if (!slug) {
      return NextResponse.json({ error: 'Valid slug is required' }, { status: 400 });
    }
    updates.slug = slug;
  }
  if (body?.description !== undefined) updates.description = String(body.description || '').trim();
  if (body?.price !== undefined) {
    const price = toNumber(body.price);
    if (price === null || price <= 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }
    updates.price = price;
  }
  if (body?.discount_price !== undefined) {
    if (body.discount_price === null || body.discount_price === '') {
      updates.discount_price = null;
    } else {
      const discountPrice = toNumber(body.discount_price);
      if (discountPrice === null || discountPrice < 0) {
        return NextResponse.json({ error: 'Invalid discount price' }, { status: 400 });
      }
      updates.discount_price = discountPrice;
    }
  }
  if (body?.stock_quantity !== undefined) {
    updates.stock_quantity = Math.max(0, Number.parseInt(body.stock_quantity, 10) || 0);
  }
  if (body?.image_urls !== undefined) {
    const imageUrls = Array.isArray(body.image_urls) ? body.image_urls.map(normalizeUrl).filter(Boolean) : [];
    updates.image_urls = imageUrls;
  }
  if (body?.video_urls !== undefined) {
    const videoUrls = Array.isArray(body.video_urls) ? body.video_urls.map(normalizeUrl).filter(Boolean) : [];
    updates.video_urls = videoUrls;
  }
  if (body?.media !== undefined) {
    const media = normalizeMediaArray(body.media);
    updates.image_urls = media.filter((m) => m.type === 'image').map((m) => m.public_url);
    updates.video_urls = media.filter((m) => m.type === 'video').map((m) => m.public_url);
  }
  if (body?.specifications !== undefined) {
    const specificationResult = normalizeSpecifications(body.specifications);
    if (specificationResult.error) {
      return NextResponse.json({ error: specificationResult.error }, { status: 400 });
    }
    updates.specifications = specificationResult.value;
  }
  if (body?.bulk_discount_tiers !== undefined) {
    const bulkDiscountResult = normalizeBulkDiscountTiers(body.bulk_discount_tiers);
    if (bulkDiscountResult.error) {
      return NextResponse.json({ error: bulkDiscountResult.error }, { status: 400 });
    }
    updates.bulk_discount_tiers = bulkDiscountResult.value;
  }

  if (Object.keys(updates).length === 0 && !body?.submit_for_review && body?.archive === undefined) {
    return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
  }

  const nowIso = new Date().toISOString();

  if (body?.archive !== undefined) {
    if (ctx.membership.role === STORE_ROLES.STAFF) {
      return NextResponse.json({ error: 'Staff cannot archive products' }, { status: 403 });
    }

    if (body.archive) {
      updates.moderation_status = 'archived';
      updates.is_active = false;
    } else if (product.moderation_status === 'archived') {
      updates.moderation_status = 'draft';
      updates.is_active = false;
      updates.reviewed_at = null;
      updates.reviewed_by = null;
      updates.rejection_reason = null;
      updates.published_at = null;
    }
  }

  if (body?.submit_for_review) {
    updates.moderation_status = 'pending_review';
    updates.submitted_at = nowIso;
    updates.reviewed_at = null;
    updates.reviewed_by = null;
    updates.rejection_reason = null;
    updates.published_at = null;
    updates.is_active = false;
  } else if (Object.keys(updates).length > 0 && product.moderation_status === 'approved') {
    // Approved product changed by store should require fresh review.
    updates.moderation_status = 'pending_review';
    updates.submitted_at = nowIso;
    updates.reviewed_at = null;
    updates.reviewed_by = null;
    updates.rejection_reason = null;
    updates.published_at = null;
    updates.is_active = false;
  }

  const primaryImageUrl = normalizeUrl(body?.primary_image_url);
  if (primaryImageUrl) {
    const candidateImages = Array.isArray(updates.image_urls) ? updates.image_urls : (product.image_urls || []);
    if (!candidateImages.includes(primaryImageUrl)) {
      return NextResponse.json({ error: 'Primary image must be selected from uploaded images' }, { status: 400 });
    }
    updates.image_urls = [primaryImageUrl, ...candidateImages.filter((url) => url !== primaryImageUrl)];
  }

  if (updates.image_urls && updates.image_urls.length < 1) {
    return NextResponse.json({ error: 'At least one product image is required' }, { status: 400 });
  }

  const { data, error } = await ctx.adminClient
    .from('products')
    .update(updates)
    .eq('id', product.id)
    .eq('store_id', ctx.membership.store_id)
    .select('id, store_id, name, slug, sku, moderation_status, is_active, submitted_at, reviewed_at, rejection_reason, updated_at')
    .single();

  if (error) {
    if (isMissingBulkDiscountColumnError(error)) {
      return NextResponse.json({ error: BULK_DISCOUNT_MIGRATION_HINT }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_products_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || '').trim().toLowerCase();

  if (action !== 'duplicate') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const { product, productError } = await loadProduct(ctx, id);

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const { data: store, error: storeError } = await ctx.adminClient
    .from('stores')
    .select('id, slug, name')
    .eq('id', ctx.membership.store_id)
    .maybeSingle();

  if (storeError) {
    return NextResponse.json({ error: storeError.message }, { status: 500 });
  }

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  try {
    const duplicateSlug = await buildDuplicateSlug(ctx.adminClient, ctx.membership.store_id, product.slug);
    const duplicateName = `${String(product.name || '').trim() || 'Untitled product'} Copy`;
    const duplicateSku = await generateProductSku(ctx.adminClient, {
      storeId: ctx.membership.store_id,
      storeSlug: store.slug,
      storeName: store.name,
      productSlug: duplicateSlug,
      productName: duplicateName,
    });

    const insertPayload = {
      store_id: ctx.membership.store_id,
      name: duplicateName,
      slug: duplicateSlug,
      sku: duplicateSku,
      description: product.description || '',
      price: product.price,
      discount_price: product.discount_price,
      stock_quantity: product.stock_quantity,
      image_urls: Array.isArray(product.image_urls) ? product.image_urls : [],
      video_urls: Array.isArray(product.video_urls) ? product.video_urls : [],
      specifications: product.specifications || null,
      bulk_discount_tiers: product.bulk_discount_tiers || null,
      moderation_status: 'draft',
      is_active: false,
      submitted_at: null,
      reviewed_at: null,
      reviewed_by: null,
      rejection_reason: null,
      published_at: null,
    };

    const { data, error } = await ctx.adminClient
      .from('products')
      .insert(insertPayload)
      .select('id, store_id, name, slug, sku, moderation_status, is_active, submitted_at, reviewed_at, rejection_reason, updated_at')
      .single();

    if (error) {
      if (isMissingBulkDiscountColumnError(error)) {
        return NextResponse.json({ error: BULK_DISCOUNT_MIGRATION_HINT }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to duplicate product' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_products_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  if (ctx.membership.role === STORE_ROLES.STAFF) {
    return NextResponse.json({ error: 'Staff cannot delete products' }, { status: 403 });
  }

  const { id } = await params;
  const { product, productError } = await loadProduct(ctx, id);

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (!canDeleteProduct(product)) {
    return NextResponse.json({
      error: 'Only draft, rejected, or archived products can be deleted. Archive approved or pending items instead.',
    }, { status: 400 });
  }

  const { error } = await ctx.adminClient
    .from('products')
    .delete()
    .eq('id', product.id)
    .eq('store_id', ctx.membership.store_id);

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { id: product.id } });
}
