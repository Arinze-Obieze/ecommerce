'use client';

import { useEffect, useState } from 'react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const MODERATION_COLORS = ['#2E5C45', '#0ea5e9', '#ef4444', '#f59e0b'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function shortDay(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export default function StoreAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/store/analytics/overview', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
        setData(json.data || null);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 text-sm text-gray-500">Loading analytics...</div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;

  const orders = data?.orders || {};
  const cartDemand = data?.cartDemand || {};
  const products = data?.products || {};
  const trends = data?.trends || {};
  const dailyRevenue = trends.dailyOrdersAndRevenue14d || [];
  const dailyCart = trends.dailyCartNetUnits7d || [];
  const topDemandProducts = trends.topDemandProducts7d || [];

  const moderationPie = [
    { name: 'Pending', value: products.pendingReview || 0 },
    { name: 'Approved', value: products.active || 0 },
    { name: 'Rejected', value: products.rejected || 0 },
    { name: 'Out of Stock', value: products.outOfStock || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Analytics</h2>
        <p className="text-sm text-gray-500">Live metrics captured from orders, escrow, and cart interactions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Total Orders</p><p className="mt-2 text-2xl font-bold">{orders.totalOrders || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Paid Orders</p><p className="mt-2 text-2xl font-bold">{orders.paidOrders || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Gross Sales</p><p className="mt-2 text-2xl font-bold">{formatCurrency(orders.grossSales || 0)}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Products in Carts (7d)</p><p className="mt-2 text-2xl font-bold">{cartDemand.productsInCarts7d || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Events Captured (7d)</p><p className="mt-2 text-2xl font-bold">{cartDemand.eventsCaptured7d || 0}</p></div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-bold text-gray-900">Revenue & Orders (14 days)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => (name === 'revenue' ? formatCurrency(value) : value)}
                  labelFormatter={(label) => shortDay(label)}
                />
                <Bar yAxisId="left" dataKey="orders" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2E5C45" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Catalog Moderation Mix</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={moderationPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88}>
                  {moderationPie.map((entry, idx) => (
                    <Cell key={entry.name} fill={MODERATION_COLORS[idx % MODERATION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {moderationPie.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODERATION_COLORS[idx % MODERATION_COLORS.length] }} />
                {entry.name}: <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-bold text-gray-900">Net Cart Units Trend (7 days)</h3>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(label) => shortDay(label)} />
                <Bar dataKey="netUnits" fill="#2E5C45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Top Demand Products (7 days)</h3>
          <div className="mt-3 space-y-2">
            {topDemandProducts.slice(0, 6).map((row) => (
              <div key={row.productId} className="rounded-xl bg-gray-50 px-3 py-2 text-sm">
                <p className="truncate font-semibold text-gray-900">{row.productName}</p>
                <p className="text-xs text-gray-600">{row.units} add-to-cart units</p>
              </div>
            ))}
            {topDemandProducts.length === 0 ? <p className="text-sm text-gray-500">No cart demand captured yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
