'use client';

import { useEffect, useState } from 'react';

export default function AdminLogsPage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState({ page: 1, limit: 40, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [level, setLevel] = useState('');
  const [service, setService] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(40);

  const load = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (level) params.set('level', level);
      if (service) params.set('service', service);
      params.set('page', String(nextPage));
      params.set('limit', String(nextLimit));
      const res = await fetch(`/api/admin/logs?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load logs');
      setRows(json.data || []);
      setSummary(json.summary24h || null);
      setMeta(json.meta || { page: nextPage, limit: nextLimit, total: 0, totalPages: 1 });
      setPage(json.meta?.page || nextPage);
      setLimit(json.meta?.limit || nextLimit);
    } catch (err) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-gray-900">System Logs Explorer</h2>
          <div className="flex gap-2">
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="service (api, payment-service...)" value={service} onChange={(e) => setService(e.target.value)} />
            <button
              onClick={() => {
                setPage(1);
                load(1, limit);
              }}
              className="rounded-xl border border-[#2E6417] px-3 py-2 text-sm font-semibold text-[#2E6417]"
            >
              Apply
            </button>
          </div>
        </div>

        {error ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {summary ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Errors (24h): <strong>{summary.errors}</strong></div>
            <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Warnings (24h): <strong>{summary.warnings}</strong></div>
            <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Payment failures: <strong>{summary.paymentFailures}</strong></div>
            <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">Rate-limit hits: <strong>{summary.rateLimitHits}</strong></div>
            <div className="rounded-xl bg-[#EDF5E6] px-3 py-2 text-sm">API p95: <strong>{summary.apiP95LatencyMs} ms</strong></div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Loading logs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Service</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 text-gray-600">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3 font-semibold">{row.level}</td>
                    <td className="py-2 pr-3">{row.service}</td>
                    <td className="py-2 pr-3">{row.action}</td>
                    <td className="py-2 pr-3 capitalize">{row.status}</td>
                    <td className="py-2 pr-3 text-gray-700">{row.message}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">No log rows for current filter.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {!loading ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-600">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} logs)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                value={limit}
                onChange={(e) => {
                  const nextLimit = Number(e.target.value);
                  setLimit(nextLimit);
                  setPage(1);
                  load(1, nextLimit);
                }}
              >
                <option value={20}>20 / page</option>
                <option value={40}>40 / page</option>
                <option value={80}>80 / page</option>
              </select>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  const nextPage = Math.max(1, page - 1);
                  setPage(nextPage);
                  load(nextPage, limit);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => {
                  const nextPage = Math.min(meta.totalPages, page + 1);
                  setPage(nextPage);
                  load(nextPage, limit);
                }}
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
