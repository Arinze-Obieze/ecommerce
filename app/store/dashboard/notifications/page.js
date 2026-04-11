'use client';

import NotificationsPanel from '@/components/NotificationsPanel';

export default function StoreDashboardNotificationsPage() {
  return (
    <NotificationsPanel
      emptyTitle="No store notifications yet"
      emptyBody="Order fulfillment, returns, team invites, and payout exceptions will appear here."
    />
  );
}
