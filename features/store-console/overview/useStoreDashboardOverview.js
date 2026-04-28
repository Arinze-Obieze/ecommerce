'use client';

import { useCallback, useEffect, useState } from 'react';

export default function useStoreDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/store/analytics/overview?range=7d', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load dashboard overview');
      setData(json.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  return {
    loading,
    error,
    data,
    loadOverview,
  };
}
