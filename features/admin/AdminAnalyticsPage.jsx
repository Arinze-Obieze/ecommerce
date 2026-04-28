'use client';

import {
  AdminAnalyticsStates,
  AnalyticsCharts,
  AnalyticsSummaryGrids,
  AnalyticsTables,
  AnalyticsTopCards,
} from '@/features/admin/analytics/AdminAnalyticsSections';
import useAdminAnalytics from '@/features/admin/analytics/useAdminAnalytics';

export default function AdminAnalyticsPage() {
  const { data, loading, error, currency } = useAdminAnalytics();

  if (loading || error) {
    return <AdminAnalyticsStates loading={loading} error={error} />;
  }

  const { acquisition, funnel, behavior, recommendations, cohorts, commerce, geography, devices, reliability } = data;

  return (
    <div className="space-y-6">
      <AnalyticsTopCards acquisition={acquisition} />
      <AnalyticsCharts acquisition={acquisition} funnel={funnel} behavior={behavior} commerce={commerce} currency={currency} />
      <AnalyticsSummaryGrids cohorts={cohorts} geography={geography} devices={devices} recommendations={recommendations} />
      <AnalyticsTables recommendations={recommendations} reliability={reliability} />
    </div>
  );
}
