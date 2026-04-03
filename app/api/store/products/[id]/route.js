import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { normalizeSpecifications } from '@/utils/productCatalog';
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const { data: product, error: productError } = await ctx.adminClient
    .from('products')
    .select('id, store_id, moderation_status, is_active, name, slug, image_urls, video_urls, bulk_discount_tiers')
    .eq('id', id)
    .eq('store_id', ctx.membership.store_id)
    .maybeSingle();

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

  if (Object.keys(updates).length === 0 && !body?.submit_for_review && !body?.archive) {
    return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
  }

  const nowIso = new Date().toISOString();

  if (body?.archive) {
    if (ctx.membership.role === STORE_ROLES.STAFF) {
      return NextResponse.json({ error: 'Staff cannot archive products' }, { status: 403 });
    }
    updates.moderation_status = 'archived';
    updates.is_active = false;
  }

  if (body?.submit_for_review) {
    updates.moderation_status = 'pending_review';
    updates.submitted_at = nowIso;
    updates.reviewed_at = null;
    updates.reviewed_by = null;
    updates.rejection_reason = null;
    updates.is_active = false;
  } else if (Object.keys(updates).length > 0 && product.moderation_status === 'approved') {
    // Approved product changed by store should require fresh review.
    updates.moderation_status = 'pending_review';
    updates.submitted_at = nowIso;
    updates.reviewed_at = null;
    updates.reviewed_by = null;
    updates.rejection_reason = null;
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
