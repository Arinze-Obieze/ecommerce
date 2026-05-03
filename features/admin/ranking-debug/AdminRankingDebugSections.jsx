'use client';

import {
  formatRankingCurrency,
  getRankingBreakdownRows,
} from '@/features/admin/ranking-debug/adminRankingDebug.utils';

export function AdminRankingDebugIntro() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">Ranking Debug</h1>
      <p className="mt-1 text-sm text-gray-600">
        Inspect smart ranking results for a specific query, category, or store and review the score breakdowns that shape the final order.
      </p>
    </div>
  );
}

export function AdminRankingDebugForm({
  filters,
  requestPreview,
  loading,
  error,
  onUpdateFilter,
  onReset,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Query</span>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={filters.query}
            onChange={(event) => onUpdateFilter('query', event.target.value)}
            placeholder="black sneakers"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Category Slug</span>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={filters.category}
            onChange={(event) => onUpdateFilter('category', event.target.value)}
            placeholder="shoes"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Store ID</span>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={filters.storeId}
            onChange={(event) => onUpdateFilter('storeId', event.target.value)}
            placeholder="Optional store UUID"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Limit</span>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={filters.limit}
            onChange={(event) => onUpdateFilter('limit', event.target.value)}
            placeholder="12"
          />
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-[#f8fbf9] px-4 py-3 text-xs text-gray-600">
        <strong className="text-gray-900">Request Preview:</strong> {requestPreview}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? 'Inspecting...' : 'Inspect Ranking'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary"
        >
          Reset
        </button>
      </div>

      {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
    </form>
  );
}

export function AdminRankingDebugMeta({ result }) {
  if (!result?.meta) return null;

  const cards = [
    [
      ['Strategy', result.meta.scoring?.strategy || '-'],
      ['Persona', result.meta.scoring?.persona || '-'],
      ['Surface', result.meta.scoring?.surface || '-'],
    ],
    [
      ['Metrics Source', result.meta.scoring?.metricsSource || 'raw_events'],
      ['Metrics Refreshed', result.meta.scoring?.metricsRefreshedAt || 'n/a'],
      ['Candidate Count', result.meta.scoring?.candidateCount || 0],
    ],
    [
      ['Personalization Used', result.meta.scoring?.usedPersonalization ? 'Yes' : 'No'],
      ['Actor History Events', result.meta.scoring?.actorHistoryEvents || 0],
      ['Total Matches', result.meta.pagination?.totalItems || 0],
    ],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {cards.map((group, index) => (
        <div key={index} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          {group.map(([label, value]) => (
            <div key={label} className={label === group[0][0] ? '' : 'mt-3'}>
              <p className="text-xs uppercase text-gray-500">{label}</p>
              <p className="mt-1 text-sm font-semibold capitalize text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminRankingDebugResults({ result }) {
  const rows = result?.data || [];

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Ranked Products</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">Store</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Score</th>
              <th className="py-2 pr-3">Key Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product, index) => (
              <tr key={product.id} className="border-b border-gray-50 align-top">
                <td className="py-3 pr-3 font-semibold text-gray-500">{index + 1}</td>
                <td className="py-3 pr-3">
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.categories?.[0]?.name || 'Uncategorized'}</div>
                </td>
                <td className="py-3 pr-3 text-gray-700">{product.store?.name || '-'}</td>
                <td className="py-3 pr-3 text-gray-700">{formatRankingCurrency(product.discount_price || product.price)}</td>
                <td className="py-3 pr-3 font-mono text-xs text-gray-900">
                  {typeof product.score === 'number' ? product.score.toFixed(4) : '-'}
                </td>
                <td className="py-3 pr-3">
                  {product.score_breakdown ? (
                    <div className="space-y-1 text-xs text-gray-600">
                      {getRankingBreakdownRows(product.score_breakdown).map(([label, value]) => (
                        <div key={label}>
                          {label}: <strong>{value?.toFixed?.(3) ?? '-'}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">No debug data returned.</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  Run a ranking inspection to see scored results.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
