'use client';

import { useEffect, useState } from 'react';

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Analytics</h2>
        <p className="text-sm text-gray-500">Demand and conversion indicators for your catalog and operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Paid Orders</p><p className="mt-2 text-2xl font-bold">{orders.paidOrders || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Gross Sales</p><p className="mt-2 text-2xl font-bold">₦{Number(orders.grossSales || 0).toLocaleString()}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Products in Carts (7d)</p><p className="mt-2 text-2xl font-bold">{cartDemand.productsInCarts7d || 0}</p></div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm"><p className="text-xs uppercase text-gray-500">Units in Carts (7d)</p><p className="mt-2 text-2xl font-bold">{cartDemand.unitsInCarts7d || 0}</p></div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Moderation Funnel</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
          <div className="rounded-xl bg-gray-50 px-3 py-2">Pending: <strong>{products.pendingReview || 0}</strong></div>
          <div className="rounded-xl bg-gray-50 px-3 py-2">Approved: <strong>{products.active || 0}</strong></div>
          <div className="rounded-xl bg-gray-50 px-3 py-2">Rejected: <strong>{products.rejected || 0}</strong></div>
          <div className="rounded-xl bg-gray-50 px-3 py-2">Out of stock: <strong>{products.outOfStock || 0}</strong></div>
        </div>
      </div>
    </div>
  );
}
