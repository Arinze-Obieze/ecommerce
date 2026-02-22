'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const initialForm = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  status: 'pending',
  kyc_status: 'pending',
  payout_ready: false,
  owner_user_id: '',
};

export default function AdminStoresPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [assignModal, setAssignModal] = useState({ open: false, storeId: '', storeName: '' });
  const [assignMode, setAssignMode] = useState('uuid');
  const [assignValue, setAssignValue] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const loadStores = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      params.set('page', String(nextPage));
      params.set('limit', String(nextLimit));
      const res = await fetch(`/api/admin/stores?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load stores');
      setItems(json.data || []);
      setMeta(json.meta || { page: nextPage, limit: nextLimit, total: 0, totalPages: 1 });
      setPage(json.meta?.page || nextPage);
      setLimit(json.meta?.limit || nextLimit);
    } catch (err) {
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createStore = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          owner_user_id: form.owner_user_id || null,
        }),
      });

      const json = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(json.error || 'Failed to create store');
      }

      setForm(initialForm);
      setIsCreateOpen(false);
      await loadStores(1, limit);
      if (res.status === 207) {
        setError(json.error || 'Store created with partial issues');
      }
    } catch (err) {
      setError(err.message || 'Failed to create store');
    } finally {
      setSaving(false);
    }
  };

  const patchStore = async (id, updates) => {
    const res = await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update store');
    return json.data;
  };

  const openAssignOwnerModal = (store) => {
    setAssignModal({ open: true, storeId: store.id, storeName: store.name });
    setAssignMode('uuid');
    setAssignValue('');
    setAssignError('');
    setNotice('');
  };

  const closeAssignOwnerModal = () => {
    setAssignModal({ open: false, storeId: '', storeName: '' });
    setAssignMode('uuid');
    setAssignValue('');
    setAssignError('');
  };

  const assignOwner = async (e) => {
    e.preventDefault();
    const value = assignValue.trim();
    if (!value) {
      setAssignError(assignMode === 'uuid' ? 'Owner UUID is required' : 'Owner email is required');
      return;
    }

    const payload = assignMode === 'uuid'
      ? { user_id: value }
      : { email: value.toLowerCase() };

    try {
      setAssigning(true);
      setAssignError('');
      setError('');
      setNotice('');
      const res = await fetch(`/api/admin/stores/${assignModal.storeId}/assign-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to assign owner');

      const accountCreated = Boolean(json?.data?.account_created);
      const emailStatus = json?.data?.email_status || 'skipped';
      const ownerRole = json?.data?.owner_role || 'owner';
      const ownerEmail = json?.data?.owner_email;

      let nextNotice = accountCreated
        ? `Owner assigned with role "${ownerRole}". New account was created${ownerEmail ? ` for ${ownerEmail}` : ''}.`
        : `Owner assigned with role "${ownerRole}" successfully.`;
      let nextNoticeType = 'success';

      if (emailStatus === 'sent' && ownerEmail) {
        nextNotice = `${nextNotice} Email notification sent to ${ownerEmail}.`;
      }

      if (emailStatus === 'failed') {
        nextNotice = `${nextNotice} Email notification failed${json?.data?.email_error ? `: ${json.data.email_error}` : '.'}`;
        nextNoticeType = 'warning';
      }

      closeAssignOwnerModal();
      setNotice(nextNotice);
      setNoticeType(nextNoticeType);
      await loadStores(page, limit);
    } catch (err) {
      setAssignError(err.message || 'Failed to assign owner');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {assignModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeAssignOwnerModal} />
          <div className="relative w-full max-w-lg rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Assign Owner</h3>
              <p className="text-sm text-gray-600">
                Assign an owner to <span className="font-semibold text-gray-800">{assignModal.storeName}</span> by UUID or email.
              </p>
            </div>

            <form onSubmit={assignOwner} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAssignMode('uuid');
                    setAssignValue('');
                    setAssignError('');
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    assignMode === 'uuid'
                      ? 'border-[#2E5C45] bg-[#2E5C45] text-white'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  Use UUID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssignMode('email');
                    setAssignValue('');
                    setAssignError('');
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    assignMode === 'email'
                      ? 'border-[#2E5C45] bg-[#2E5C45] text-white'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  Use Email
                </button>
              </div>

              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                placeholder={assignMode === 'uuid' ? 'Owner user UUID' : 'Owner email'}
                value={assignValue}
                onChange={(e) => setAssignValue(e.target.value)}
                type={assignMode === 'uuid' ? 'text' : 'email'}
              />

              <p className="text-xs text-gray-500">
                If the email does not exist, an account is created in backend, assigned as owner, and credentials are emailed.
              </p>

              {assignError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {assignError}
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAssignOwnerModal}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  disabled={assigning}
                  className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60"
                >
                  {assigning ? 'Assigning...' : 'Assign owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setIsCreateOpen((v) => !v)}
          aria-expanded={isCreateOpen}
          className="flex w-full items-center justify-between rounded-xl border border-[#dbe7e0] bg-[#f5faf7] px-4 py-3 text-left"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Store</h2>
            <p className="text-sm text-gray-600">Onboard and optionally assign an owner account.</p>
          </div>
          {isCreateOpen ? <FiChevronUp className="h-5 w-5 text-[#2E5C45]" /> : <FiChevronDown className="h-5 w-5 text-[#2E5C45]" />}
        </button>

        {isCreateOpen ? (
          <form onSubmit={createStore} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Store name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" placeholder="Logo URL" value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} />
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={form.kyc_status} onChange={(e) => setForm((f) => ({ ...f, kyc_status: e.target.value }))}>
              <option value="pending">KYC Pending</option>
              <option value="verified">KYC Verified</option>
              <option value="rejected">KYC Rejected</option>
              <option value="not_required">KYC Not Required</option>
            </select>
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.payout_ready} onChange={(e) => setForm((f) => ({ ...f, payout_ready: e.target.checked }))} />
              Payout ready
            </label>
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Owner user UUID (optional)" value={form.owner_user_id} onChange={(e) => setForm((f) => ({ ...f, owner_user_id: e.target.value }))} />
            <button disabled={saving} className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Store'}
            </button>
          </form>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-gray-900">Store Governance</h2>
          <div className="flex gap-2">
            <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Search name or slug" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45]"
              onClick={() => {
                setPage(1);
                loadStores(1, limit);
              }}
            >
              Apply
            </button>
          </div>
        </div>

        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {notice ? (
          <div className={`mb-3 rounded-xl px-3 py-2 text-sm ${noticeType === 'warning' ? 'border border-amber-200 bg-amber-50 text-amber-700' : 'border border-green-200 bg-green-50 text-green-700'}`}>
            {notice}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-gray-500">Loading stores...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Store</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">KYC</th>
                  <th className="py-2 pr-3">Payout</th>
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((store) => (
                  <tr key={store.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{store.name}</div>
                      <div className="text-xs text-gray-500">/{store.slug}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                        value={store.status}
                        onChange={async (e) => {
                          try {
                            await patchStore(store.id, { status: e.target.value });
                            await loadStores(page, limit);
                          } catch (err) {
                            setError(err.message);
                          }
                        }}
                      >
                        <option value="pending">pending</option>
                        <option value="active">active</option>
                        <option value="suspended">suspended</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3 capitalize text-gray-700">{store.kyc_status}</td>
                    <td className="py-2 pr-3 text-gray-700">{store.payout_ready ? 'Ready' : 'Not ready'}</td>
                    <td className="py-2 pr-3 text-gray-600">{new Date(store.created_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-[#2E5C45] px-2 py-1 text-xs font-semibold text-[#2E5C45]" onClick={() => openAssignOwnerModal(store)}>
                          Assign owner
                        </button>
                        <Link href={`/admin/stores/${store.id}`} className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">No stores found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {!loading ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-600">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} stores)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                value={limit}
                onChange={(e) => {
                  const nextLimit = Number(e.target.value);
                  setLimit(nextLimit);
                  setPage(1);
                  loadStores(1, nextLimit);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  const nextPage = Math.max(1, page - 1);
                  setPage(nextPage);
                  loadStores(nextPage, limit);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => {
                  const nextPage = Math.min(meta.totalPages, page + 1);
                  setPage(nextPage);
                  loadStores(nextPage, limit);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
