'use client';

import {
  AdminEscrowCards,
  AdminEscrowIntro,
  AdminEscrowTable,
  AdminEscrowTabs,
} from '@/features/admin/escrow/AdminEscrowSections';
import useAdminEscrow from '@/features/admin/escrow/useAdminEscrow';

export default function AdminEscrowPage() {
  const { tab, setTab, loading, error, rows, cards, busyKey, release } = useAdminEscrow();

  return (
    <div className="space-y-6">
      <AdminEscrowIntro />
      <AdminEscrowCards cards={cards} />
      <AdminEscrowTabs tab={tab} setTab={setTab} />
      <AdminEscrowTable loading={loading} error={error} rows={rows} tab={tab} busyKey={busyKey} onRelease={release} />
    </div>
  );
}
