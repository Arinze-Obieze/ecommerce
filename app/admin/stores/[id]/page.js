'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AdminStoreDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stores/${id}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load store');
      setData(json.data);
    } catch (err) {
      setError(err.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  if (loading) return <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6">Loading store...</div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  if (!data) return null;

  const { store, assignments, productStats } = data;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
        <p className="mt-1 text-sm text-gray-500">/{store.slug}</p>
        <p className="mt-3 text-sm text-gray-700">{store.description || 'No description yet.'}</p>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-[#f3f8f5] px-3 py-2">Status: <strong className="capitalize">{store.status}</strong></div>
          <div className="rounded-xl bg-[#f3f8f5] px-3 py-2">KYC: <strong className="capitalize">{store.kyc_status}</strong></div>
          <div className="rounded-xl bg-[#f3f8f5] px-3 py-2">Payout: <strong>{store.payout_ready ? 'Ready' : 'Not ready'}</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Products</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{productStats.total}</p>
        </div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Active products</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{productStats.active}</p>
        </div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Out of stock</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{productStats.outOfStock}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Assigned users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((row) => (
                <tr key={row.id} className="border-b border-gray-50">
                  <td className="py-2 pr-3 font-semibold text-gray-900">{row.user?.full_name || 'Unknown user'}</td>
                  <td className="py-2 pr-3 text-gray-700">{row.user?.email || row.user_id}</td>
                  <td className="py-2 pr-3 capitalize">{row.role}</td>
                  <td className="py-2 pr-3 capitalize">{row.status}</td>
                </tr>
              ))}
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">No assigned users yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
