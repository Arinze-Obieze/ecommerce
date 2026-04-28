'use client';

import {
  AdminOverviewError,
  AdminOverviewHealth,
  AdminOverviewKpis,
  AdminOverviewLoading,
  AdminOverviewTopStores,
  AdminOverviewTrends,
} from '@/features/admin/overview/AdminOverviewSections';
import useAdminOverview from '@/features/admin/overview/useAdminOverview';

export default function AdminOverviewPage() {
  const overview = useAdminOverview();

  if (overview.loading) {
    return <AdminOverviewLoading />;
  }

  if (overview.error) {
    return <AdminOverviewError error={overview.error} />;
  }

  return (
    <div className="space-y-6">
      <AdminOverviewKpis payload={overview.payload} />
      <AdminOverviewTrends payload={overview.payload} />
      <AdminOverviewHealth payload={overview.payload} />
      <AdminOverviewTopStores payload={overview.payload} />
    </div>
  );
}
