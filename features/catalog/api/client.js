"use client";

import { apiJson } from "@/features/shared/api/http";
import { getRecommendationRequestHeaders } from "@/utils/catalog/recommendation-request";

function productsUrl(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return `/api/products?${searchParams.toString()}`;
}

export async function getCatalogProducts(params, surface) {
  return apiJson(productsUrl(params), {
    headers: surface ? getRecommendationRequestHeaders(surface) : {},
  });
}

export async function getBestSellerProducts(limit = 8) {
  let json = await getCatalogProducts({ collection: "best-sellers", limit }, "best_sellers");

  if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
    json = await getCatalogProducts({ sortBy: "rating", limit }, "best_sellers");
  }

  return json;
}

export async function getNewArrivalProducts(limit = 8) {
  let json = await getCatalogProducts(
    { collection: "new-arrivals", sortBy: "reviewed_at", limit },
    "new_arrivals"
  );

  if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
    json = await getCatalogProducts({ sortBy: "reviewed_at", limit }, "new_arrivals");
  }

  return json;
}

export function getRecommendedProducts(limit = 10) {
  return getCatalogProducts({ limit, sortBy: "smart" }, "recommended_home");
}

export function getExploreProducts(limit = 12) {
  return getCatalogProducts({ limit }, "home_explore");
}

export function getPromotionalDeals(limit = 3) {
  return getCatalogProducts({ hasDiscount: true, limit }, "promo_banners");
}

export function getProductsByIds(ids, limit = 10) {
  return getCatalogProducts({ ids: ids.join(","), limit }, "recently_viewed");
}

export function getWishlistProducts(ids, limit = 100) {
  return getCatalogProducts(
    { ids: ids.join(","), limit, includeOutOfStock: true },
    "profile_wishlist"
  );
}

export function getRelatedProducts({ categorySlug, storeId, limit = 10 }) {
  return getCatalogProducts(
    {
      limit,
      category: categorySlug,
      storeId,
    },
    "related_products"
  );
}

export function getBrowseProducts(params) {
  return getCatalogProducts(params, "browse_grid");
}

export function getStoreProducts(storeId, page = 1, limit = 20) {
  return getCatalogProducts({ storeId, page, limit }, "store_page");
}
