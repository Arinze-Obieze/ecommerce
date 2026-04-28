'use client';

import AlertBanner from '@/components/store-console/dashboard/AlertBanner';
import {
  TeamInvitePanel,
  TeamInvitationsTable,
  TeamMembersTable,
  TeamPageHeader,
} from '@/features/store-console/team/StoreTeamSections';
import useStoreTeam from '@/features/store-console/team/useStoreTeam';

export default function StoreDashboardTeamPage() {
  const {
    rows,
    invitations,
    currentMembership,
    store,
    loading,
    saving,
    error,
    notice,
    migrationHint,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteMessage,
    setInviteMessage,
    canManageTeam,
    addMember,
    updateMember,
    removeMember,
    updateInvitation,
  } = useStoreTeam();

  return (
    <div className="space-y-6">
      <TeamPageHeader storeName={store?.name} currentRole={currentMembership?.role} />

      <AlertBanner type="error" message={error} />
      <AlertBanner type="notice" message={notice} />
      <AlertBanner type="warning" message={migrationHint} />

      <TeamInvitePanel
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        inviteRole={inviteRole}
        setInviteRole={setInviteRole}
        inviteMessage={inviteMessage}
        setInviteMessage={setInviteMessage}
        canManageTeam={canManageTeam}
        saving={saving}
        onSubmit={addMember}
      />

      <TeamInvitationsTable
        loading={loading}
        invitations={invitations}
        canManageTeam={canManageTeam}
        saving={saving}
        onUpdateInvitation={updateInvitation}
      />

      <TeamMembersTable
        loading={loading}
        rows={rows}
        canManageTeam={canManageTeam}
        saving={saving}
        onUpdateMember={updateMember}
        onRemoveMember={removeMember}
      />
    </div>
  );
}
