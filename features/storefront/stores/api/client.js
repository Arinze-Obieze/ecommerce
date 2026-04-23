"use client";

import { apiJson } from '@/features/shared/api/http';

export function getStores({ page = 1, limit = 12, sort = 'top' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  return apiJson(`/api/stores?${params.toString()}`);
}
