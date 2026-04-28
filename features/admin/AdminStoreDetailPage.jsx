'use client';

import {
  AdminStoreAssignmentsTable,
  AdminStoreDetailError,
  AdminStoreDetailHero,
  AdminStoreDetailLoading,
  AdminStoreDetailStats,
} from '@/features/admin/store-detail/AdminStoreDetailSections';
import useAdminStoreDetail from '@/features/admin/store-detail/useAdminStoreDetail';

export default function AdminStoreDetailPage({ storeId }) {
  const storeDetail = useAdminStoreDetail(storeId);

  if (storeDetail.loading) return <AdminStoreDetailLoading />;
  if (storeDetail.error) return <AdminStoreDetailError error={storeDetail.error} />;
  if (!storeDetail.data) return null;

  return (
    <div className="space-y-6">
      <AdminStoreDetailHero store={storeDetail.data.store} />
      <AdminStoreDetailStats productStats={storeDetail.data.productStats} />
      <AdminStoreAssignmentsTable assignments={storeDetail.data.assignments || []} />
    </div>
  );
}
