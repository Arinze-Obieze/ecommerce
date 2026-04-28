'use client';

export function AdminOrdersIntro() {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Order Operations</h2>
      <p className="text-sm text-gray-500">Monitor payment states, pending backlog, and order flow quality.</p>
    </div>
  );
}

export function AdminOrdersFilters({ filters, setFilters, onApply }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-5">
      <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={filters.range} onChange={(e) => setFilters((prev) => ({ ...prev, range: e.target.value }))}>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>

      <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
        <option value="">All status</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input type="number" min="0" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Min items" value={filters.minItems} onChange={(e) => setFilters((prev) => ({ ...prev, minItems: e.target.value }))} />
      <input type="number" min="0" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Max items" value={filters.maxItems} onChange={(e) => setFilters((prev) => ({ ...prev, maxItems: e.target.value }))} />
      <button type="button" onClick={onApply} className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary">Apply Filters</button>
    </div>
  );
}

export function AdminOrdersTable({ error, loading, orders }) {
  return (
    <>
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
                  <td className="py-2 pr-3 font-semibold capitalize text-gray-800">{order.status}</td>
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
    </>
  );
}

export function AdminOrdersPagination({ loading, meta, filters, onLoad }) {
  if (loading) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-600">Showing page {meta.page} of {meta.totalPages} ({meta.total} orders)</p>
      <div className="flex flex-wrap items-center gap-2">
        <select className="rounded-lg border border-gray-200 px-2 py-1 text-sm" value={meta.limit} onChange={(e) => onLoad(1, Number(e.target.value), filters)}>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <button type="button" disabled={!meta.hasPreviousPage} onClick={() => onLoad(meta.page - 1, meta.limit, filters)} className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
          Previous
        </button>
        <button type="button" disabled={!meta.hasNextPage} onClick={() => onLoad(meta.page + 1, meta.limit, filters)} className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
}
