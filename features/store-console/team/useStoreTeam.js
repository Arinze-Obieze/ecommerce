'use client';

import { useEffect, useMemo, useState } from 'react';

export default function useStoreTeam() {
  const [rows, setRows] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [migrationHint, setMigrationHint] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteMessage, setInviteMessage] = useState('');

  const canManageTeam = useMemo(
    () => currentMembership?.role === 'owner' || currentMembership?.role === 'manager',
    [currentMembership?.role]
  );

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/store/team', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load team');
      setRows(json.data || []);
      setInvitations(json.invitations || []);
      setCurrentMembership(json.meta?.currentMembership || null);
      setStore(json.meta?.store || null);
      setMigrationHint(json.meta?.migrationHint || '');
    } catch (err) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeam();
  }, []);

  const addMember = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const response = await fetch('/api/store/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          invite_message: inviteMessage.trim(),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to add member');
      setInviteEmail('');
      setInviteRole('staff');
      setInviteMessage('');
      setNotice(json.invitation ? 'Secure invitation sent and pending acceptance.' : 'Team member added immediately.');
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
      setNotice('');
      const response = await fetch(`/api/store/team/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to update member');
      setNotice('Team member updated.');
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
      setNotice('');
      const response = await fetch(`/api/store/team/${assignmentId}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to remove member');
      setNotice('Team access revoked.');
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setSaving(false);
    }
  };

  const updateInvitation = async (inviteId, action) => {
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const response = await fetch(`/api/store/team/invitations/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || `Failed to ${action} invitation`);
      setNotice(action === 'resend' ? 'Invitation resent.' : 'Invitation revoked.');
      await loadTeam();
    } catch (err) {
      setError(err.message || `Failed to ${action} invitation`);
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
