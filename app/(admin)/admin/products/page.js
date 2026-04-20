'use client';

import { useEffect, useState } from 'react';

const STATUS_OPTIONS = ['', 'pending_review', 'approved', 'rejected', 'draft', 'archived'];

export default function AdminProductsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.set('moderationStatus', statusFilter);
      const res = await fetch(`/api/admin/products?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load products');
      setRows(json.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const review = async (productId, decision) => {
    let rejectionReason = '';
    if (decision === 'reject') {
      rejectionReason = window.prompt('Please provide rejection reason');
      if (!rejectionReason || !rejectionReason.trim()) return;
    }

    try {
      setReviewingId(productId);
      setError('');
      setNotice('');
      const res = await fetch('/api/admin/products/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          decision,
          ...(decision === 'reject' ? { rejection_reason: rejectionReason.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to review product');

      setNotice(decision === 'approve' ? 'Product approved successfully.' : 'Product rejected successfully.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to review product');
    } finally {
      setReviewingId(null);
    }
  };

  const outOfStock = rows.filter((p) => Number(p.stock_quantity) <= 0).length;
  const lowStock = rows.filter((p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Catalog Health & Moderation</h2>
        <p className="text-sm text-gray-500">Approve/reject submissions and track inventory quality risks.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Total products: <strong>{rows.length}</strong></div>
          <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Pending review: <strong>{rows.filter((p) => p.moderation_status === 'pending_review').length}</strong></div>
          <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Out of stock: <strong>{outOfStock}</strong></div>
          <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Low stock (≤5): <strong>{lowStock}</strong></div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900">Review Queue</h3>
          <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((status) => (
              <option key={status || 'all'} value={status}>{status || 'all'}</option>
            ))}
          </select>
        </div>

        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}

        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Store</th>
                  <th className="py-2 pr-3">Moderation</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">/{product.slug}</div>
                      {product.rejection_reason ? <div className="text-xs text-red-700">Reason: {product.rejection_reason}</div> : null}
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{product.store?.name || 'Unassigned'}</td>
                    <td className="py-2 pr-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 capitalize">{product.moderation_status || 'approved'}</span>
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{product.stock_quantity}</td>
                    <td className="py-2 pr-3 text-gray-900">₦{Number(product.discount_price ?? product.price ?? 0).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      {product.moderation_status === 'pending_review' ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={reviewingId === product.id}
                            onClick={() => review(product.id, 'approve')}
                            className="rounded-lg border border-green-300 px-2 py-1 text-xs font-semibold text-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === product.id}
                            onClick={() => review(product.id, 'reject')}
                            className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">No products found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
