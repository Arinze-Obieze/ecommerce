'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { money } from '@/features/admin/escrow/adminEscrow.utils';

export default function useAdminEscrow() {
  const [tab, setTab] = useState('ready');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [busyKey, setBusyKey] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ status: tab });
      const response = await fetch(`/api/admin/escrow/releases?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load escrow data');
      setRows(Array.isArray(json.data?.rows) ? json.data.rows : []);
      setSummary(json.data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load escrow data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = useMemo(
    () => [
      { label: 'Total Escrow Held', value: money(summary?.totalEscrowHeld) },
      { label: 'Ready For Release', value: money(summary?.readyForRelease) },
      { label: 'Queued', value: money(summary?.queuedAmount) },
      { label: 'Processing', value: money(summary?.processingAmount) },
      { label: 'Paid', value: money(summary?.paidAmount) },
      { label: 'Failed', value: money(summary?.failedAmount) },
      { label: 'Blocked Sellers', value: Number(summary?.sellersBlocked || 0).toLocaleString() },
      { label: 'Rows In View', value: rows.length.toLocaleString() },
    ],
    [rows.length, summary]
  );

  const release = async (row, releaseNow) => {
    const key = `${row.order_id}:${row.store_id}:${releaseNow ? 'now' : 'queue'}`;
    try {
      setBusyKey(key);
      setError('');
      const response = await fetch('/api/admin/escrow/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: row.order_id,
          store_id: row.store_id,
          release_now: Boolean(releaseNow),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Release action failed');
      await load();
    } catch (err) {
      setError(err.message || 'Release action failed');
    } finally {
      setBusyKey('');
    }
  };

  return {
    tab,
    setTab,
    loading,
    error,
    rows,
    cards,
    busyKey,
    release,
  };
}
