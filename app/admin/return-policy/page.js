'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RETURN_POLICY } from '@/utils/returnPolicy';

function makeEditableRow(row = {}) {
  return {
    id: row.id || `row-${Math.random().toString(36).slice(2, 8)}`,
    scenario: row.scenario || '',
    window: row.window || '',
    condition: row.condition || '',
    resolution: row.resolution || '',
    notes: row.notes || '',
  };
}

export default function AdminReturnPolicyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [snapshot, setSnapshot] = useState(DEFAULT_RETURN_POLICY);
  const [form, setForm] = useState({
    title: DEFAULT_RETURN_POLICY.title,
    subtitle: DEFAULT_RETURN_POLICY.subtitle,
    support_text: DEFAULT_RETURN_POLICY.support_text,
    rows: DEFAULT_RETURN_POLICY.rows.map(makeEditableRow),
  });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/return-policy', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load return policy');

      const data = json.data || DEFAULT_RETURN_POLICY;
      setSnapshot(data);
      setForm({
        title: data.title || DEFAULT_RETURN_POLICY.title,
        subtitle: data.subtitle || DEFAULT_RETURN_POLICY.subtitle,
        support_text: data.support_text || DEFAULT_RETURN_POLICY.support_text,
        rows: (data.rows || DEFAULT_RETURN_POLICY.rows).map(makeEditableRow),
      });
    } catch (err) {
      setError(err.message || 'Failed to load return policy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changed = useMemo(() => {
    return JSON.stringify({
      title: form.title,
      subtitle: form.subtitle,
      support_text: form.support_text,
      rows: form.rows,
    }) !== JSON.stringify({
      title: snapshot.title,
      subtitle: snapshot.subtitle,
      support_text: snapshot.support_text,
      rows: snapshot.rows,
    });
  }, [form, snapshot]);

  const updateRow = (rowId, field, value) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  };

  const addRow = () => {
    setForm((current) => ({
      ...current,
      rows: [...current.rows, makeEditableRow()],
    }));
  };

  const removeRow = (rowId) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.filter((row) => row.id !== rowId),
    }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');

      const res = await fetch('/api/admin/return-policy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save return policy');

      const data = json.data || DEFAULT_RETURN_POLICY;
      setSnapshot(data);
      setForm({
        title: data.title,
        subtitle: data.subtitle,
        support_text: data.support_text,
        rows: data.rows.map(makeEditableRow),
      });
      setNotice('Return policy updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save return policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 text-sm text-gray-500">Loading return policy...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Generic Return Policy</h2>
        <p className="text-sm text-gray-500">
          This policy is shown on every product page. Admins can edit the summary text and the table rows below.
        </p>
      </div>

      <form onSubmit={onSave} className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Title</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              maxLength={120}
              required
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Support Note</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.support_text}
              onChange={(e) => setForm((current) => ({ ...current, support_text: e.target.value }))}
              maxLength={240}
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold text-gray-700">Subtitle</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.subtitle}
              onChange={(e) => setForm((current) => ({ ...current, subtitle: e.target.value }))}
              maxLength={240}
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-2 py-2">Scenario</th>
                <th className="px-2 py-2">Window</th>
                <th className="px-2 py-2">Condition</th>
                <th className="px-2 py-2">Resolution</th>
                <th className="px-2 py-2">Notes</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {form.rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 align-top">
                  <td className="p-2">
                    <textarea
                      className="min-h-20 w-44 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={row.scenario}
                      onChange={(e) => updateRow(row.id, 'scenario', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <textarea
                      className="min-h-20 w-40 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={row.window}
                      onChange={(e) => updateRow(row.id, 'window', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <textarea
                      className="min-h-20 w-52 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={row.condition}
                      onChange={(e) => updateRow(row.id, 'condition', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <textarea
                      className="min-h-20 w-44 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={row.resolution}
                      onChange={(e) => updateRow(row.id, 'resolution', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <textarea
                      className="min-h-20 w-56 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={row.notes}
                      onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={form.rows.length <= 1}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addRow}
            className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45]"
          >
            Add Row
          </button>
          <button
            type="submit"
            disabled={!changed || saving}
            className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Policy'}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={saving}
            className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45] disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </form>
    </div>
  );
}
