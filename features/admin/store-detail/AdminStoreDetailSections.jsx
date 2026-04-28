'use client';

import { getStoreSummaryCards } from '@/features/admin/store-detail/adminStoreDetail.utils';

export function AdminStoreDetailLoading() {
  return <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6">Loading store...</div>;
}

export function AdminStoreDetailError({ error }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
}

export function AdminStoreDetailHero({ store }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
      <p className="mt-1 text-sm text-gray-500">/{store.slug}</p>
      <p className="mt-3 text-sm text-gray-700">{store.description || 'No description yet.'}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl bg-primary-soft px-3 py-2">Status: <strong className="capitalize">{store.status}</strong></div>
        <div className="rounded-xl bg-primary-soft px-3 py-2">KYC: <strong className="capitalize">{store.kyc_status}</strong></div>
        <div className="rounded-xl bg-primary-soft px-3 py-2">Payout: <strong>{store.payout_ready ? 'Ready' : 'Not ready'}</strong></div>
      </div>
    </div>
  );
}

export function AdminStoreDetailStats({ productStats }) {
  const cards = getStoreSummaryCards(productStats);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-[#E8E4DC] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminStoreAssignmentsTable({ assignments }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
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
  );
}
