'use client';

import { useEffect, useState } from 'react';

export const STORE_ANALYTICS_RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'Since opening' },
];

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function shortDay(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export default function useStoreAnalytics() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({ range });
        const response = await fetch(`/api/store/analytics/overview?${params.toString()}`, { cache: 'no-store' });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Failed to load analytics');
        setData(json.data || null);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [range]);

  return {
    data,
    range,
    setRange,
    loading,
    error,
  };
}
