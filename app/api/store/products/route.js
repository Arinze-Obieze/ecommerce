import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { generateProductSku, normalizeSpecifications } from '@/utils/productCatalog';
import { normalizeBulkDiscountTiers } from '@/utils/bulkPricing';

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const moderationStatus = normalizeModerationFilter(searchParams.get('moderationStatus'));
  const search = String(searchParams.get('search') || '').trim();

  let query = ctx.adminClient
    .from('products')
    .select('id, store_id, name, slug, sku, price, discount_price, bulk_discount_tiers, stock_quantity, image_urls, video_urls, is_active, moderation_status, submitted_at, reviewed_at, rejection_reason, created_at, updated_at')
    .eq('store_id', ctx.membership.store_id)
    .order('created_at', { ascending: false })
    .limit(500);

  if (moderationStatus) {
    query = query.eq('moderation_status', moderationStatus);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = data || [];

  const summary = {
    total: products.length,
    draft: products.filter((p) => p.moderation_status === 'draft').length,
    pending_review: products.filter((p) => p.moderation_status === 'pending_review').length,
    approved: products.filter((p) => p.moderation_status === 'approved').length,
    rejected: products.filter((p) => p.moderation_status === 'rejected').length,
    archived: products.filter((p) => p.moderation_status === 'archived').length,
  };

  return NextResponse.json({ success: true, data: products, summary });
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));

  const name = String(body?.name || '').trim();
  const slugInput = String(body?.slug || name).trim();
  const description = String(body?.description || '').trim();
  const price = toNumber(body?.price);
  const discountPrice = body?.discount_price === '' || body?.discount_price === null || body?.discount_price === undefined
    ? null
    : toNumber(body?.discount_price);
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

  if (price === null || price <= 0) {
    return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
