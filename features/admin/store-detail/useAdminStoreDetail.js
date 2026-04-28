'use client';

import { useCallback, useEffect, useState } from 'react';

export default function useAdminStoreDetail(storeId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/admin/stores/${storeId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load store');
      setData(json.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    loading,
    error,
    data,
    load,
  };
}
