import { GET as getProductsRoute } from '@/features/catalog/server/products-route';
import { GET as getHeroBannerRoute } from '@/app/api/hero-banner/route';
import { GET as getTopStoresRoute } from '@/app/api/stores/top/route';

function buildInternalRequest(path, headers = {}) {
  return new Request(`http://localhost${path}`, {
    headers: new Headers(headers),
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function getCatalogProductsServer(params, surface) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const response = await getProductsRoute(
    buildInternalRequest(`/api/products?${searchParams.toString()}`, {
      ...(surface ? { 'x-shophub-surface': surface } : {}),
      'x-zova-skip-auth': '1',
      'x-zova-skip-rate-limit': '1',
    })
  );

  return readJson(response);
}

export async function getHeroBannerServer() {
  const response = await getHeroBannerRoute();
  return readJson(response);
}

export async function getTopStoresServer(limit = 8) {
  const response = await getTopStoresRoute(
    buildInternalRequest(`/api/stores/top?limit=${limit}`)
  );
  return readJson(response);
}

export async function getBestSellerProductsServer(limit = 8) {
  let json = await getCatalogProductsServer(
    { collection: 'best-sellers', limit },
    'best_sellers'
  );

  if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
    json = await getCatalogProductsServer({ sortBy: 'rating', limit }, 'best_sellers');
  }

  return json;
}

export async function getNewArrivalProductsServer(limit = 8) {
  let json = await getCatalogProductsServer(
    { collection: 'new-arrivals', sortBy: 'reviewed_at', limit },
    'new_arrivals'
  );

  if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
    json = await getCatalogProductsServer({ sortBy: 'reviewed_at', limit }, 'new_arrivals');
  }

  return json;
}

export function getRecommendedProductsServer(limit = 10) {
  return getCatalogProductsServer({ limit, sortBy: 'smart' }, 'recommended_home');
}

export function getExploreProductsServer(limit = 12) {
  return getCatalogProductsServer({ limit }, 'home_explore');
}
