'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_RETURN_POLICY } from '@/utils/catalog/return-policy';
import {
  createEditablePolicyRow,
  normalizeReturnPolicy,
  serializeReturnPolicy,
} from '@/features/admin/return-policy/adminReturnPolicy.utils';

export default function useAdminReturnPolicy() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [snapshot, setSnapshot] = useState(DEFAULT_RETURN_POLICY);
  const [form, setForm] = useState(normalizeReturnPolicy(DEFAULT_RETURN_POLICY));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/return-policy', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load return policy');

      const policy = json.data || DEFAULT_RETURN_POLICY;
      setSnapshot(policy);
      setForm(normalizeReturnPolicy(policy));
    } catch (err) {
      setError(err.message || 'Failed to load return policy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changed = useMemo(
    () => serializeReturnPolicy(form) !== serializeReturnPolicy(normalizeReturnPolicy(snapshot)),
    [form, snapshot]
  );

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const updateRow = useCallback((rowId, field, value) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  }, []);

  const addRow = useCallback(() => {
    setForm((current) => ({
      ...current,
      rows: [...current.rows, createEditablePolicyRow()],
    }));
  }, []);

  const removeRow = useCallback((rowId) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.filter((row) => row.id !== rowId),
    }));
  }, []);

  const save = useCallback(async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setNotice('');

      const response = await fetch('/api/admin/return-policy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to save return policy');

      const policy = json.data || DEFAULT_RETURN_POLICY;
      setSnapshot(policy);
      setForm(normalizeReturnPolicy(policy));
      setNotice('Return policy updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save return policy');
    } finally {
      setSaving(false);
    }
  }, [form]);

  return {
    loading,
    saving,
    error,
    notice,
    form,
    changed,
    updateField,
    updateRow,
    addRow,
    removeRow,
    load,
    save,
  };
}
