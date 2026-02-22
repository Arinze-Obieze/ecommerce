'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/overview', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load admin overview');
        if (active) setPayload(json.data);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load admin overview');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const currency = useMemo(
    () => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }),
    []
  );

  if (loading) {
    return <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 text-gray-600">Loading overview...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  }

  const { kpis, stores, inventory, operations, topStores, trends } = payload;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paid GMV (30d)" value={currency.format(kpis.gmvPaid)} hint={`AOV: ${currency.format(kpis.aovPaid)}`} />
        <StatCard label="Orders (30d)" value={kpis.totalOrders} hint={`${kpis.paidOrders} paid • ${kpis.pendingOrders} pending`} />
        <StatCard label="Conversion Proxy" value={`${kpis.conversionProxy}%`} hint={`Cancelled: ${kpis.refundOrCancelRate}%`} />
        <StatCard label="Payment Failure Rate" value={`${operations.paymentFailureRate}%`} hint={`${operations.reliabilityErrors24h} critical errors/24h`} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">14-Day Revenue Trend</h2>
            <span className="text-xs font-semibold text-gray-500">Completed orders only</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2E5C45" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-gray-500">Latest: {currency.format(trends[trends.length - 1]?.revenue || 0)}</div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Risk Signals</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[#f3f8f5] px-3 py-2">
              <span className="text-gray-700">Stuck pending orders</span>
              <span className="font-bold text-[#2E5C45]">{operations.stuckPending}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#f3f8f5] px-3 py-2">
              <span className="text-gray-700">Suspicious IPs (24h)</span>
              <span className="font-bold text-[#2E5C45]">{operations.suspiciousIpCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#f3f8f5] px-3 py-2">
              <span className="text-gray-700">API p95 latency</span>
              <span className="font-bold text-[#2E5C45]">{operations.p95LatencyMs} ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-bold text-gray-900">Store Health</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Active</span><strong>{stores.active}</strong></p>
            <p className="flex justify-between"><span>Pending</span><strong>{stores.pending}</strong></p>
            <p className="flex justify-between"><span>Suspended</span><strong>{stores.suspended}</strong></p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-bold text-gray-900">Inventory Health</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Out of stock</span><strong>{inventory.outOfStock}</strong></p>
            <p className="flex justify-between"><span>Low stock (≤5)</span><strong>{inventory.lowStock}</strong></p>
            <p className="flex justify-between"><span>Stock-at-risk GMV</span><strong>{currency.format(inventory.stockAtRiskGmv)}</strong></p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-bold text-gray-900">Error Trend</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Top Stores (30d)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Store</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Orders</th>
                <th className="py-2 pr-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topStores.map((store) => (
                <tr key={store.id} className="border-b border-gray-50">
                  <td className="py-2 pr-3 font-semibold text-gray-900">{store.name}</td>
                  <td className="py-2 pr-3 capitalize text-gray-600">{store.status}</td>
                  <td className="py-2 pr-3 text-gray-700">{store.orders}</td>
                  <td className="py-2 pr-3 text-gray-900">{currency.format(store.revenue)}</td>
                </tr>
              ))}
              {topStores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">No completed store revenue yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
