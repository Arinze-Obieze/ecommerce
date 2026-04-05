'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
        if (active) setData(json.data);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load analytics');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const currency = useMemo(
    () => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }),
    []
  );

  if (loading) return <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6">Loading analytics...</div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;

  const { acquisition, funnel, behavior, recommendations, cohorts, commerce, geography, devices, reliability } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">DAU</p><p className="mt-2 text-2xl font-bold">{acquisition.dau}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">WAU</p><p className="mt-2 text-2xl font-bold">{acquisition.wau}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">MAU</p><p className="mt-2 text-2xl font-bold">{acquisition.mau}</p></div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Daily Active Users (30d)</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={acquisition.dauTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="dau" stroke="#2E5C45" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Commerce Funnel</h2>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Product impression</span><strong>{funnel.product_impression}</strong></p>
            <p className="flex justify-between"><span>View item</span><strong>{funnel.view_item}</strong></p>
            <p className="flex justify-between"><span>Add to cart</span><strong>{funnel.add_to_cart}</strong></p>
            <p className="flex justify-between"><span>Begin checkout</span><strong>{funnel.begin_checkout}</strong></p>
            <p className="flex justify-between"><span>Purchase</span><strong>{funnel.purchase}</strong></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Revenue Trend (30d)</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commerce.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {commerce.revenueTrend.map((row) => (
                    <Cell key={row.day} fill="#0f766e" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-gray-500">Latest day revenue: {currency.format(commerce.revenueTrend[commerce.revenueTrend.length - 1]?.revenue || 0)}</p>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Search Behavior</h2>
          <p className="mb-3 text-sm text-gray-600">Zero-result searches: <strong>{behavior.zeroResultSearches}</strong></p>
          <div className="space-y-2 text-sm">
            {behavior.topSearchTerms.map((term) => (
              <div key={term.term} className="flex items-center justify-between rounded-lg bg-[#f3f8f5] px-3 py-2">
                <span>{term.term}</span>
                <strong>{term.count}</strong>
              </div>
            ))}
            {behavior.topSearchTerms.length === 0 ? <p className="text-gray-500">No search events yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Buyer Cohorts</h2>
          <p className="text-sm text-gray-700">New buyers (30d): <strong>{cohorts.newBuyers}</strong></p>
          <p className="text-sm text-gray-700">Returning buyers (30d): <strong>{cohorts.returningBuyers}</strong></p>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Top States</h2>
          <div className="space-y-2 text-sm">
            {geography.ordersByState.map((row) => (
              <div key={row.state} className="flex justify-between rounded-lg bg-[#f3f8f5] px-3 py-2">
                <span>{row.state}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Devices</h2>
          <div className="space-y-2 text-sm">
            {devices.map((row) => (
              <div key={row.device} className="flex justify-between rounded-lg bg-[#f3f8f5] px-3 py-2">
                <span className="capitalize">{row.device}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Recommendation Reach</h2>
          <p className="text-sm text-gray-700">Tracked impressions (30d): <strong>{recommendations.impressions}</strong></p>
          <p className="mt-2 text-xs text-gray-500">This reflects product cards actually seen in recommendation surfaces.</p>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Surface Mix</h2>
          <div className="space-y-2 text-sm">
            {recommendations.recommendationSurfaceMix.map((row) => (
              <div key={row.surface} className="flex justify-between rounded-lg bg-[#f3f8f5] px-3 py-2">
                <span>{row.surface}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
            {recommendations.recommendationSurfaceMix.length === 0 ? <p className="text-gray-500">No recommendation impressions yet.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Persona Mix</h2>
          <div className="space-y-2 text-sm">
            {recommendations.recommendationPersonaMix.map((row) => (
              <div key={row.persona} className="flex justify-between rounded-lg bg-[#f3f8f5] px-3 py-2">
                <span>{row.persona}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
            {recommendations.recommendationPersonaMix.length === 0 ? <p className="text-gray-500">No persona mix data yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Top Exposed Recommended Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Product ID</th>
                <th className="py-2 pr-3">Impressions</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.topExposedProducts.map((row) => (
                <tr key={row.product_id} className="border-b border-gray-50">
                  <td className="py-2 pr-3">{row.product_name}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.product_id}</td>
                  <td className="py-2 pr-3">{row.impressions}</td>
                </tr>
              ))}
              {recommendations.topExposedProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">No recommendation exposure data yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Top Failing Actions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3">Action</th>
                <th className="py-2 pr-3">Failures</th>
              </tr>
            </thead>
            <tbody>
              {reliability.failingActions.map((row) => (
                <tr key={`${row.service}-${row.action}`} className="border-b border-gray-50">
                  <td className="py-2 pr-3">{row.service}</td>
                  <td className="py-2 pr-3">{row.action}</td>
                  <td className="py-2 pr-3">{row.count}</td>
                </tr>
              ))}
              {reliability.failingActions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">No significant failures in window.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
