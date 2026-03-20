'use client';

import { useEffect, useState } from 'react';

const ROLE_OPTIONS = ['manager', 'staff'];
const STATUS_OPTIONS = ['active', 'revoked'];

function roleLabel(role) {
  return String(role || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function StoreDashboardTeamPage() {
  const [rows, setRows] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');

  const canManageTeam = currentMembership?.role === 'owner' || currentMembership?.role === 'manager';

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/store/team', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load team');
      setRows(json.data || []);
      setCurrentMembership(json.meta?.currentMembership || null);
      setStore(json.meta?.store || null);
    } catch (err) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const addMember = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await fetch('/api/store/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add member');
      setInviteEmail('');
      setInviteRole('staff');
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (assignmentId, updates) => {
    try {
      setSaving(true);
      setError('');
      const res = await fetch(`/api/store/team/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update member');
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Failed to update member');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (assignmentId) => {
    try {
      setSaving(true);
      setError('');
      const res = await fetch(`/api/store/team/${assignmentId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove member');
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Team Management</h2>
        <p className="text-sm text-gray-500">
          Add and manage manager/staff access for <span className="font-semibold text-gray-700">{store?.name || 'your store'}</span>.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Current role: <span className="font-semibold text-[#2E5C45]">{roleLabel(currentMembership?.role)}</span>
        </p>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Add Team Member By Email</h3>
        <p className="mt-1 text-sm text-gray-500">The teammate must already have an account in the platform.</p>
        <form onSubmit={addMember} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px]">
          <input
            type="email"
            placeholder="teammate@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            required
            disabled={!canManageTeam || saving}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            disabled={!canManageTeam || saving}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>{roleLabel(role)}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!canManageTeam || saving}
            className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Member
          </button>
        </form>
        {!canManageTeam ? (
          <p className="mt-3 text-xs text-amber-700">
            Only owner or manager can add/remove team members.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
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
                        <span className="rounded-full bg-[#eef4f0] px-2 py-1 text-xs font-semibold text-[#2E5C45]">
                          Owner
                        </span>
                      ) : (
                        <select
                          value={row.role}
                          onChange={(e) => updateMember(row.id, { role: e.target.value })}
                          disabled={!canManageTeam || saving}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>{roleLabel(role)}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {row.role === 'owner' ? (
                        <span className="text-xs font-semibold text-[#2E5C45]">Active</span>
                      ) : (
                        <select
                          value={row.status}
                          onChange={(e) => updateMember(row.id, { status: e.target.value })}
                          disabled={!canManageTeam || saving}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{roleLabel(status)}</option>
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
                          onClick={() => removeMember(row.id)}
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
    </div>
  );
}
