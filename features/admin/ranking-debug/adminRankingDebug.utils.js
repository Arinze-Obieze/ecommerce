export const ADMIN_RANKING_DEBUG_DEFAULTS = {
  query: '',
  category: '',
  storeId: '',
  limit: '12',
};

export function formatRankingCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function sanitizeRankingLimit(value) {
  return String(value || '').replace(/[^\d]/g, '').slice(0, 3) || ADMIN_RANKING_DEBUG_DEFAULTS.limit;
}

export function buildRankingRequestPreview(filters) {
  const params = new URLSearchParams({
    sortBy: 'smart',
    debug: 'true',
    limit: String(filters.limit || ADMIN_RANKING_DEBUG_DEFAULTS.limit),
  });

  if (filters.query.trim()) params.set('search', filters.query.trim());
  if (filters.category.trim()) params.set('category', filters.category.trim());
  if (filters.storeId.trim()) params.set('storeId', filters.storeId.trim());

  return `/api/products?${params.toString()}`;
}

export function getRankingBreakdownRows(scoreBreakdown) {
  return [
    ['Relevance', scoreBreakdown?.relevance],
    ['Conversion', scoreBreakdown?.conversion],
    ['Popularity', scoreBreakdown?.popularity],
    ['Quality', scoreBreakdown?.quality],
    ['Trust', scoreBreakdown?.sellerTrust],
    ['Freshness', scoreBreakdown?.freshness],
    ['Personalization', scoreBreakdown?.personalization],
  ];
}
