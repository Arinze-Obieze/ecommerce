'use client';

export function AdminLogsHeader({ level, setLevel, service, setService, limit, onApply, error, summary }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
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
          <button onClick={() => onApply(1, limit)} className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary">Apply</button>
        </div>
      </div>

      {error ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      {summary ? (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <SummaryChip label="Errors (24h)" value={summary.errors} />
          <SummaryChip label="Warnings (24h)" value={summary.warnings} />
          <SummaryChip label="Payment failures" value={summary.paymentFailures} />
          <SummaryChip label="Rate-limit hits" value={summary.rateLimitHits} />
          <SummaryChip label="API p95" value={`${summary.apiP95LatencyMs} ms`} />
        </div>
      ) : null}
    </div>
  );
}

export function AdminLogsTable({ loading, rows }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
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
    </div>
  );
}

export function AdminLogsPagination({ loading, meta, page, setPage, limit, setLimit, load }) {
  if (loading) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-600">Showing page {meta.page} of {meta.totalPages} ({meta.total} logs)</p>
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
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="rounded-xl bg-primary-soft px-3 py-2 text-sm">
      {label}: <strong>{value}</strong>
    </div>
  );
}
