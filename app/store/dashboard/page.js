'use client';

import { useEffect, useState } from 'react';
import CreateProductPanel from '@/components/Store/CreateProductPanel';

export default function StoreDashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/store/analytics/overview', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load dashboard overview');
      setData(json.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

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
    { label: 'Products in Carts (7d)', value: cartDemand.productsInCarts7d || 0 },
    { label: 'Units in Carts (7d)', value: cartDemand.unitsInCarts7d || 0 },
  ];

  return (
    <div className="space-y-6">
      <CreateProductPanel onCreated={loadOverview} />

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#2E5C45]">{card.value}</p>
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
