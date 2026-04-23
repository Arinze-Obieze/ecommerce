'use client';

import { useEffect, useState } from 'react';

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function prettify(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProductReviewsManager({ productId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/store/products/${productId}/reviews`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load reviews');
      setRows(json.data || []);
      setDrafts(
        Object.fromEntries((json.data || []).map((row) => [row.id, {
          seller_reply: row.seller_reply || '',
          status: row.status || 'approved',
        }]))
      );
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    void load();
  }, [productId]);

  const save = async (reviewId) => {
    try {
      setSavingId(reviewId);
      setError('');
      setNotice('');
      const draft = drafts[reviewId] || {};
      const res = await fetch(`/api/store/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update review');
      setNotice('Review reply saved.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update review');
    } finally {
      setSavingId('');
    }
  };

  return (
    <section className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Buyer Reviews</h2>
        <p className="mt-1 text-sm text-gray-500">Reply publicly to buyers and hide reviews that need moderation follow-up.</p>
      </div>

      {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading reviews...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">No buyer reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{row.user?.full_name || row.user?.email || 'Buyer'}</p>
                  <p className="text-xs text-gray-500">{formatDate(row.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#EDF5E6] px-2.5 py-1 text-xs font-semibold text-[#2E6417]">
                    {row.rating}/5
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.is_verified_purchase ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.is_verified_purchase ? 'Verified purchase' : 'Unverified'}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700">{row.comment}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-gray-700">Visibility</span>
                  <select
                    value={drafts[row.id]?.status || 'approved'}
                    onChange={(event) => setDrafts((current) => ({
                      ...current,
                      [row.id]: {
                        ...(current[row.id] || {}),
                        status: event.target.value,
                      },
                    }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    {['approved', 'hidden'].map((status) => (
                      <option key={status} value={status}>{prettify(status)}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-gray-700">Seller reply</span>
                  <textarea
                    value={drafts[row.id]?.seller_reply || ''}
                    onChange={(event) => setDrafts((current) => ({
                      ...current,
                      [row.id]: {
                        ...(current[row.id] || {}),
                        seller_reply: event.target.value,
                      },
                    }))}
                    className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Reply publicly to the buyer"
                  />
                </label>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => save(row.id)}
                  disabled={savingId === row.id}
                  className="rounded-xl bg-[#2E6417] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245213] disabled:opacity-60"
                >
                  {savingId === row.id ? 'Saving...' : 'Save reply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
