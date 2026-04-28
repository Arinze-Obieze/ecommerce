'use client';

import {
  AdminOrdersFilters,
  AdminOrdersIntro,
  AdminOrdersPagination,
  AdminOrdersTable,
} from '@/features/admin/orders/AdminOrdersSections';
import useAdminOrders from '@/features/admin/orders/useAdminOrders';

export default function AdminOrdersPage() {
  const { orders, meta, filters, setFilters, loading, error, loadOrders } = useAdminOrders();

  return (
    <div className="space-y-4">
      <AdminOrdersIntro />

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <AdminOrdersFilters filters={filters} setFilters={setFilters} onApply={() => loadOrders(1, meta.limit, filters)} />
        <AdminOrdersTable error={error} loading={loading} orders={orders} />
        <AdminOrdersPagination loading={loading} meta={meta} filters={filters} onLoad={loadOrders} />
      </div>
    </div>
  );
}
