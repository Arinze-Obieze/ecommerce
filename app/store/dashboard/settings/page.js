'use client';

import { useEffect, useMemo, useState } from 'react';

const initialForm = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  low_stock_threshold: '5',
};

function makeStoreUrl(slug) {
  if (!slug) return '';
  return `/store/${slug}`;
}

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [meta, setMeta] = useState({ role: '', can_edit: false });
  const [snapshot, setSnapshot] = useState(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/store/settings', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load settings');

      setSnapshot(json.data || null);
      setMeta(json.meta || { role: '', can_edit: false });
      setForm({
        name: json.data?.name || '',
        slug: json.data?.slug || '',
        description: json.data?.description || '',
        logo_url: json.data?.logo_url || '',
        low_stock_threshold: String(json.data?.low_stock_threshold ?? 5),
      });
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changed = useMemo(() => {
    if (!snapshot) return false;
    return (
      form.name !== (snapshot.name || '') ||
      form.slug !== (snapshot.slug || '') ||
      form.description !== (snapshot.description || '') ||
      form.logo_url !== (snapshot.logo_url || '') ||
      form.low_stock_threshold !== String(snapshot.low_stock_threshold ?? 5)
    );
  }, [form, snapshot]);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');

      const res = await fetch('/api/store/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          low_stock_threshold: Number.parseInt(form.low_stock_threshold, 10),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update settings');

      setSnapshot(json.data || null);
      setForm({
        name: json.data?.name || '',
        slug: json.data?.slug || '',
        description: json.data?.description || '',
        logo_url: json.data?.logo_url || '',
        low_stock_threshold: String(json.data?.low_stock_threshold ?? 5),
      });
      setNotice('Store settings updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 text-sm text-gray-500">Loading store settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Settings</h2>
        <p className="text-sm text-gray-500">Manage your store identity and storefront profile details.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Role</p>
          <p className="mt-1 text-sm font-semibold capitalize text-gray-900">{meta.role || '-'}</p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Store Status</p>
          <p className="mt-1 text-sm font-semibold capitalize text-gray-900">{snapshot?.status || '-'}</p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">KYC / Payout</p>
          <p className="mt-1 break-words text-sm font-semibold text-gray-900">
            {(snapshot?.kyc_status || 'pending')} / {snapshot?.payout_ready ? 'Ready' : 'Not ready'}
          </p>
        </div>
      </div>

      <form onSubmit={onSave} className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}
        {!meta.can_edit ? (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You have view-only access. Ask a store owner or manager to update settings.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Store Name</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.name}
              disabled={!meta.can_edit}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Store Slug</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.slug}
              disabled={!meta.can_edit}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
            <span className="mt-1 block text-xs text-gray-500">Public URL: {makeStoreUrl(form.slug) || '-'}</span>
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold text-gray-700">Description</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.description}
              disabled={!meta.can_edit}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={1000}
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold text-gray-700">Logo URL</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.logo_url}
              disabled={!meta.can_edit}
              onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              placeholder="https://..."
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">Low stock threshold</span>
            <input
              type="number"
              min="0"
              max="100000"
              step="1"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={form.low_stock_threshold}
              disabled={!meta.can_edit}
              onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
              required
            />
            <span className="mt-1 block text-xs text-gray-500">
              Products at or below this quantity are treated as low stock in inventory.
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={!meta.can_edit || !changed || saving}
            className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
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
