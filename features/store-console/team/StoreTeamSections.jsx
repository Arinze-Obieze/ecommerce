'use client';

import DashboardPageHeader from '@/components/store-console/dashboard/DashboardPageHeader';
import { formatDate, ROLE_OPTIONS, roleLabel, STATUS_OPTIONS } from '@/features/store-console/team/team.utils';

export function TeamPageHeader({ storeName, currentRole }) {
  return (
    <DashboardPageHeader
      title="Team Management"
      subtitle={`Add teammates, invite people who have not signed up yet, and manage access for ${storeName || 'your store'}.`}
    >
      <p className="text-xs text-gray-500">
        Current role: <span className="font-semibold text-primary">{roleLabel(currentRole)}</span>
      </p>
    </DashboardPageHeader>
  );
}

export function TeamInvitePanel({
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  inviteMessage,
  setInviteMessage,
  canManageTeam,
  saving,
  onSubmit,
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">Invite Team Member</h3>
      <p className="mt-1 text-sm text-gray-500">
        Existing users get immediate access. New users receive a secure account setup invitation automatically.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          type="email"
          placeholder="teammate@email.com"
          value={inviteEmail}
          onChange={(event) => setInviteEmail(event.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          required
          disabled={!canManageTeam || saving}
        />
        <select
          value={inviteRole}
          onChange={(event) => setInviteRole(event.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          disabled={!canManageTeam || saving}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Optional welcome note for the invite email"
          value={inviteMessage}
          onChange={(event) => setInviteMessage(event.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
          rows={3}
          disabled={!canManageTeam || saving}
        />
        <button
          type="submit"
          disabled={!canManageTeam || saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 md:w-fit"
        >
          {saving ? 'Saving...' : 'Add / Invite Member'}
        </button>
      </form>
      {!canManageTeam ? <p className="mt-3 text-xs text-amber-700">Only owner or manager can add or revoke team members.</p> : null}
    </div>
  );
}

export function TeamInvitationsTable({ loading, invitations, canManageTeam, saving, onUpdateInvitation }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-gray-900">Pending Invitations</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading invitations...</p>
      ) : invitations.length === 0 ? (
        <p className="text-sm text-gray-500">No pending or historical invitations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Last Sent</th>
                <th className="py-2 pr-3">Audit</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((row) => (
                <tr key={row.id} className="border-b border-gray-50">
                  <td className="py-2 pr-3">
                    <div className="font-semibold text-gray-900">{row.email}</div>
                    {row.invite_message ? <div className="text-xs text-gray-500">{row.invite_message}</div> : null}
                  </td>
                  <td className="py-2 pr-3">{roleLabel(row.role)}</td>
                  <td className="py-2 pr-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'pending' ? 'bg-amber-50 text-amber-700' : row.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {roleLabel(row.status)}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{formatDate(row.sent_at)}</td>
                  <td className="py-2 pr-3 text-xs text-gray-500">
                    Sent {row.sent_count || 0}x{row.accepted_at ? ` • Accepted ${formatDate(row.accepted_at)}` : ''}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateInvitation(row.id, 'resend')}
                        disabled={!canManageTeam || saving || row.status === 'accepted'}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Resend
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateInvitation(row.id, 'revoke')}
                        disabled={!canManageTeam || saving || row.status === 'accepted' || row.status === 'revoked'}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function TeamMembersTable({ loading, rows, canManageTeam, saving, onUpdateMember, onRemoveMember }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-gray-900">Current Team</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading team...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Member</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50">
                  <td className="py-2 pr-3">
                    <div className="font-semibold text-gray-900">{row.user?.full_name || 'User'}</div>
                    <div className="text-xs text-gray-500">{row.user?.email || row.user_id}</div>
                  </td>
                  <td className="py-2 pr-3">
                    {row.role === 'owner' ? (
                      <span className="rounded-full bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">Owner</span>
                    ) : (
                      <select
                        value={row.role}
                        onChange={(event) => onUpdateMember(row.id, { role: event.target.value })}
                        disabled={!canManageTeam || saving}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {roleLabel(role)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {row.role === 'owner' ? (
                      <span className="text-xs font-semibold text-primary">Active</span>
                    ) : (
                      <select
                        value={row.status}
                        onChange={(event) => onUpdateMember(row.id, { status: event.target.value })}
                        disabled={!canManageTeam || saving}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {roleLabel(status)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-3">
                    {row.role === 'owner' ? (
                      <span className="text-xs text-gray-500">Protected</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(row.id)}
                        disabled={!canManageTeam || saving}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">No team members found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
