import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { generateProductSku, normalizeSpecifications } from '@/utils/catalog/product-catalog';
import { normalizeBulkDiscountTiers } from '@/utils/catalog/bulk-pricing';
import { parseWholeNairaAmount } from '@/utils/money/naira';
import { getPagination, paginationMeta } from '@/utils/platform/pagination';
import { privateJson } from '@/utils/platform/api-response';
import { invalidateProductCache, invalidateProductsCache } from '@/utils/platform/cache-invalidation';

const PRODUCT_LIST_SELECT = 'id, store_id, name, slug, sku, description, price, discount_price, specifications, bulk_discount_tiers, stock_quantity, image_urls, video_urls, is_active, moderation_status, submitted_at, reviewed_at, rejection_reason, created_at, updated_at';
const PRODUCT_LIST_SELECT_FALLBACK = 'id, store_id, name, slug, sku, description, price, discount_price, specifications, stock_quantity, image_urls, video_urls, is_active, moderation_status, submitted_at, reviewed_at, rejection_reason, created_at, updated_at';
const BULK_DISCOUNT_MIGRATION_HINT = 'Database is missing products.bulk_discount_tiers. Apply documentation/migrations/2026-03-28_product_bulk_discounts.sql and retry.';

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

function normalizeModerationFilter(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  if (['draft', 'pending_review', 'approved', 'rejected', 'archived'].includes(normalized)) {
    return normalized;
  }
  return '';
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
        storage_path: String(item.storage_path || '').trim() || null,
        mime_type: String(item.mime_type || '').trim() || null,
        size_bytes: Number.parseInt(item.size_bytes || '0', 10) || 0,
      };
    })
    .filter(Boolean);
}

function canDeleteProduct(product) {
  return ['draft', 'rejected', 'archived'].includes(String(product?.moderation_status || '').trim().toLowerCase());
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

export async function GET(request) {
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

  const { searchParams } = new URL(request.url);
  const moderationStatus = normalizeModerationFilter(searchParams.get('moderationStatus'));
  const search = String(searchParams.get('search') || '').trim();
  const { page, limit, from, to } = getPagination(searchParams, { defaultLimit: 25, maxLimit: 100 });

  let query = ctx.adminClient
    .from('products')
    .select(PRODUCT_LIST_SELECT, { count: 'exact' })
    .eq('store_id', ctx.membership.store_id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (moderationStatus) {
    query = query.eq('moderation_status', moderationStatus);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  let { data, error, count } = await query;

  if (error && isMissingBulkDiscountColumnError(error)) {
    let fallbackQuery = ctx.adminClient
      .from('products')
      .select(PRODUCT_LIST_SELECT_FALLBACK, { count: 'exact' })
      .eq('store_id', ctx.membership.store_id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (moderationStatus) {
      fallbackQuery = fallbackQuery.eq('moderation_status', moderationStatus);
    }

    if (search) {
      fallbackQuery = fallbackQuery.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const fallbackResult = await fallbackQuery;
    data = (fallbackResult.data || []).map((row) => ({
      ...row,
      bulk_discount_tiers: null,
    }));
    error = fallbackResult.error;
    count = fallbackResult.count;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = data || [];

  const { data: summaryData } = await ctx.adminClient
    .from('products')
    .select('moderation_status')
    .eq('store_id', ctx.membership.store_id);

  const stats = summaryData || [];
  const summary = {
    total: stats.length,
    draft: stats.filter((p) => p.moderation_status === 'draft').length,
    pending_review: stats.filter((p) => p.moderation_status === 'pending_review').length,
    approved: stats.filter((p) => p.moderation_status === 'approved').length,
    rejected: stats.filter((p) => p.moderation_status === 'rejected').length,
    archived: stats.filter((p) => p.moderation_status === 'archived').length,
  };

  return privateJson({
    success: true,
    data: products,
    summary,
    meta: paginationMeta({ page, limit, total: count || 0 }),
  });
}

export async function POST(request) {
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

  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || '').trim().toLowerCase();

  if (action) {
    const ids = [...new Set((Array.isArray(body?.ids) ? body.ids : []).map((id) => String(id || '').trim()).filter(Boolean))];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Select at least one product.' }, { status: 400 });
    }
    if (ids.length > 100) {
      return NextResponse.json({ error: 'Bulk actions are limited to 100 products at a time.' }, { status: 400 });
    }

    const { data: products, error: productsError } = await ctx.adminClient
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .eq('store_id', ctx.membership.store_id)
      .in('id', ids);

    if (productsError && !isMissingBulkDiscountColumnError(productsError)) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    let resolvedProducts = products || [];
    if (productsError && isMissingBulkDiscountColumnError(productsError)) {
      const fallbackResult = await ctx.adminClient
        .from('products')
        .select(PRODUCT_LIST_SELECT_FALLBACK)
        .eq('store_id', ctx.membership.store_id)
        .in('id', ids);

      if (fallbackResult.error) {
        return NextResponse.json({ error: fallbackResult.error.message }, { status: 500 });
      }

      resolvedProducts = (fallbackResult.data || []).map((row) => ({
        ...row,
        bulk_discount_tiers: null,
      }));
    }

    if (resolvedProducts.length === 0) {
      return NextResponse.json({ error: 'No matching products found.' }, { status: 404 });
    }

    if ((action === 'bulk_archive' || action === 'bulk_unarchive' || action === 'bulk_delete') && ctx.membership.role === STORE_ROLES.STAFF) {
      return NextResponse.json({ error: 'Staff cannot perform this bulk action.' }, { status: 403 });
    }

    if (action === 'bulk_archive') {
      const targetIds = resolvedProducts
        .filter((product) => product.moderation_status !== 'archived')
        .map((product) => product.id);

      if (targetIds.length === 0) {
        return NextResponse.json({ success: true, data: { count: 0, skipped: resolvedProducts.length } });
      }

      const { error } = await ctx.adminClient
        .from('products')
        .update({ moderation_status: 'archived', is_active: false })
        .eq('store_id', ctx.membership.store_id)
        .in('id', targetIds);

      if (error) {
        return NextResponse.json({ error: error.message || 'Failed to archive products' }, { status: 400 });
      }

      invalidateProductsCache(resolvedProducts.filter((product) => targetIds.includes(product.id)));

      return NextResponse.json({ success: true, data: { count: targetIds.length, skipped: resolvedProducts.length - targetIds.length } });
    }

    if (action === 'bulk_unarchive') {
      const targetIds = resolvedProducts
        .filter((product) => product.moderation_status === 'archived')
        .map((product) => product.id);

      if (targetIds.length === 0) {
        return NextResponse.json({ success: true, data: { count: 0, skipped: resolvedProducts.length } });
      }

      const { error } = await ctx.adminClient
        .from('products')
        .update({
          moderation_status: 'draft',
          is_active: false,
          reviewed_at: null,
          reviewed_by: null,
          rejection_reason: null,
          published_at: null,
        })
        .eq('store_id', ctx.membership.store_id)
        .in('id', targetIds);

      if (error) {
        return NextResponse.json({ error: error.message || 'Failed to unarchive products' }, { status: 400 });
      }

      invalidateProductsCache(resolvedProducts.filter((product) => targetIds.includes(product.id)));

      return NextResponse.json({ success: true, data: { count: targetIds.length, skipped: resolvedProducts.length - targetIds.length } });
    }

    if (action === 'bulk_delete') {
      const deletableIds = resolvedProducts.filter(canDeleteProduct).map((product) => product.id);
      const blocked = resolvedProducts
        .filter((product) => !canDeleteProduct(product))
        .map((product) => ({ id: product.id, name: product.name, status: product.moderation_status }));

      if (deletableIds.length > 0) {
        const { error } = await ctx.adminClient
          .from('products')
          .delete()
          .eq('store_id', ctx.membership.store_id)
          .in('id', deletableIds);

        if (error) {
          return NextResponse.json({ error: error.message || 'Failed to delete products' }, { status: 400 });
        }
      }

      invalidateProductsCache(resolvedProducts.filter((product) => deletableIds.includes(product.id)));

      return NextResponse.json({
        success: true,
        data: { count: deletableIds.length, skipped: blocked.length, blocked },
      });
    }

    if (action === 'bulk_duplicate') {
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

      const created = [];

      for (const product of resolvedProducts) {
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

          const { data, error } = await ctx.adminClient
            .from('products')
            .insert({
              store_id: ctx.membership.store_id,
              name: duplicateName,
              slug: duplicateSlug,
              sku: duplicateSku,
              description: product.description || '',
              price: product.price,
              discount_price: product.discount_price,
              bulk_discount_tiers: product.bulk_discount_tiers || null,
              stock_quantity: product.stock_quantity,
              is_active: false,
              image_urls: Array.isArray(product.image_urls) ? product.image_urls : [],
              video_urls: Array.isArray(product.video_urls) ? product.video_urls : [],
              specifications: product.specifications || null,
              moderation_status: 'draft',
              submitted_at: null,
              reviewed_at: null,
              reviewed_by: null,
              rejection_reason: null,
              published_at: null,
            })
            .select('id, name, slug, sku')
            .single();

          if (error) throw error;
          created.push(data);
        } catch (error) {
          return NextResponse.json({ error: error.message || 'Failed to duplicate products' }, { status: 400 });
        }
      }

      invalidateProductsCache(created.map((product) => ({
        ...product,
        store_id: ctx.membership.store_id,
      })));

      return NextResponse.json({ success: true, data: { count: created.length, created } }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported bulk action' }, { status: 400 });
  }

  const name = String(body?.name || '').trim();
  const slugInput = String(body?.slug || name).trim();
  const description = String(body?.description || '').trim();
  const parsedPrice = parseWholeNairaAmount(body?.price);
  const parsedDiscountPrice = body?.discount_price === '' || body?.discount_price === null || body?.discount_price === undefined
    ? null
    : parseWholeNairaAmount(body?.discount_price, { allowZero: true });
  const price = parsedPrice.value;
  const discountPrice = parsedDiscountPrice?.value ?? null;
  const stockQuantity = Math.max(0, Number.parseInt(body?.stock_quantity || '0', 10) || 0);
  const rawImageUrls = Array.isArray(body?.image_urls) ? body.image_urls.map(normalizeUrl).filter(Boolean) : [];
  const rawVideoUrls = Array.isArray(body?.video_urls) ? body.video_urls.map(normalizeUrl).filter(Boolean) : [];
  const media = normalizeMediaArray(body?.media);
  const primaryImageInput = normalizeUrl(body?.primary_image_url);
  const specificationResult = normalizeSpecifications(body?.specifications);
  if (specificationResult.error) {
    return NextResponse.json({ error: specificationResult.error }, { status: 400 });
  }
  const specifications = specificationResult.value;
  const bulkDiscountResult = normalizeBulkDiscountTiers(body?.bulk_discount_tiers);
  if (bulkDiscountResult.error) {
    return NextResponse.json({ error: bulkDiscountResult.error }, { status: 400 });
  }
  const bulkDiscountTiers = bulkDiscountResult.value;
  const submitForReview = Boolean(body?.submit_for_review);

  if (!name) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  if (parsedPrice.error) {
    return NextResponse.json({ error: `Valid whole-Naira price is required. ${parsedPrice.error}` }, { status: 400 });
  }

  if (parsedDiscountPrice?.error) {
    return NextResponse.json({ error: `Sale price must be a whole-Naira value. ${parsedDiscountPrice.error}` }, { status: 400 });
  }

  if (discountPrice !== null && discountPrice >= price) {
    return NextResponse.json({ error: 'Sale price must be lower than the main price.' }, { status: 400 });
  }

  const slug = sanitizeSlug(slugInput);
  if (!slug) {
    return NextResponse.json({ error: 'Valid slug is required' }, { status: 400 });
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

  let imageUrls = media.length > 0
    ? media.filter((m) => m.type === 'image').map((m) => m.public_url)
    : rawImageUrls;
  const videoUrls = media.length > 0
    ? media.filter((m) => m.type === 'video').map((m) => m.public_url)
    : rawVideoUrls;

  if (imageUrls.length < 1) {
    return NextResponse.json({ error: 'At least one product image is required' }, { status: 400 });
  }

  const primaryImageUrl = primaryImageInput || imageUrls[0];
  if (!imageUrls.includes(primaryImageUrl)) {
    return NextResponse.json({ error: 'Primary image must be selected from uploaded images' }, { status: 400 });
  }
  imageUrls = [primaryImageUrl, ...imageUrls.filter((url) => url !== primaryImageUrl)];

  const nowIso = new Date().toISOString();
  const moderationStatus = submitForReview ? 'pending_review' : 'draft';
  const sku = await generateProductSku(ctx.adminClient, {
    storeId: ctx.membership.store_id,
    storeSlug: store.slug,
    storeName: store.name,
    productSlug: slug,
    productName: name,
  });

  const insertPayload = {
    store_id: ctx.membership.store_id,
    name,
    slug,
    sku,
    description,
    price,
    discount_price: discountPrice,
    bulk_discount_tiers: bulkDiscountTiers,
    stock_quantity: stockQuantity,
    is_active: false,
    image_urls: imageUrls,
    video_urls: videoUrls,
    specifications,
    moderation_status: moderationStatus,
    submitted_at: submitForReview ? nowIso : null,
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
    published_at: null,
  };

  const { data, error } = await ctx.adminClient
    .from('products')
    .insert(insertPayload)
    .select('id, store_id, name, slug, sku, moderation_status, is_active, submitted_at, created_at')
    .single();

  if (error) {
    if (isMissingBulkDiscountColumnError(error)) {
      return NextResponse.json({ error: BULK_DISCOUNT_MIGRATION_HINT }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  invalidateProductCache(data);

  return NextResponse.json({ success: true, data }, { status: 201 });
}
