'use client';

import { useMemo, useState } from 'react';
import { getRecommendationRequestHeaders } from '@/utils/recommendationRequest';

function toCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function AdminRankingDebugPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [storeId, setStoreId] = useState('');
  const [limit, setLimit] = useState('12');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const requestPreview = useMemo(() => {
    const params = new URLSearchParams({
      sortBy: 'smart',
      debug: 'true',
      limit: String(limit || 12),
    });
    if (query.trim()) params.set('search', query.trim());
    if (category.trim()) params.set('category', category.trim());
    if (storeId.trim()) params.set('storeId', storeId.trim());
    return `/api/products?${params.toString()}`;
  }, [category, limit, query, storeId]);

  const runDebug = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await fetch(requestPreview, {
        headers: getRecommendationRequestHeaders('admin_ranking_debug'),
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to inspect ranking');
      setResult(json);
    } catch (err) {
      setError(err.message || 'Failed to inspect ranking');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Ranking Debug</h1>
        <p className="mt-1 text-sm text-gray-600">
          Inspect smart ranking results for a specific query, category, or store and review the score breakdowns that shape the final order.
        </p>
      </div>

      <form onSubmit={runDebug} className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Query</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="black sneakers"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Category Slug</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="shoes"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Store ID</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="Optional store UUID"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Limit</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={limit}
              onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
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
            className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60"
          >
            {loading ? 'Inspecting...' : 'Inspect Ranking'}
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('');
              setStoreId('');
              setLimit('12');
              setResult(null);
              setError('');
            }}
            className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45]"
          >
            Reset
          </button>
        </div>

        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      </form>

      {result?.meta ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Strategy</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.scoring?.strategy || '-'}</p>
            <p className="mt-3 text-xs uppercase text-gray-500">Persona</p>
            <p className="mt-1 text-sm font-semibold capitalize text-gray-900">{result.meta.scoring?.persona || '-'}</p>
            <p className="mt-3 text-xs uppercase text-gray-500">Surface</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.scoring?.surface || '-'}</p>
          </div>

          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Metrics Source</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.scoring?.metricsSource || 'raw_events'}</p>
            <p className="mt-3 text-xs uppercase text-gray-500">Metrics Refreshed</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.scoring?.metricsRefreshedAt || 'n/a'}</p>
            <p className="mt-3 text-xs uppercase text-gray-500">Candidate Count</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.scoring?.candidateCount || 0}</p>
          </div>

          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Personalization Used</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.scoring?.usedPersonalization ? 'Yes' : 'No'}</p>
            <p className="mt-3 text-xs uppercase text-gray-500">Actor History Events</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.scoring?.actorHistoryEvents || 0}</p>
            <p className="mt-3 text-xs uppercase text-gray-500">Total Matches</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{result.meta.pagination?.totalItems || 0}</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
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
              {(result?.data || []).map((product, index) => (
                <tr key={product.id} className="border-b border-gray-50 align-top">
                  <td className="py-3 pr-3 font-semibold text-gray-500">{index + 1}</td>
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.categories?.[0]?.name || 'Uncategorized'}</div>
                  </td>
                  <td className="py-3 pr-3 text-gray-700">{product.store?.name || '-'}</td>
                  <td className="py-3 pr-3 text-gray-700">{toCurrency(product.discount_price || product.price)}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-gray-900">
                    {typeof product.score === 'number' ? product.score.toFixed(4) : '-'}
                  </td>
                  <td className="py-3 pr-3">
                    {product.score_breakdown ? (
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Relevance: <strong>{product.score_breakdown.relevance?.toFixed?.(3) ?? '-'}</strong></div>
                        <div>Conversion: <strong>{product.score_breakdown.conversion?.toFixed?.(3) ?? '-'}</strong></div>
                        <div>Popularity: <strong>{product.score_breakdown.popularity?.toFixed?.(3) ?? '-'}</strong></div>
                        <div>Quality: <strong>{product.score_breakdown.quality?.toFixed?.(3) ?? '-'}</strong></div>
                        <div>Trust: <strong>{product.score_breakdown.sellerTrust?.toFixed?.(3) ?? '-'}</strong></div>
                        <div>Freshness: <strong>{product.score_breakdown.freshness?.toFixed?.(3) ?? '-'}</strong></div>
                        <div>Personalization: <strong>{product.score_breakdown.personalization?.toFixed?.(3) ?? '-'}</strong></div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No debug data returned.</span>
                    )}
                  </td>
                </tr>
              ))}
              {(result?.data || []).length === 0 ? (
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
    </div>
  );
}
