import { requireStorePage } from '@/utils/storeAuth';

export const dynamic = 'force-dynamic';

export default async function StoreDashboardOverviewPage() {
  const { membership, store, adminClient } = await requireStorePage();

  const [productsRes, teamRes] = await Promise.all([
    adminClient
      .from('products')
      .select('id, is_active, stock_quantity')
      .eq('store_id', membership.store_id),
    adminClient
      .from('store_users')
      .select('id, status')
      .eq('store_id', membership.store_id),
  ]);

  const products = productsRes.data || [];
  const team = teamRes.data || [];

  const cards = [
    { label: 'Products', value: products.length },
    { label: 'Active Products', value: products.filter((p) => p.is_active).length },
    { label: 'Out of Stock', value: products.filter((p) => Number(p.stock_quantity || 0) <= 0).length },
    { label: 'Team Members', value: team.filter((t) => t.status === 'active').length },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Overview</h2>
        <p className="text-sm text-gray-500">
          Monitor team and catalog health for <span className="font-semibold text-gray-700">{store?.name}</span>.
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
        <h3 className="text-base font-bold text-gray-900">Next Operational Steps</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Add managers and staff in Team Management so daily operations are distributed.</li>
          <li>Keep out-of-stock count low by monitoring variant quantities before campaigns.</li>
          <li>Use role-based access to reduce operational mistakes and improve accountability.</li>
        </ul>
      </div>
    </div>
  );
}
