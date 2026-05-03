'use client';

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
import AlertBanner from '@/components/store-console/dashboard/AlertBanner';
import DashboardPageHeader from '@/components/store-console/dashboard/DashboardPageHeader';
import { formatCurrency, shortDay, STORE_ANALYTICS_RANGE_OPTIONS } from '@/features/store-console/analytics/useStoreAnalytics';

const MODERATION_COLORS = ['var(--color-primary)', '#0ea5e9', '#ef4444', '#f59e0b'];

export function StoreAnalyticsLoading({ loading }) {
  if (!loading) return null;
  return <div className="rounded-2xl border border-border bg-white p-6 text-sm text-gray-500">Loading analytics...</div>;
}

export function StoreAnalyticsHeader({ range, setRange, error }) {
  return (
    <>
      <DashboardPageHeader title="Store Analytics" subtitle="Live metrics captured from orders, escrow, and cart interactions.">
        <div className="flex flex-wrap gap-2">
          {STORE_ANALYTICS_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRange(option.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${range === option.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </DashboardPageHeader>

      <AlertBanner type="error" message={error} />
    </>
  );
}

export function StoreAnalyticsTopCards({ orders, cartDemand }) {
  const cards = [
    { label: 'Total Orders', value: orders.totalOrders || 0 },
    { label: 'Paid Orders', value: orders.paidOrders || 0 },
    { label: 'Gross Sales', value: formatCurrency(orders.grossSales || 0) },
    { label: 'Products in Carts', value: cartDemand.productsInCarts || 0 },
    { label: 'Events Captured', value: cartDemand.eventsCaptured || 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">{card.label}</p>
          <p className="mt-2 break-words text-xl font-bold sm:text-2xl">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function StoreAnalyticsCharts({ activeRangeLabel, dailyRevenue, dailyCart, moderationPie, topDemandProducts }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-bold text-gray-900">Revenue & Orders ({activeRangeLabel})</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="period" tickFormatter={shortDay} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => (name === 'revenue' ? formatCurrency(value) : value)} labelFormatter={(label) => shortDay(label)} />
                <Bar yAxisId="left" dataKey="orders" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Catalog Moderation Mix</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={moderationPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88}>
                  {moderationPie.map((entry, index) => (
                    <Cell key={entry.name} fill={MODERATION_COLORS[index % MODERATION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {moderationPie.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODERATION_COLORS[index % MODERATION_COLORS.length] }} />
                {entry.name}: <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-bold text-gray-900">Net Cart Units Trend ({activeRangeLabel})</h3>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="period" tickFormatter={shortDay} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(label) => shortDay(label)} />
                <Bar dataKey="netUnits" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
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
    </>
  );
}
