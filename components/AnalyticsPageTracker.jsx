'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackAnalyticsEvent } from '@/utils/analytics';

export default function AnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString() || '';
    trackAnalyticsEvent('page_view', {
      path: pathname,
      query,
    });
  }, [pathname, searchParams]);

  return null;
}
