'use client';

import { useEffect, useState } from 'react';

export default function useAdminLogs() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState({ page: 1, limit: 40, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [level, setLevel] = useState('');
  const [service, setService] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(40);

  const load = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (level) params.set('level', level);
      if (service) params.set('service', service);
      params.set('page', String(nextPage));
      params.set('limit', String(nextLimit));
      const response = await fetch(`/api/admin/logs?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load logs');
      setRows(json.data || []);
      setSummary(json.summary24h || null);
      setMeta(json.meta || { page: nextPage, limit: nextLimit, total: 0, totalPages: 1 });
      setPage(json.meta?.page || nextPage);
      setLimit(json.meta?.limit || nextLimit);
    } catch (err) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1, limit);
  }, []);

  return {
    rows,
    summary,
    meta,
    loading,
    error,
    level,
    setLevel,
    service,
    setService,
    page,
    setPage,
    limit,
    setLimit,
    load,
  };
}
