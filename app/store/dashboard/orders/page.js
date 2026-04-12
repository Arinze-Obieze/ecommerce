'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StoreOrdersPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (page = 1, limit = meta.limit) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await fetch(`/api/store/orders?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load orders');
      setRows(json.data || []);
      setMeta(json.meta || { page, limit, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, 25);
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Orders</h2>
        <p className="text-sm text-gray-500">Track order status, fulfillment progression, and escrow state.</p>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <p className="text-sm text-gray-500">Loading orders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Payment</th>
                  <th className="py-2 pr-3">Fulfillment</th>
                  <th className="py-2 pr-3">Escrow</th>
                  <th className="py-2 pr-3">Items</th>
                  <th className="py-2 pr-3">Store Subtotal</th>
                  <th className="py-2 pr-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs">
                      <Link href={`/store/dashboard/orders/${row.id}`} className="font-semibold text-[#2E5C45] hover:underline">
                        {row.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 capitalize">{row.status}</td>
                    <td className="py-2 pr-3 capitalize">{row.fulfillment_status || 'processing'}</td>
                    <td className="py-2 pr-3 capitalize">{row.escrow_status || 'not_funded'}</td>
                    <td className="py-2 pr-3">{row.items_count || 0}</td>
                    <td className="py-2 pr-3">₦{Number(row.store_subtotal || 0).toLocaleString()}</td>
                    <td className="py-2 pr-3">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">No store orders found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {!loading ? (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-600">
            <p>Page {meta.page} of {meta.totalPages} ({meta.total} orders)</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!meta.hasPreviousPage}
                onClick={() => load(meta.page - 1, meta.limit)}
                className="rounded-lg border border-gray-300 px-3 py-1 font-semibold text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() => load(meta.page + 1, meta.limit)}
                className="rounded-lg border border-gray-300 px-3 py-1 font-semibold text-gray-700 disabled:opacity-50"
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
