'use client';

import NotificationsPanel from '@/components/NotificationsPanel';

export default function ProfileNotifications() {
  return (
    <NotificationsPanel
      emptyTitle="Your inbox is quiet"
      emptyBody="We will keep your order, return, review, and access updates here."
    />
  );
}
