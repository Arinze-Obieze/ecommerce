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
import DashboardPageHeader from '@/components/Store/dashboard/DashboardPageHeader';
import AlertBanner from '@/components/Store/dashboard/AlertBanner';

const MODERATION_COLORS = ['#2E5C45', '#0ea5e9', '#ef4444', '#f59e0b'];
const RANGE_OPTIONS = [
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y',  label: '1 year' },
  { value: 'all', label: 'Since opening' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function shortDay(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export default function StoreAnalyticsPage() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({ range });
        const res = await fetch(`/api/store/analytics/overview?${params.toString()}`, { cache: 'no-store' });
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
  }, [range]);

  if (loading) return <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 text-sm text-gray-500">Loading analytics...</div>;

  const RangePicker = (
    <div className="flex flex-wrap gap-2">
      {RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setRange(option.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${range === option.value ? 'bg-[#2E5C45] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const orders = data?.orders || {};
  const cartDemand = data?.cartDemand || {};
  const products = data?.products || {};
  const trends = data?.trends || {};
  const meta = data?.meta || {};
  const activeRangeLabel = meta.range?.label || RANGE_OPTIONS.find((option) => option.value === range)?.label || 'Selected range';
  const dailyRevenue = trends.ordersRevenue || trends.dailyOrdersAndRevenue14d || [];
  const dailyCart = trends.cartNetUnits || trends.dailyCartNetUnits7d || [];
  const topDemandProducts = trends.topDemandProducts || trends.topDemandProducts7d || [];

  const moderationPie = [
    { name: 'Pending',      value: products.pendingReview || 0 },
    { name: 'Approved',     value: products.active || 0 },
    { name: 'Rejected',     value: products.rejected || 0 },
    { name: 'Out of Stock', value: products.outOfStock || 0 },
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Store Analytics"
        subtitle="Live metrics captured from orders, escrow, and cart interactions."
      >
        {RangePicker}
      </DashboardPageHeader>

      <AlertBanner type="error" message={error} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-3 shadow-sm sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Total Orders</p><p className="mt-2 break-words text-xl font-bold sm:text-2xl">{orders.totalOrders || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-3 shadow-sm sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Paid Orders</p><p className="mt-2 break-words text-xl font-bold sm:text-2xl">{orders.paidOrders || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-3 shadow-sm sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Gross Sales</p><p className="mt-2 break-words text-lg font-bold sm:text-2xl">{formatCurrency(orders.grossSales || 0)}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-3 shadow-sm sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Products in Carts</p><p className="mt-2 break-words text-xl font-bold sm:text-2xl">{cartDemand.productsInCarts || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-3 shadow-sm sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Events Captured</p><p className="mt-2 break-words text-xl font-bold sm:text-2xl">{cartDemand.eventsCaptured || 0}</p></div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-bold text-gray-900">Revenue & Orders ({activeRangeLabel})</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="period" tickFormatter={shortDay} tick={{ fontSize: 11 }} />
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
          <h3 className="text-base font-bold text-gray-900">Net Cart Units Trend ({activeRangeLabel})</h3>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="period" tickFormatter={shortDay} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(label) => shortDay(label)} />
                <Bar dataKey="netUnits" fill="#2E5C45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Top Demand Products ({activeRangeLabel})</h3>
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
