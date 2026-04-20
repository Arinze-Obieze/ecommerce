"use client";

import AnalyticsPageTracker from '@/components/analytics/AnalyticsPageTracker';
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import FloatingDashboardCTA from '@/components/layout/FloatingDashboardCTA';

export default function SiteChrome({ children }) {
  return (
    <>
      <AnalyticsPageTracker />
      <ConditionalHeader />
      <FloatingDashboardCTA />
      {children}
      <ConditionalFooter />
    </>
  );
}
