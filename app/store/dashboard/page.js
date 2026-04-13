'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function StatValue({ loading, children }) {
  if (loading) {
    return <span className="mt-1.5 block h-7 w-20 animate-pulse rounded-md bg-gray-200" aria-hidden="true" />;
  }
  return <>{children}</>;
}

export default function StoreDashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/store/analytics/overview?range=7d', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load dashboard overview');
      setData(json.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOverview(); }, []);

  const products = data?.products || {};
  const orders = data?.orders || {};
  const escrow = data?.escrow || {};
  const cartDemand = data?.cartDemand || {};

  const cards = [
    { label: 'Total Products',        value: products.total || 0 },
    { label: 'Pending Review',        value: products.pendingReview || 0 },
    { label: 'Out of Stock',          value: products.outOfStock || 0 },
    { label: 'Paid Orders',           value: orders.paidOrders || 0 },
    { label: 'Gross Sales',           value: `₦${Number(orders.grossSales || 0).toLocaleString()}` },
    { label: 'Escrow Held',           value: `₦${Number(escrow.held || 0).toLocaleString()}` },
    { label: 'Products in Carts (7d)', value: cartDemand.productsInCarts || cartDemand.productsInCarts7d || 0 },
    { label: 'Units in Carts (7d)',   value: cartDemand.unitsInCarts || cartDemand.unitsInCarts7d || 0 },
  ];

  return (
    <div className="space-y-6">

      {/* Create Product — navigates to the same wizard as the Products tab */}
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Create Product</h3>
            <p className="text-sm text-gray-500">Upload real media files and submit products for admin approval.</p>
          </div>
          <Link
            href="/store/dashboard/products/new"
            className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] transition-colors"
          >
            Create Product
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 text-sm text-gray-500">Loading store overview...</div>
      ) : null}

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Operations Overview</h2>
        <p className="text-sm text-gray-500">
          Real-time snapshot of catalog moderation, escrow balances, and buyer demand signals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">{card.label}</p>
            <p className="mt-1.5 break-words text-lg font-bold leading-tight text-[#2E5C45] sm:text-xl">
              <StatValue loading={loading}>{card.value}</StatValue>
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Recommended Next Actions</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Submit draft products for review so they can go live in the catalog.</li>
          <li>Track high cart-demand products and replenish stock before campaigns.</li>
          <li>Review escrow queue and payout account setup to speed up settlement cycles.</li>
        </ul>
      </div>

    </div>
  );
}
