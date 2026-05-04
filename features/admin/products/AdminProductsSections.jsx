'use client';

import {
  ADMIN_PRODUCT_STATUS_OPTIONS,
  buildAdminProductMetrics,
  formatAdminProductPrice,
} from '@/features/admin/products/adminProducts.utils';

export function AdminProductsIntro({ rows }) {
  const metrics = buildAdminProductMetrics(rows);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Catalog Health & Moderation</h2>
      <p className="text-sm text-gray-500">Approve/reject submissions and track inventory quality risks.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl bg-primary-soft px-3 py-2 text-sm">
            {metric.label}: <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminProductsTable({
  rows,
  loading,
  error,
  notice,
  statusFilter,
  reviewingId,
  onStatusFilterChange,
  onReview,
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-gray-900">Review Queue</h3>
        <select
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          {ADMIN_PRODUCT_STATUS_OPTIONS.map((status) => (
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
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold capitalize text-gray-700">
                      {product.moderation_status || 'approved'}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-gray-700">{product.stock_quantity}</td>
                  <td className="py-2 pr-3 text-gray-900">
                    {formatAdminProductPrice(product.discount_price ?? product.price ?? 0)}
                  </td>
                  <td className="py-2 pr-3">
                    {product.moderation_status === 'pending_review' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={reviewingId === product.id}
                          onClick={() => onReview(product.id, 'approve')}
                          className="rounded-lg border border-green-300 px-2 py-1 text-xs font-semibold text-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={reviewingId === product.id}
                          onClick={() => onReview(product.id, 'reject')}
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
  );
}
