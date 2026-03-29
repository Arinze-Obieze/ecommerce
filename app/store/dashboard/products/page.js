// app/store/dashboard/products/page.js
// UPDATED: "Create Product" button now links to the step-based wizard
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = ['all', 'draft', 'pending_review', 'approved', 'rejected', 'archived'];

export default function StoreProductsPage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('moderationStatus', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/store/products?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load products');
      setRows(json.data || []);
      setSummary(json.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const counts = useMemo(() => summary || {}, [summary]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500">Track moderation outcomes and catalog readiness.</p>
          </div>
          {/* ✅ UPDATED: Links to step-based wizard instead of inline form */}
          <Link href="./products/new" className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] transition-colors">
            Create Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ['Total', counts.total || 0],
          ['Draft', counts.draft || 0],
          ['Pending', counts.pending_review || 0],
          ['Approved', counts.approved || 0],
          ['Rejected', counts.rejected || 0],
          ['Archived', counts.archived || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-xs uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#2E5C45]">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-base font-bold text-gray-900">Catalog Queue</h3>
          <div className="flex gap-2">
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="button" onClick={load} className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45]">Apply</button>
          </div>
        </div>

        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Live</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Media</th>
                  <th className="py-2 pr-3">Submitted</th>
                  <th className="py-2 pr-3">Rejection</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{row.name}</div>
                      <div className="text-xs text-gray-500">/{row.slug}</div>
                    </td>
                    <td className="py-2 pr-3 capitalize">{row.moderation_status}</td>
                    <td className="py-2 pr-3">{row.is_active ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">{row.stock_quantity}</td>
                    <td className="py-2 pr-3">{(row.image_urls?.length || 0)} img / {(row.video_urls?.length || 0)} vid</td>
                    <td className="py-2 pr-3">{row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '-'}</td>
                    <td className="py-2 pr-3 text-red-700">{row.rejection_reason || '-'}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">No products found for this filter.</td>
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
