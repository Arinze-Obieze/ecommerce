'use client';

import { useEffect, useMemo, useState } from 'react';

export default function StoreInventoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/store/products', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load inventory');
      setRows(json.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const lowStock = useMemo(() => rows.filter((row) => Number(row.stock_quantity || 0) <= 5), [rows]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
        <p className="text-sm text-gray-500">Monitor stock health and replenish fast-moving products.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">All SKUs</p>
          <p className="mt-1 text-2xl font-bold text-[#2E5C45]">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Low Stock (&lt;= 5)</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Out of Stock</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{rows.filter((r) => Number(r.stock_quantity || 0) <= 0).length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <p className="text-sm text-gray-500">Loading inventory...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">SKU</th>
                  <th className="py-2 pr-3">Moderation</th>
                  <th className="py-2 pr-3">Live</th>
                  <th className="py-2 pr-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{row.name}</div>
                      <div className="text-xs text-gray-500">/{row.slug}</div>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-gray-700">{row.sku || '-'}</td>
                    <td className="py-2 pr-3 capitalize">{row.moderation_status}</td>
                    <td className="py-2 pr-3">{row.is_active ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3 font-semibold">{row.stock_quantity}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">No inventory data available.</td>
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
