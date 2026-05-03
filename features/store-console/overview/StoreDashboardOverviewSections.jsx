'use client';

import Link from 'next/link';
import AlertBanner from '@/components/store-console/dashboard/AlertBanner';
import DashboardPageHeader from '@/components/store-console/dashboard/DashboardPageHeader';
import StatCard from '@/components/store-console/dashboard/StatCard';

export function StoreDashboardCreateProductCard() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Create Product</h3>
          <p className="text-sm text-gray-500">Upload real media files and submit products for admin approval.</p>
        </div>
        <Link
          href="/store/dashboard/products/new"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Create Product
        </Link>
      </div>
    </div>
  );
}

export function StoreDashboardOverviewFeedback({ error, loading }) {
  return (
    <>
      <AlertBanner type="error" message={error} />
      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-6 text-sm text-gray-500">Loading store overview...</div>
      ) : null}
    </>
  );
}

export function StoreDashboardOverviewStats({ data, loading }) {
  const products = data?.products || {};
  const orders = data?.orders || {};
  const escrow = data?.escrow || {};
  const cartDemand = data?.cartDemand || {};

  const cards = [
    { label: 'Total Products', value: products.total || 0 },
    { label: 'Pending Review', value: products.pendingReview || 0 },
    { label: 'Out of Stock', value: products.outOfStock || 0 },
    { label: 'Paid Orders', value: orders.paidOrders || 0 },
    { label: 'Gross Sales', value: `₦${Number(orders.grossSales || 0).toLocaleString()}` },
    { label: 'Escrow Held', value: `₦${Number(escrow.held || 0).toLocaleString()}` },
    { label: 'Products in Carts (7d)', value: cartDemand.productsInCarts || cartDemand.productsInCarts7d || 0 },
    { label: 'Units in Carts (7d)', value: cartDemand.unitsInCarts || cartDemand.unitsInCarts7d || 0 },
  ];

  return (
    <>
      <DashboardPageHeader
        title="Store Operations Overview"
        subtitle="Real-time snapshot of catalog moderation, escrow balances, and buyer demand signals."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} loading={loading} />
        ))}
      </div>
    </>
  );
}

export function StoreDashboardOverviewNextActions() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">Recommended Next Actions</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
        <li>Submit draft products for review so they can go live in the catalog.</li>
        <li>Track high cart-demand products and replenish stock before campaigns.</li>
        <li>Review escrow queue and payout account setup to speed up settlement cycles.</li>
      </ul>
    </div>
  );
}
