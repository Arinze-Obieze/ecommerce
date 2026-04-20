import { createClient } from '@/utils/supabase/server';
import redis from '@/utils/platform/redis';
import { writeActivityLog, writeAnalyticsEvent } from '@/utils/telemetry/server';
import { DEFAULT_RETURN_POLICY, normalizeReturnPolicyRecord } from '@/utils/catalog/return-policy';
import { errorJson, publicJson } from '@/utils/platform/api-response';

export const dynamic = 'force-dynamic';

const PRODUCT_DETAIL_SELECT = `
  id,
  store_id,
  name,
  slug,
  description,
  price,
  discount_price,
  stock_quantity,
  image_urls,
  video_urls,
  sizes,
  colors,
  specifications,
  bulk_discount_tiers,
  rating,
  is_active,
  is_featured,
  moderation_status,
  created_at,
  updated_at,
  product_categories(categories(id, name, slug, parent_id)),
  stores(id, name, slug, logo_url, rating, followers, kyc_status, payout_ready, is_verified)
`;

export async function GET(request, { params }) {
  const startedAt = Date.now();
  const { id } = await params;

  if (!id) {
    await writeActivityLog({
      request,
      level: 'WARN',
      service: 'catalog-service',
      action: 'PRODUCT_DETAIL_INVALID_REQUEST',
      status: 'failure',
      statusCode: 400,
      message: 'Product slug/id missing',
      durationMs: Date.now() - startedAt,
    });
    return errorJson('Slug/ID required', 400);
  }

  const cacheKey = `product:${id}`;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Try Cache
    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const parsed = typeof cachedData === 'object' ? cachedData : JSON.parse(cachedData);
        await writeAnalyticsEvent({
          eventName: 'view_item',
          userId: user?.id || null,
          path: `/products/${parsed.slug || id}`,
          properties: {
            product_id: parsed.id,
            product_name: parsed.name,
            store_id: parsed.store_id || null,
            price: Number(parsed.discount_price || parsed.price || 0),
            cache_hit: true,
          },
        });
        await writeActivityLog({
          request,
          level: 'INFO',
          service: 'catalog-service',
          action: 'PRODUCT_DETAIL_FETCHED',
          status: 'success',
          statusCode: 200,
          message: 'Product detail fetched from cache',
          userId: user?.id || null,
          metadata: { id: parsed.id, slug: parsed.slug, cacheHit: true },
          durationMs: Date.now() - startedAt,
        });
        // @upstash/redis may automatically parse JSON
        if (typeof cachedData === 'object') {
             return publicJson(cachedData);
        }
        return publicJson(parsed);
      }
    }

    // 2. Fetch from DB
    let product = null;
    let error = null;

    // First try slug lookup
    const slugResult = await supabase
      .from('products')
      .select(PRODUCT_DETAIL_SELECT)
      .eq('slug', id)
      .eq('is_active', true)
      .eq('moderation_status', 'approved')
      .single();

    product = slugResult.data;
    error = slugResult.error;

    // If slug lookup fails, allow numeric ID fallback for old links.
    if ((!product || error) && Number.isInteger(Number(id))) {
      const idResult = await supabase
        .from('products')
        .select(PRODUCT_DETAIL_SELECT)
        .eq('id', Number(id))
        .eq('is_active', true)
        .eq('moderation_status', 'approved')
        .single();
      product = idResult.data;
      error = idResult.error;
    }

    if (error || !product) {
        console.error('Supabase Error (slug lookup):', error);
        await writeActivityLog({
          request,
          level: 'WARN',
          service: 'catalog-service',
          action: 'PRODUCT_DETAIL_NOT_FOUND',
          status: 'failure',
          statusCode: 404,
          message: 'Product not found',
          metadata: { id },
          durationMs: Date.now() - startedAt,
        });
        return errorJson('Product not found', 404);
    }

    const { data: returnPolicyRecord, error: returnPolicyError } = await supabase
      .from('platform_content')
      .select('title, description, data, updated_at, updated_by')
      .eq('content_key', 'return_policy')
      .maybeSingle();

    const returnPolicy =
      returnPolicyError && returnPolicyError.code !== 'PGRST116' && returnPolicyError.code !== '42P01'
        ? DEFAULT_RETURN_POLICY
        : returnPolicyRecord
          ? normalizeReturnPolicyRecord(returnPolicyRecord)
          : DEFAULT_RETURN_POLICY;

    let reviews = [];
    const reviewResult = await supabase
      .from('reviews')
      .select('id, product_id, user_id, rating, comment, created_at, edited_at, status, is_verified_purchase, seller_reply, seller_replied_at')
      .eq('product_id', product.id)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!reviewResult.error) {
      const userIds = [...new Set((reviewResult.data || []).map((row) => row.user_id).filter(Boolean))];
      let usersById = new Map();

      if (userIds.length > 0) {
        const usersResult = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', userIds);

        if (!usersResult.error) {
          usersById = new Map((usersResult.data || []).map((row) => [row.id, row]));
        }
      }

      reviews = (reviewResult.data || []).map((review) => ({
        ...review,
        user: usersById.get(review.user_id) || null,
      }));
    }

    // Flatten logic matching frontend expectations
    const flattenedProduct = {
        ...product,
        reviews,
        reviews_count: reviews.length,
        category: product.product_categories?.[0]?.categories,
        return_policy: returnPolicy,
    };

    // 3. Set Cache (TTL 5 mins)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(flattenedProduct), { ex: 300 });
    }

    await writeAnalyticsEvent({
      eventName: 'view_item',
      userId: user?.id || null,
      path: `/products/${flattenedProduct.slug || id}`,
      properties: {
        product_id: flattenedProduct.id,
        product_name: flattenedProduct.name,
        store_id: flattenedProduct.store_id || null,
        price: Number(flattenedProduct.discount_price || flattenedProduct.price || 0),
      },
    });

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'catalog-service',
      action: 'PRODUCT_DETAIL_FETCHED',
      status: 'success',
      statusCode: 200,
      message: 'Product detail fetched',
      userId: user?.id || null,
      metadata: { id: flattenedProduct.id, slug: flattenedProduct.slug },
      durationMs: Date.now() - startedAt,
    });

    return publicJson(flattenedProduct);

  } catch (err) {
    console.error('API Error:', err);
    await writeActivityLog({
      request,
      level: 'ERROR',
      service: 'catalog-service',
      action: 'PRODUCT_DETAIL_FAILED',
      status: 'failure',
      statusCode: 500,
      message: err.message || 'Product detail API failed',
      errorCode: err.code || null,
      errorStack: err.stack || null,
      metadata: { id },
      durationMs: Date.now() - startedAt,
    });
    return errorJson('Internal Server Error');
  }
}
