import { createClient } from '@/utils/supabase/server';
import { resolveAdminMembership } from '@/utils/adminAuth';
import { writeActivityLog, writeAnalyticsEvent } from '@/utils/serverTelemetry';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
const MAX_PAGE_SIZE = 10;
const SMART_CANDIDATE_MIN = 72;
const SMART_CANDIDATE_MAX = 180;
const SMART_CANDIDATE_MULTIPLIER = 6;

async function resolveCategoryBranchIds(supabase, categorySlug) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_category_branch_ids', {
    p_slug: categorySlug,
  });

  if (!rpcError && Array.isArray(rpcData)) {
    return rpcData
      .map((row) => Number(row.id))
      .filter((id) => Number.isInteger(id));
  }

  const { data: categoryData } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!categoryData) return [];

  const { data: allCats } = await supabase
    .from('categories')
    .select('id, parent_id')
    .eq('is_active', true);

  const getDescendants = (parentId) => {
    const children = (allCats || []).filter((c) => c.parent_id === parentId);
    let descendants = [...children];
    children.forEach((child) => {
      descendants = [...descendants, ...getDescendants(child.id)];
    });
    return descendants;
  };

  const descendants = getDescendants(categoryData.id);
  return [categoryData.id, ...descendants.map((c) => c.id)];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalize(value, max) {
  if (max <= 0) return 0;
  return clamp(value / max, 0, 1);
}

function safeLogScale(value) {
  return Math.log1p(Math.max(0, value));
}

function tokenize(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function daysSince(timestamp) {
  if (!timestamp) return 9999;
  const time = new Date(timestamp).getTime();
  if (!Number.isFinite(time)) return 9999;
  return Math.max(0, (Date.now() - time) / (1000 * 60 * 60 * 24));
}

function getActorSignalsFromHeaders(request) {
  return {
    anonId: request.headers.get('x-shophub-anon-id') || null,
    sessionId: request.headers.get('x-shophub-session-id') || null,
    surface: request.headers.get('x-shophub-surface') || null,
  };
}

function getPrimaryCategory(product) {
  return product.categories?.[0]?.slug || product.categories?.[0]?.name || 'uncategorized';
}

function getEffectivePrice(product) {
  return toNumber(product.discount_price ?? product.price, 0);
}

function getPriceBand(product, priceRange) {
  const min = priceRange.min;
  const max = priceRange.max;
  const price = getEffectivePrice(product);

  if (max <= min) return 'mid';
  const ratio = (price - min) / (max - min);
  if (ratio < 0.33) return 'budget';
  if (ratio < 0.66) return 'mid';
  return 'premium';
}

function buildTextCorpus(product) {
  const parts = [
    product.name,
    product.description,
    product.store?.name,
    ...(product.categories || []).map((category) => category?.name),
    ...(product.sizes || []),
    ...(product.colors || []),
  ];

  return tokenize(parts.filter(Boolean).join(' '));
}

function computeSearchRelevance(product, searchTokens) {
  if (searchTokens.length === 0) return 0.5;

  const nameTokens = tokenize(product.name);
  const categoryTokens = tokenize((product.categories || []).map((category) => category.name).join(' '));
  const corpus = buildTextCorpus(product);
  const nameSet = new Set(nameTokens);
  const categorySet = new Set(categoryTokens);
  const corpusSet = new Set(corpus);

  let score = 0;
  for (const token of searchTokens) {
    if (nameSet.has(token)) score += 0.42;
    else if (categorySet.has(token)) score += 0.26;
    else if (corpusSet.has(token)) score += 0.18;
  }

  const joinedName = String(product.name || '').toLowerCase();
  const fullQuery = searchTokens.join(' ');
  if (fullQuery && joinedName.includes(fullQuery)) {
    score += 0.2;
  }

  return clamp(score / Math.max(1, searchTokens.length), 0, 1);
}

function computeCategoryRelevance(product, category) {
  if (!category || category === 'all') return 0.5;
  const productCategorySlugs = new Set((product.categories || []).map((item) => item.slug));
  return productCategorySlugs.has(category) ? 1 : 0.45;
}

function computeStoreTrust(product) {
  const store = product.store;
  if (!store) return 0.45;

  const ratingScore = clamp(toNumber(store.rating, 4.2) / 5, 0, 1);
  const followerScore = clamp(safeLogScale(toNumber(store.followers, 0)) / safeLogScale(5000), 0, 1);
  const verifiedBoost = store.is_verified || store.kyc_status === 'verified' ? 0.12 : 0;
  const payoutBoost = store.payout_ready ? 0.05 : 0;
  const statusPenalty = store.status === 'active' ? 0 : -0.2;

  return clamp((ratingScore * 0.55) + (followerScore * 0.28) + verifiedBoost + payoutBoost + statusPenalty, 0, 1);
}

function computeQualityScore(product) {
  const ratingScore = clamp(toNumber(product.rating, 0) / 5, 0, 1);
  const imageScore = clamp((product.image_urls || []).length / 4, 0, 1);
  const videoScore = clamp((product.video_urls || []).length / 2, 0, 1);
  const descriptionScore = clamp(String(product.description || '').trim().length / 280, 0, 1);
  const specScore = product.specifications && typeof product.specifications === 'object' ? 0.7 : 0.2;
  const featuredBoost = product.is_featured ? 0.06 : 0;

  return clamp(
    (ratingScore * 0.34) +
      (imageScore * 0.24) +
      (descriptionScore * 0.18) +
      (specScore * 0.14) +
      (videoScore * 0.04) +
      featuredBoost,
    0,
    1
  );
}

function computeInventoryScore(product) {
  const stock = toNumber(product.stock_quantity, 0);
  if (stock <= 0) return 0;
  if (stock <= 2) return 0.35;
  if (stock <= 5) return 0.55;
  if (stock <= 12) return 0.78;
  return 1;
}

function computeFreshnessScore(product) {
  const ageDays = daysSince(product.created_at);
  const freshness = Math.exp(-ageDays / 45);
  return clamp(freshness, 0, 1);
}

function computeDiscountScore(product) {
  const price = toNumber(product.price, 0);
  const discountPrice = toNumber(product.discount_price, 0);
  if (price <= 0 || discountPrice <= 0 || discountPrice >= price) return 0;
  return clamp((price - discountPrice) / price, 0, 0.5) * 2;
}

function buildProductEventMap(events, candidateIds) {
  const map = new Map();
  const candidateSet = new Set(candidateIds);

  for (const event of events || []) {
    const productId = Number(event?.properties?.product_id);
    if (!Number.isInteger(productId) || !candidateSet.has(productId)) continue;

    const current = map.get(productId) || {
      impressions: 0,
      views: 0,
      carts: 0,
      purchases: 0,
      wishlists: 0,
    };

    if (event.event_name === 'product_impression') current.impressions += 1;
    if (event.event_name === 'view_item') current.views += 1;
    if (event.event_name === 'add_to_cart') current.carts += 1;
    if (event.event_name === 'purchase') current.purchases += 1;
    if (event.event_name === 'add_to_wishlist') current.wishlists += 1;

    map.set(productId, current);
  }

  return map;
}

function buildProductMetricMapFromAggregates(rows, candidateIds) {
  const map = new Map();
  const candidateSet = new Set(candidateIds);

  for (const row of rows || []) {
    const productId = Number(row?.product_id);
    if (!Number.isInteger(productId) || !candidateSet.has(productId)) continue;

    map.set(productId, {
      impressions: toNumber(row.impressions_30d, 0),
      views: toNumber(row.views_30d, 0),
      carts: toNumber(row.carts_30d, 0),
      purchases: toNumber(row.purchases_30d, 0),
      wishlists: toNumber(row.wishlists_30d, 0),
      source: 'aggregate',
      refreshedAt: row.refreshed_at || null,
    });
  }

  return map;
}

function buildActorPreferenceProfile(events, historicalProducts) {
  const categoryWeights = new Map();
  const storeWeights = new Map();
  const colorWeights = new Map();
  const sizeWeights = new Map();
  let priceSum = 0;
  let priceCount = 0;

  const historyById = new Map((historicalProducts || []).map((product) => [product.id, product]));

  for (const event of events || []) {
    const productId = Number(event?.properties?.product_id);
    if (!Number.isInteger(productId)) continue;
    const product = historyById.get(productId);
    if (!product) continue;

    const weight =
      event.event_name === 'purchase' ? 4 :
      event.event_name === 'add_to_cart' ? 2.5 :
      event.event_name === 'add_to_wishlist' ? 1.8 :
      1;

    for (const category of product.categories || []) {
      if (!category?.slug) continue;
      categoryWeights.set(category.slug, (categoryWeights.get(category.slug) || 0) + weight);
    }

    if (product.store_id) {
      storeWeights.set(product.store_id, (storeWeights.get(product.store_id) || 0) + weight);
    }

    for (const color of product.colors || []) {
      if (!color) continue;
      colorWeights.set(color.toLowerCase(), (colorWeights.get(color.toLowerCase()) || 0) + weight * 0.35);
    }

    for (const size of product.sizes || []) {
      if (!size) continue;
      sizeWeights.set(String(size).toLowerCase(), (sizeWeights.get(String(size).toLowerCase()) || 0) + weight * 0.3);
    }

    priceSum += getEffectivePrice(product) * weight;
    priceCount += weight;
  }

  return {
    categoryWeights,
    storeWeights,
    colorWeights,
    sizeWeights,
    preferredPrice: priceCount > 0 ? priceSum / priceCount : null,
  };
}

function computePersonalizationScore(product, profile) {
  if (!profile) return 0;

  let score = 0;
  let possible = 0;

  for (const category of product.categories || []) {
    const value = profile.categoryWeights.get(category.slug);
    if (value) score += Math.min(1, value / 4) * 0.45;
  }
  possible += 0.45;

  if (product.store_id) {
    const storeWeight = profile.storeWeights.get(product.store_id) || 0;
    score += Math.min(1, storeWeight / 4) * 0.22;
  }
  possible += 0.22;

  const colorMatch = (product.colors || []).some((color) => profile.colorWeights.get(String(color).toLowerCase()) > 0);
  if (colorMatch) score += 0.1;
  possible += 0.1;

  const sizeMatch = (product.sizes || []).some((size) => profile.sizeWeights.get(String(size).toLowerCase()) > 0);
  if (sizeMatch) score += 0.08;
  possible += 0.08;

  if (profile.preferredPrice) {
    const diff = Math.abs(getEffectivePrice(product) - profile.preferredPrice) / Math.max(profile.preferredPrice, 1);
    score += clamp(1 - diff, 0, 1) * 0.15;
  }
  possible += 0.15;

  return possible > 0 ? clamp(score / possible, 0, 1) : 0;
}

function computePopularityAndConversion(product, productEvents, maxima) {
  const events = productEvents.get(product.id) || { impressions: 0, views: 0, carts: 0, purchases: 0, wishlists: 0 };
  const popularityRaw = (events.views * 1) + (events.wishlists * 2) + (events.carts * 4) + (events.purchases * 7);
  const popularityScore = normalize(safeLogScale(popularityRaw), maxima.popularityLogMax);

  const impressionBase = Math.max(1, events.impressions || events.views);
  const clickThrough = clamp(events.views / impressionBase, 0, 1);
  const cartThrough = clamp(events.carts / impressionBase, 0, 1);
  const purchaseThrough = clamp(events.purchases / impressionBase, 0, 1);
  const conversionRaw = (clickThrough * 0.2) + (cartThrough * 0.35) + (purchaseThrough * 0.45);
  const conversionScore = clamp(conversionRaw * 5, 0, 1);

  return { popularityScore, conversionScore, events };
}

function computeExplorationBonus(product, eventStats, qualityScore, freshnessScore) {
  const lowExposure = (eventStats.impressions || 0) <= 6 && eventStats.carts === 0 && eventStats.purchases === 0;
  if (!lowExposure) return 0;
  return clamp((qualityScore * 0.08) + (freshnessScore * 0.07), 0, 0.12);
}

function computeRiskPenalty(product, inventoryScore, storeTrustScore) {
  let penalty = 0;
  if (inventoryScore < 0.4) penalty += 0.05;
  if (storeTrustScore < 0.45) penalty += 0.06;
  if ((product.image_urls || []).length === 0) penalty += 0.04;
  return penalty;
}

function rerankForDiversity(scoredProducts, pageSize) {
  const remaining = [...scoredProducts];
  const selected = [];
  const storeCounts = new Map();
  const categoryCounts = new Map();
  const priceBandCounts = new Map();
  const initialFocusCount = Math.min(remaining.length, Math.max(pageSize * 2, 18));

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = -Infinity;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      let adjustedScore = candidate.score;

      const storeCount = storeCounts.get(candidate.storeKey) || 0;
      if (selected.length < initialFocusCount) {
        if (storeCount >= 2) adjustedScore -= 0.14;
        else adjustedScore -= storeCount * 0.06;
      }

      const categoryCount = categoryCounts.get(candidate.primaryCategory) || 0;
      if (selected.length < initialFocusCount) {
        adjustedScore -= Math.max(0, categoryCount - 1) * 0.03;
      }

      const priceCount = priceBandCounts.get(candidate.priceBand) || 0;
      if (selected.length < initialFocusCount) {
        adjustedScore -= Math.max(0, priceCount - 1) * 0.02;
      }

      if (index === 0) {
        adjustedScore += 0.0001;
      }

      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    }

    const [chosen] = remaining.splice(bestIndex, 1);
    selected.push(chosen);
    storeCounts.set(chosen.storeKey, (storeCounts.get(chosen.storeKey) || 0) + 1);
    categoryCounts.set(chosen.primaryCategory, (categoryCounts.get(chosen.primaryCategory) || 0) + 1);
    priceBandCounts.set(chosen.priceBand, (priceBandCounts.get(chosen.priceBand) || 0) + 1);
  }

  return selected;
}

function generatePageNumbers(currentPage, totalPages, maxPages = 10) {
  if (totalPages <= 1) return [1];

  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages, startPage + maxPages - 1);

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

function generatePageLinks(baseUrl, searchParams, currentPage, totalPages, limit) {
  const params = new URLSearchParams(searchParams);
  params.set('limit', limit.toString());

  const links = {
    first: null,
    last: null,
    prev: null,
    next: null,
    self: null,
  };

  params.set('page', currentPage.toString());
  links.self = `${baseUrl}?${params.toString()}`;

  params.set('page', '1');
  links.first = `${baseUrl}?${params.toString()}`;

  params.set('page', totalPages.toString());
  links.last = `${baseUrl}?${params.toString()}`;

  if (currentPage > 1) {
    params.set('page', (currentPage - 1).toString());
    links.prev = `${baseUrl}?${params.toString()}`;
  }

  if (currentPage < totalPages) {
    params.set('page', (currentPage + 1).toString());
    links.next = `${baseUrl}?${params.toString()}`;
  }

  return links;
}

async function fetchRecentAnalyticsEvents(supabase, { candidateIds, actorIds, skipGlobal = false }) {
  const productMetricsSince = new Date(Date.now() - (1000 * 60 * 60 * 24 * 30)).toISOString();
  const actorSince = new Date(Date.now() - (1000 * 60 * 60 * 24 * 45)).toISOString();

  let globalEvents = [];
  let actorEvents = [];

  const relevantEventNames = ['product_impression', 'view_item', 'add_to_cart', 'add_to_wishlist', 'purchase'];

  if (!skipGlobal) {
    try {
      const { data } = await supabase
        .from('analytics_events')
        .select('event_name, user_id, session_id, anon_id, properties, created_at')
        .in('event_name', relevantEventNames)
        .gte('created_at', productMetricsSince)
        .order('created_at', { ascending: false })
        .limit(8000);

      const candidateSet = new Set(candidateIds);
      globalEvents = (data || []).filter((event) => {
        const productId = Number(event?.properties?.product_id);
        return Number.isInteger(productId) && candidateSet.has(productId);
      });
    } catch (error) {
      console.error('Failed to fetch recent analytics events:', error);
    }
  }

  if (!actorIds.userId && !actorIds.anonId && !actorIds.sessionId) {
    return { globalEvents, actorEvents };
  }

  try {
    const actorQueries = [];

    if (actorIds.userId) {
      actorQueries.push(
        supabase
          .from('analytics_events')
          .select('event_name, properties, created_at')
          .eq('user_id', actorIds.userId)
          .in('event_name', relevantEventNames)
          .gte('created_at', actorSince)
          .order('created_at', { ascending: false })
          .limit(250)
      );
    }

    if (actorIds.anonId) {
      actorQueries.push(
        supabase
          .from('analytics_events')
          .select('event_name, properties, created_at')
          .eq('anon_id', actorIds.anonId)
          .in('event_name', relevantEventNames)
          .gte('created_at', actorSince)
          .order('created_at', { ascending: false })
          .limit(250)
      );
    }

    if (actorIds.sessionId) {
      actorQueries.push(
        supabase
          .from('analytics_events')
          .select('event_name, properties, created_at')
          .eq('session_id', actorIds.sessionId)
          .in('event_name', relevantEventNames)
          .gte('created_at', actorSince)
          .order('created_at', { ascending: false })
          .limit(250)
      );
    }

    const results = await Promise.all(actorQueries);
    const dedupe = new Set();

    for (const result of results) {
      for (const event of result.data || []) {
        const key = `${event.created_at}|${event.event_name}|${event.properties?.product_id || ''}`;
        if (dedupe.has(key)) continue;
        dedupe.add(key);
        actorEvents.push(event);
      }
    }
  } catch (error) {
    console.error('Failed to fetch actor analytics events:', error);
  }

  return { globalEvents, actorEvents };
}

async function fetchAggregateRecommendationMetrics(supabase, candidateIds) {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return { available: false, metricsMap: new Map(), refreshedAt: null };
  }

  try {
    const { data, error } = await supabase
      .from('product_recommendation_metrics')
      .select('product_id, impressions_30d, views_30d, carts_30d, purchases_30d, wishlists_30d, refreshed_at')
      .in('product_id', candidateIds);

    if (error) {
      return { available: false, metricsMap: new Map(), refreshedAt: null };
    }

    const metricsMap = buildProductMetricMapFromAggregates(data || [], candidateIds);
    const refreshedAt = (data || []).reduce((latest, row) => {
      if (!row?.refreshed_at) return latest;
      if (!latest) return row.refreshed_at;
      return new Date(row.refreshed_at) > new Date(latest) ? row.refreshed_at : latest;
    }, null);

    return {
      available: metricsMap.size > 0,
      metricsMap,
      refreshedAt,
    };
  } catch {
    return { available: false, metricsMap: new Map(), refreshedAt: null };
  }
}

function buildBaseProductQuery(supabase) {
  return supabase
    .from('products')
    .select('*, stores(id, name, slug, logo_url, rating, followers, status, kyc_status, payout_ready, is_verified), product_categories(categories(id, name, slug))', {
      count: 'exact',
    })
    .eq('is_active', true);
}

function transformProducts(data) {
  return (data || []).map((product) => {
    const categories = product.product_categories?.map((item) => ({
      id: item.categories.id,
      name: item.categories.name,
      slug: item.categories.slug,
    })) || [];

    return {
      ...product,
      categories,
      store: product.stores || null,
    };
  }).map((product) => {
    delete product.product_categories;
    delete product.stores;
    return product;
  });
}

export async function GET(request) {
  const startedAt = Date.now();

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const url = new URL(request.url);

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || DEFAULT_LIMIT, 10);
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), MAX_LIMIT);

    const offset = (page - 1) * limit;

    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'smart';
    const search = searchParams.get('search');
    const sizesParam = searchParams.get('sizes');
    const colorsParam = searchParams.get('colors');
    const featured = searchParams.get('featured');
    const hasDiscount = searchParams.get('hasDiscount') || searchParams.get('onSale');
    const idsParam = searchParams.get('ids');
    const storeId = searchParams.get('storeId') || searchParams.get('sellerId');
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true';
    const inStock = searchParams.get('inStock') === 'true';
    const collection = searchParams.get('collection');
    const requestedDebugRanking = searchParams.get('debug') === 'true';
    let debugRanking = false;

    if (requestedDebugRanking) {
      const admin = await resolveAdminMembership();
      debugRanking = Boolean(admin?.membership?.is_active);
    }

    const sizes = sizesParam ? sizesParam.split(',').filter(Boolean) : [];
    const colors = colorsParam ? colorsParam.split(',').filter(Boolean) : [];

    let query = buildBaseProductQuery(supabase);

    if (!includeOutOfStock || inStock) {
      query = query.gt('stock_quantity', 0);
    }

    if (category && category !== 'all') {
      const categoryIds = await resolveCategoryBranchIds(supabase, category);
      if (categoryIds.length > 0) {
        const { data: productIds } = await supabase
          .from('product_categories')
          .select('product_id')
          .in('category_id', categoryIds);

        const ids = productIds?.map((item) => item.product_id) || [];
        query = ids.length > 0 ? query.in('id', ids) : query.eq('id', -1);
      } else {
        query = query.eq('id', -1);
      }
    }

    if (collection) {
      if (collection === 'new-arrivals') {
        // ── New Arrivals logic ────────────────────────────────────────────────
        // We use `reviewed_at` (not `created_at`) as the anchor date because:
        //   • `created_at` is when the seller uploaded the product — it may sit
        //     in moderation for days before shoppers can see it.
        //   • `reviewed_at` is stamped when a moderator approves the listing,
        //     meaning it's the exact moment the product became publicly visible.
        // We only include products approved within the last 14 days, and we
        // explicitly guard on moderation_status = 'approved' because reviewed_at
        // is also set on rejected products (to record when they were reviewed).
        // Pair with sortBy=reviewed_at to surface the most recently approved first.
        // ─────────────────────────────────────────────────────────────────────
        const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        query = query
          .eq('moderation_status', 'approved')
          .not('reviewed_at', 'is', null)
          .gte('reviewed_at', cutoff);
      } else {
        // All other collections are curated manually via the collections +
        // product_collections join tables, looked up by slug.
        const { data: collectionData } = await supabase
          .from('collections')
          .select('id')
          .eq('slug', collection)
          .single();

        if (collectionData) {
          const { data: productIds } = await supabase
            .from('product_collections')
            .select('product_id')
            .eq('collection_id', collectionData.id);

          const ids = productIds?.map((item) => item.product_id) || [];
          query = ids.length > 0 ? query.in('id', ids) : query.eq('id', -1);
        } else {
          query = query.eq('id', -1);
        }
      }
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (sizes.length > 0) {
      query = query.overlaps('sizes', sizes);
    }

    if (colors.length > 0) {
      query = query.overlaps('colors', colors);
    }

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (hasDiscount === 'true') {
      query = query.not('discount_price', 'is', null);
    }

    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value));
      if (ids.length > 0) {
        query = query.in('id', ids);
      }
    }

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    let data = [];
    let count = 0;

    const useSmartRanking = sortBy === 'smart';

    if (useSmartRanking) {
      const smartLimit = clamp(
        Math.max(SMART_CANDIDATE_MIN, (offset + limit) * SMART_CANDIDATE_MULTIPLIER),
        SMART_CANDIDATE_MIN,
        SMART_CANDIDATE_MAX
      );

      query = query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(0, smartLimit - 1);

      const result = await query;
      if (result.error) throw result.error;
      data = result.data || [];
      count = result.count || 0;
    } else {
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'reviewed_at':
          // Most recently approved products first; nulls (unreviewed) go last.
          query = query.order('reviewed_at', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.order('id', { ascending: true }).range(offset, offset + limit - 1);
      const result = await query;
      if (result.error) throw result.error;
      data = result.data || [];
      count = result.count || 0;
    }

    const transformedData = transformProducts(data);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const actorSignals = getActorSignalsFromHeaders(request);
    const actorIds = {
      userId: user?.id || null,
      anonId: actorSignals.anonId,
      sessionId: actorSignals.sessionId,
    };

    let rankedData = transformedData;
    let scoringMeta = {
      strategy: useSmartRanking ? 'smart' : 'explicit_sort',
      persona: user?.id ? 'signed_in' : (actorSignals.anonId || actorSignals.sessionId ? 'anonymous_session' : 'first_time'),
      surface: actorSignals.surface || (search ? 'search' : category ? 'category' : storeId ? 'store' : 'browse'),
    };

    if (useSmartRanking && transformedData.length > 0 && !idsParam) {
      const candidateIds = transformedData.map((product) => product.id);
      const aggregateMetrics = await fetchAggregateRecommendationMetrics(supabase, candidateIds);
      const { globalEvents, actorEvents } = await fetchRecentAnalyticsEvents(supabase, {
        candidateIds,
        actorIds,
        skipGlobal: aggregateMetrics.available,
      });
      const productEvents = aggregateMetrics.available
        ? aggregateMetrics.metricsMap
        : buildProductEventMap(globalEvents, candidateIds);

      const actorProductIds = [...new Set(
        (actorEvents || [])
          .map((event) => Number(event?.properties?.product_id))
          .filter((id) => Number.isInteger(id))
      )];

      let actorHistoricalProducts = [];
      if (actorProductIds.length > 0) {
        try {
          const { data: actorProducts } = await buildBaseProductQuery(supabase)
            .in('id', actorProductIds)
            .range(0, Math.max(0, actorProductIds.length - 1));
          actorHistoricalProducts = transformProducts(actorProducts || []);
        } catch (error) {
          console.error('Failed to fetch actor historical products:', error);
        }
      }

      const actorProfile = actorEvents.length > 0
        ? buildActorPreferenceProfile(actorEvents, actorHistoricalProducts)
        : null;

      const maxima = { popularityLogMax: 1 };
      for (const product of transformedData) {
        const events = productEvents.get(product.id) || { views: 0, carts: 0, purchases: 0, wishlists: 0 };
        const popularityRaw = (events.views * 1) + (events.wishlists * 2) + (events.carts * 4) + (events.purchases * 7);
        maxima.popularityLogMax = Math.max(maxima.popularityLogMax, safeLogScale(popularityRaw));
      }

      const searchTokens = tokenize(search);
      const effectivePrices = transformedData.map(getEffectivePrice);
      const priceRange = {
        min: Math.min(...effectivePrices),
        max: Math.max(...effectivePrices),
      };

      const scored = transformedData.map((product) => {
        const relevance =
          searchTokens.length > 0
            ? computeSearchRelevance(product, searchTokens)
            : computeCategoryRelevance(product, category);
        const { popularityScore, conversionScore, events } = computePopularityAndConversion(product, productEvents, maxima);
        const qualityScore = computeQualityScore(product);
        const storeTrustScore = computeStoreTrust(product);
        const freshnessScore = computeFreshnessScore(product);
        const inventoryScore = computeInventoryScore(product);
        const personalizationScore = computePersonalizationScore(product, actorProfile);
        const discountScore = computeDiscountScore(product);
        const explorationBonus = computeExplorationBonus(product, events, qualityScore, freshnessScore);
        const riskPenalty = computeRiskPenalty(product, inventoryScore, storeTrustScore);

        const score =
          (relevance * 0.3) +
          (conversionScore * 0.2) +
          (popularityScore * 0.1) +
          (qualityScore * 0.1) +
          (storeTrustScore * 0.1) +
          (freshnessScore * 0.08) +
          (inventoryScore * 0.07) +
          (personalizationScore * 0.05) +
          (discountScore * 0.04) +
          explorationBonus -
          riskPenalty;

        return {
          ...product,
          score,
          score_breakdown: {
            relevance,
            conversion: conversionScore,
            popularity: popularityScore,
            quality: qualityScore,
            sellerTrust: storeTrustScore,
            freshness: freshnessScore,
            inventory: inventoryScore,
            personalization: personalizationScore,
            discount: discountScore,
            explorationBonus,
            riskPenalty,
          },
          storeKey: product.store_id || 'unknown',
          primaryCategory: getPrimaryCategory(product),
          priceBand: getPriceBand(product, priceRange),
        };
      });

      const reranked = rerankForDiversity(
        scored.sort((left, right) => right.score - left.score || left.id - right.id),
        limit
      );

      rankedData = reranked.map((product) => {
        const next = { ...product };
        if (!debugRanking) {
          delete next.score_breakdown;
          delete next.score;
        }
        delete next.storeKey;
        delete next.primaryCategory;
        delete next.priceBand;
        return next;
      });

      scoringMeta = {
        ...scoringMeta,
        candidateCount: transformedData.length,
        actorHistoryEvents: actorEvents.length,
        usedPersonalization: Boolean(actorProfile),
        metricsSource: aggregateMetrics.available ? 'aggregate_table' : 'raw_events',
        metricsRefreshedAt: aggregateMetrics.refreshedAt,
      };
    }

    const totalItems = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    if (page > totalPages && totalPages > 0) {
      page = totalPages;
    }

    const pageNumbers = generatePageNumbers(page, totalPages, MAX_PAGE_SIZE);
    const baseUrl = `${url.origin}${url.pathname}`;
    const links = generatePageLinks(baseUrl, searchParams, page, totalPages, limit);

    const pageData = useSmartRanking && !idsParam
      ? rankedData.slice(offset, offset + limit)
      : rankedData;

    if (search && search.trim()) {
      await writeAnalyticsEvent({
        eventName: 'search',
        userId: user?.id || null,
        sessionId: actorSignals.sessionId,
        anonId: actorSignals.anonId,
        path: '/shop',
        properties: {
          query: search.trim(),
          category: category || null,
          results_count: pageData.length,
          total_matches: totalItems,
          sort_by: sortBy,
        },
      });
    }

    await writeActivityLog({
      request,
      level: 'INFO',
      service: 'catalog-service',
      action: 'PRODUCTS_LIST_FETCHED',
      status: 'success',
      statusCode: 200,
      message: 'Product listing fetched',
      userId: user?.id || null,
      metadata: {
        page,
        limit,
        sortBy,
        hasSearch: Boolean(search && search.trim()),
        hasCategory: Boolean(category),
        totalItems,
        strategy: scoringMeta.strategy,
        persona: scoringMeta.persona,
      },
      durationMs: Date.now() - startedAt,
    });

    return Response.json({
      success: true,
      data: pageData,
      meta: {
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          startItem: totalItems > 0 ? offset + 1 : 0,
          endItem: Math.min(offset + limit, totalItems),
          pageNumbers,
        },
        filters: {
          category,
          collection,
          minPrice,
          maxPrice,
          sortBy,
          search,
          sizes,
          colors,
        },
        scoring: scoringMeta,
        debug: debugRanking ? {
          enabled: true,
          note: 'Ranking score breakdowns are included in the product payload for debugging.',
        } : undefined,
        links,
      },
    });
  } catch (error) {
    console.error('Products API Error:', error);
    await writeActivityLog({
      request,
      level: 'ERROR',
      service: 'catalog-service',
      action: 'PRODUCTS_LIST_FAILED',
      status: 'failure',
      statusCode: 500,
      message: error.message || 'Products API failed',
      errorCode: error.code || null,
      errorStack: error.stack || null,
      durationMs: Date.now() - startedAt,
    });
    return Response.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
