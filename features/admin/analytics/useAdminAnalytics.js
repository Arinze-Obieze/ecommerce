'use client';

import { useEffect, useMemo, useState } from 'react';

export default function useAdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Failed to load analytics');
        if (active) setData(json.data);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load analytics');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const currency = useMemo(
    () => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }),
    []
  );

  return { data, loading, error, currency };
}
