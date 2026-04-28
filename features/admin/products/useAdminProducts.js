'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export default function useAdminProducts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.set('moderationStatus', statusFilter);
      const response = await fetch(`/api/admin/products?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load products');
      setRows(json.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const review = useCallback(async (productId, decision) => {
    let rejectionReason = '';

    if (decision === 'reject') {
      rejectionReason = window.prompt('Please provide rejection reason');
      if (!rejectionReason || !rejectionReason.trim()) return;
    }

    try {
      setReviewingId(productId);
      setError('');
      setNotice('');

      const response = await fetch('/api/admin/products/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          decision,
          ...(decision === 'reject' ? { rejection_reason: rejectionReason.trim() } : {}),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to review product');

      setNotice(decision === 'approve' ? 'Product approved successfully.' : 'Product rejected successfully.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to review product');
    } finally {
      setReviewingId(null);
    }
  }, [load]);

  const pendingCount = useMemo(
    () => rows.filter((product) => product.moderation_status === 'pending_review').length,
    [rows]
  );

  return {
    rows,
    loading,
    error,
    notice,
    statusFilter,
    setStatusFilter,
    reviewingId,
    load,
    review,
    pendingCount,
  };
}
