'use client';

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

export function AdminAnalyticsStates({ loading, error }) {
  if (loading) {
    return <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6">Loading analytics...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  }

  return null;
}

export function AnalyticsTopCards({ acquisition }) {
  const cards = [
    { label: 'DAU', value: acquisition.dau },
    { label: 'WAU', value: acquisition.wau },
    { label: 'MAU', value: acquisition.mau },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-[#E8E4DC] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">{card.label}</p>
          <p className="mt-2 text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsCharts({ acquisition, funnel, behavior, commerce, currency }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Daily Active Users (30d)</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={acquisition.dauTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="dau" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Commerce Funnel</h2>
          <div className="space-y-2 text-sm">
            <MetricRow label="Product impression" value={funnel.product_impression} />
            <MetricRow label="View item" value={funnel.view_item} />
            <MetricRow label="Add to cart" value={funnel.add_to_cart} />
            <MetricRow label="Begin checkout" value={funnel.begin_checkout} />
            <MetricRow label="Purchase" value={funnel.purchase} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
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
          <p className="mt-2 text-xs text-gray-500">
            Latest day revenue: {currency.format(commerce.revenueTrend[commerce.revenueTrend.length - 1]?.revenue || 0)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Search Behavior</h2>
          <p className="mb-3 text-sm text-gray-600">
            Zero-result searches: <strong>{behavior.zeroResultSearches}</strong>
          </p>
          <div className="space-y-2 text-sm">
            {behavior.topSearchTerms.map((term) => (
              <div key={term.term} className="flex items-center justify-between rounded-lg bg-primary-soft px-3 py-2">
                <span>{term.term}</span>
                <strong>{term.count}</strong>
              </div>
            ))}
            {behavior.topSearchTerms.length === 0 ? <p className="text-gray-500">No search events yet.</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}

export function AnalyticsSummaryGrids({ cohorts, geography, devices, recommendations }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SimplePanel title="Buyer Cohorts">
          <p className="text-sm text-gray-700">New buyers (30d): <strong>{cohorts.newBuyers}</strong></p>
          <p className="text-sm text-gray-700">Returning buyers (30d): <strong>{cohorts.returningBuyers}</strong></p>
        </SimplePanel>

        <SimpleListPanel title="Top States" rows={geography.ordersByState} labelKey="state" valueKey="count" />
        <SimpleListPanel title="Devices" rows={devices} labelKey="device" valueKey="count" capitalize />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SimplePanel title="Recommendation Reach">
          <p className="text-sm text-gray-700">Tracked impressions (30d): <strong>{recommendations.impressions}</strong></p>
          <p className="mt-2 text-xs text-gray-500">This reflects product cards actually seen in recommendation surfaces.</p>
        </SimplePanel>

        <SimpleListPanel title="Surface Mix" rows={recommendations.recommendationSurfaceMix} labelKey="surface" valueKey="count" emptyText="No recommendation impressions yet." />
        <SimpleListPanel title="Persona Mix" rows={recommendations.recommendationPersonaMix} labelKey="persona" valueKey="count" emptyText="No persona mix data yet." />
      </div>
    </>
  );
}

export function AnalyticsTables({ recommendations, reliability }) {
  return (
    <>
      <TablePanel
        title="Top Exposed Recommended Products"
        columns={['Product', 'Product ID', 'Impressions']}
        emptyText="No recommendation exposure data yet."
        rows={recommendations.topExposedProducts.map((row) => [row.product_name, <span key={row.product_id} className="font-mono text-xs">{row.product_id}</span>, row.impressions])}
      />

      <TablePanel
        title="Top Failing Actions"
        columns={['Service', 'Action', 'Failures']}
        emptyText="No significant failures in window."
        rows={reliability.failingActions.map((row) => [row.service, row.action, row.count])}
      />
    </>
  );
}

function MetricRow({ label, value }) {
  return (
    <p className="flex justify-between">
      <span>{label}</span>
      <strong>{value}</strong>
    </p>
  );
}

function SimplePanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}

function SimpleListPanel({ title, rows, labelKey, valueKey, emptyText, capitalize = false }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={`${row[labelKey]}`} className="flex justify-between rounded-lg bg-primary-soft px-3 py-2">
            <span className={capitalize ? 'capitalize' : ''}>{row[labelKey]}</span>
            <strong>{row[valueKey]}</strong>
          </div>
        ))}
        {rows.length === 0 && emptyText ? <p className="text-gray-500">{emptyText}</p> : null}
      </div>
    </div>
  );
}

function TablePanel({ title, columns, rows, emptyText }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              {columns.map((column) => (
                <th key={column} className="py-2 pr-3">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-b border-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`} className="py-2 pr-3">{cell}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-gray-500">{emptyText}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
