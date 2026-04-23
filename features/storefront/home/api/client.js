"use client";

import { apiJson } from "@/features/shared/api/http";

export function getHeroBanner() {
  return apiJson("/api/hero-banner");
}

export function getTopStores(limit = 8) {
  return apiJson(`/api/stores/top?limit=${limit}`);
}
