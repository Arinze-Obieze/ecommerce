'use client';

import { useEffect, useState } from 'react';

export const DEFAULT_ADMIN_ORDER_FILTERS = {
  range: '90d',
  status: '',
  minItems: '',
  maxItems: '',
};

export default function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState(DEFAULT_ADMIN_ORDER_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async (nextPage = meta.page, nextLimit = meta.limit, nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('limit', String(nextLimit));
      params.set('range', nextFilters.range);
      if (nextFilters.status) params.set('status', nextFilters.status);
      if (nextFilters.minItems !== '') params.set('minItems', String(nextFilters.minItems));
      if (nextFilters.maxItems !== '') params.set('maxItems', String(nextFilters.maxItems));

      const response = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load orders');

      setOrders(json.data || []);
      setMeta(json.meta || {
        page: nextPage,
        limit: nextLimit,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders(1, 25, DEFAULT_ADMIN_ORDER_FILTERS);
  }, []);

  return {
    orders,
    meta,
    filters,
    setFilters,
    loading,
    error,
    loadOrders,
  };
}
