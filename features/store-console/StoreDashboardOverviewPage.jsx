'use client';

import {
  StoreDashboardCreateProductCard,
  StoreDashboardOverviewFeedback,
  StoreDashboardOverviewNextActions,
  StoreDashboardOverviewStats,
} from '@/features/store-console/overview/StoreDashboardOverviewSections';
import useStoreDashboardOverview from '@/features/store-console/overview/useStoreDashboardOverview';

export default function StoreDashboardOverviewPage() {
  const overview = useStoreDashboardOverview();

  return (
    <div className="space-y-6">
      <StoreDashboardCreateProductCard />
      <StoreDashboardOverviewFeedback error={overview.error} loading={overview.loading} />
      <StoreDashboardOverviewStats data={overview.data} loading={overview.loading} />
      <StoreDashboardOverviewNextActions />
    </div>
  );
}
