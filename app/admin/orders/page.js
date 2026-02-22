'use client';

import { useEffect, useState } from 'react';

const DEFAULT_FILTERS = {
  range: '90d',
  status: '',
  minItems: '',
  maxItems: '',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async (nextPage = meta.page, nextLimit = meta.limit, nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('limit', String(nextLimit));
      params.set('range', nextFilters.range);
      if (nextFilters.status) params.set('status', nextFilters.status);
      if (nextFilters.minItems !== '') params.set('minItems', String(nextFilters.minItems));
      if (nextFilters.maxItems !== '') params.set('maxItems', String(nextFilters.maxItems));

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load orders');

      setOrders(json.data || []);
      setMeta(
        json.meta || {
          page: nextPage,
          limit: nextLimit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1, 25, DEFAULT_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilters = () => {
    loadOrders(1, meta.limit, filters);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Order Operations</h2>
        <p className="text-sm text-gray-500">Monitor payment states, pending backlog, and order flow quality.</p>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-5">
          <select
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={filters.range}
            onChange={(e) => setFilters((prev) => ({ ...prev, range: e.target.value }))}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <select
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="number"
            min="0"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Min items"
            value={filters.minItems}
            onChange={(e) => setFilters((prev) => ({ ...prev, minItems: e.target.value }))}
          />

          <input
            type="number"
            min="0"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Max items"
            value={filters.maxItems}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxItems: e.target.value }))}
          />

          <button
            type="button"
            onClick={onApplyFilters}
            className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45]"
          >
            Apply Filters
          </button>
        </div>

        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <p className="py-4 text-sm text-gray-500">Loading orders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Items</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Payment ref</th>
                  <th className="py-2 pr-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs text-gray-700">{order.id.slice(0, 8)}</td>
                    <td className="py-2 pr-3 capitalize font-semibold text-gray-800">{order.status}</td>
                    <td className="py-2 pr-3 text-gray-700">{order.items_count || 0}</td>
                    <td className="py-2 pr-3 text-gray-900">₦{Number(order.total_amount || 0).toLocaleString()}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-gray-600">{order.payment_reference || '-'}</td>
                    <td className="py-2 pr-3 text-gray-600">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">No orders found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {!loading ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-600">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} orders)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                value={meta.limit}
                onChange={(e) => {
                  const nextLimit = Number(e.target.value);
                  loadOrders(1, nextLimit, filters);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <button
                type="button"
                disabled={!meta.hasPreviousPage}
                onClick={() => loadOrders(meta.page - 1, meta.limit, filters)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() => loadOrders(meta.page + 1, meta.limit, filters)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
