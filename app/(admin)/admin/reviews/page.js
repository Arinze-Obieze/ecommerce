'use client';

import { useEffect, useState } from 'react';

const STATUS_TABS = [
  { value: 'flagged',  label: 'Flagged' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function StarBar({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, verticalAlign: 'middle' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: 12, color: s <= rating ? '#d97706' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleString(); } catch { return value; }
}

export default function AdminReviewsPage() {
  const [statusTab, setStatusTab]   = useState('flagged');
  const [rows, setRows]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [notice, setNotice]         = useState('');
  const [actionId, setActionId]     = useState(null);

  const LIMIT = 30;

  const load = async (tab = statusTab, pg = page) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ status: tab, page: pg, limit: LIMIT });
      const res  = await fetch(`/api/admin/reviews?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load reviews');
      setRows(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(statusTab, page);
  }, [statusTab, page]);

  const switchTab = (tab) => {
    setStatusTab(tab);
    setPage(1);
  };

  const moderate = async (reviewId, decision) => {
    let moderationNote = null;
    if (decision === 'reject') {
      moderationNote = window.prompt('Optional: add a moderation note (not shown to buyer)');
      if (moderationNote === null) return; // cancelled
    }

    try {
      setActionId(reviewId);
      setError('');
      setNotice('');
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          decision,
          ...(moderationNote ? { moderation_note: moderationNote.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      setNotice(decision === 'approve' ? 'Review approved and now visible.' : 'Review rejected and hidden.');
      await load(statusTab, page);
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Flagged reviews are hidden from buyers until approved or rejected.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => switchTab(tab.value)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              statusTab === tab.value
                ? 'border-[#2E6417] text-[#2E6417]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {tab.value === 'flagged' && total > 0 && statusTab === 'flagged' && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {total > 99 ? '99+' : total}
              </span>
            )}
          </button>
        ))}
      </div>

      {error  && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm font-medium">No {statusTab} reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const product    = Array.isArray(row.products) ? row.products[0] : row.products;
            const reviewer   = row.user;
            const isActing   = actionId === row.id;

            return (
              <div
                key={row.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StarBar rating={row.rating} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        row.status === 'flagged'
                          ? 'bg-amber-100 text-amber-700'
                          : row.status === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {row.status}
                      </span>
                      {row.is_verified_purchase && (
                        <span className="text-xs font-semibold bg-[#EDF5E6] text-[#2E6417] px-2 py-0.5 rounded-full">
                          ✓ Verified purchase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(row.created_at)}</p>
                  </div>

                  {/* Actions */}
                  {row.status === 'flagged' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => moderate(row.id, 'approve')}
                        className="rounded-lg bg-[#2E6417] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#245213] disabled:opacity-60 transition-colors"
                      >
                        {isActing ? '…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => moderate(row.id, 'reject')}
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 transition-colors"
                      >
                        {isActing ? '…' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Review body */}
                <p className="text-sm text-gray-700 leading-relaxed">{row.comment}</p>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1 border-t border-gray-100">
                  {product && (
                    <span>
                      Product:{' '}
                      <a
                        href={`/products/${product.slug || product.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-gray-700 hover:underline"
                      >
                        {product.name || product.id}
                      </a>
                    </span>
                  )}
                  {reviewer && (
                    <span>
                      By: <span className="font-semibold text-gray-700">{reviewer.full_name || reviewer.email || row.user_id}</span>
                    </span>
                  )}
                  {row.moderation_note && (
                    <span>
                      Signals: <span className="font-semibold text-amber-700">{row.moderation_note}</span>
                    </span>
                  )}
                  {row.moderated_at && (
                    <span>Moderated: {formatDate(row.moderated_at)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">{total} total · page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
