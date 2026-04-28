'use client';

import {
  StoreAnalyticsCharts,
  StoreAnalyticsHeader,
  StoreAnalyticsLoading,
  StoreAnalyticsTopCards,
} from '@/features/store-console/analytics/StoreAnalyticsSections';
import useStoreAnalytics, { STORE_ANALYTICS_RANGE_OPTIONS } from '@/features/store-console/analytics/useStoreAnalytics';

export default function StoreAnalyticsPage() {
  const { data, range, setRange, loading, error } = useStoreAnalytics();

  if (loading) {
    return <StoreAnalyticsLoading loading={loading} />;
  }

  const orders = data?.orders || {};
  const cartDemand = data?.cartDemand || {};
  const products = data?.products || {};
  const trends = data?.trends || {};
  const meta = data?.meta || {};
  const activeRangeLabel = meta.range?.label || STORE_ANALYTICS_RANGE_OPTIONS.find((option) => option.value === range)?.label || 'Selected range';
  const dailyRevenue = trends.ordersRevenue || trends.dailyOrdersAndRevenue14d || [];
  const dailyCart = trends.cartNetUnits || trends.dailyCartNetUnits7d || [];
  const topDemandProducts = trends.topDemandProducts || trends.topDemandProducts7d || [];

  const moderationPie = [
    { name: 'Pending',      value: products.pendingReview || 0 },
    { name: 'Approved',     value: products.active || 0 },
    { name: 'Rejected',     value: products.rejected || 0 },
    { name: 'Out of Stock', value: products.outOfStock || 0 },
  ];

  return (
    <div className="space-y-6">
      <StoreAnalyticsHeader range={range} setRange={setRange} error={error} />
      <StoreAnalyticsTopCards orders={orders} cartDemand={cartDemand} />
      <StoreAnalyticsCharts activeRangeLabel={activeRangeLabel} dailyRevenue={dailyRevenue} dailyCart={dailyCart} moderationPie={moderationPie} topDemandProducts={topDemandProducts} />
    </div>
  );
}
