'use client';

import { useMemo, useState } from 'react';
import { getRecommendationRequestHeaders } from '@/utils/catalog/recommendation-request';
import {
  ADMIN_RANKING_DEBUG_DEFAULTS,
  buildRankingRequestPreview,
  sanitizeRankingLimit,
} from '@/features/admin/ranking-debug/adminRankingDebug.utils';

export default function useAdminRankingDebug() {
  const [filters, setFilters] = useState(ADMIN_RANKING_DEBUG_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const requestPreview = useMemo(() => buildRankingRequestPreview(filters), [filters]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: field === 'limit' ? sanitizeRankingLimit(value) : value,
    }));
  };

  const reset = () => {
    setFilters(ADMIN_RANKING_DEBUG_DEFAULTS);
    setResult(null);
    setError('');
  };

  const runDebug = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await fetch(requestPreview, {
        headers: getRecommendationRequestHeaders('admin_ranking_debug'),
        cache: 'no-store',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to inspect ranking');
      setResult(json);
    } catch (err) {
      setError(err.message || 'Failed to inspect ranking');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    filters,
    loading,
    error,
    result,
    requestPreview,
    updateFilter,
    reset,
    runDebug,
  };
}
