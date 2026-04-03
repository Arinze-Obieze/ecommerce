'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiUser, FiCheckCircle, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

// ─── helpers ────────────────────────────────────────────────────────────────
const toSlug = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const tierColor = (tier) => {
  switch (tier) {
    case 'gold': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'silver': return 'bg-gray-50 text-gray-600 border-gray-200';
    case 'platinum': return 'bg-blue-50 text-blue-700 border-blue-200';
    default: return 'bg-[#f3f8f5] text-[#2E5C45] border-[#dbe7e0]';
  }
};

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

// ─── Create Store Wizard ─────────────────────────────────────────────────────
// step: 'select' | 'confirm' | 'form'
function CreateStoreWizard({ onSuccess, onError }) {
  const [step, setStep] = useState('select');
  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerPage, setSellerPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Load eligible sellers once
  useEffect(() => {
    const load = async () => {
      try {
        setSellersLoading(true);
        const res = await fetch(
          '/api/admin/stores/sellers',
          { cache: 'no-store' }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load sellers');
        setSellers(json.data || []);
      } catch (err) {
        onError(err.message);
      } finally {
        setSellersLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SELLERS_PER_PAGE = 9;

  // Reset to page 1 whenever search changes
  useEffect(() => { setSellerPage(1); }, [sellerSearch]);

  const filteredSellers = sellers.filter((s) => {
    const q = sellerSearch.toLowerCase();
    return (
      !q ||
      s.business_name?.toLowerCase().includes(q) ||
      s.seller_id?.toLowerCase().includes(q) ||
      s.contact_person?.toLowerCase().includes(q)
    );
  });

  const sellerTotalPages = Math.max(1, Math.ceil(filteredSellers.length / SELLERS_PER_PAGE));
  const pagedSellers = filteredSellers.slice(
    (sellerPage - 1) * SELLERS_PER_PAGE,
    sellerPage * SELLERS_PER_PAGE
  );

  const handleSelectSeller = (seller) => {
    setSelectedSeller(seller);
    setStep('confirm');
  };

  const handleConfirm = () => {
    // Pre-populate form from seller data
    setForm({
      name: selectedSeller.seller_id,
      slug: toSlug(selectedSeller.seller_id),
      description: selectedSeller.business_name
        ? `Store for ${selectedSeller.business_name}`
        : '',
      logo_url: '',
      status: 'pending',
      kyc_status: 'pending',
      payout_ready: false,
      owner_user_id: '',
    });
    setStep('form');
  };

  const handleBack = () => {
    if (step === 'confirm') { setStep('select'); setSelectedSeller(null); }
    if (step === 'form') setStep('confirm');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      onError(''); // clear prior errors
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          owner_user_id: form.owner_user_id || null,
          // Pass seller_id so the API / trigger can link back
          seller_id: selectedSeller?.seller_id,
        }),
      });
      const json = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(json.error || 'Failed to create store');
      }

      const ownerEmailStatus = json?.notifications?.ownerEmailStatus || 'skipped';
      const ownerEmail = json?.notifications?.ownerEmail;
      const ownerEmailError = json?.notifications?.ownerEmailError;

      let msg = `Store "${form.name}" created successfully.`;
      let type = 'success';
      if (ownerEmailStatus === 'sent' && ownerEmail) msg += ` Notification sent to ${ownerEmail}.`;
      else if (ownerEmailStatus === 'failed') {
        msg += ` Email failed${ownerEmailError ? `: ${ownerEmailError}` : '.'}`;
        type = 'warning';
      }

      if (res.status === 207) {
        onError(json.error || 'Store created with partial issues');
      }

      onSuccess(msg, type);
      // Reset wizard
      setStep('select');
      setSelectedSeller(null);
      setForm(initialForm);
      // Refresh seller list (seller now has a store_id via trigger)
      const fresh = await fetch(
        '/api/admin/stores/sellers',
        { cache: 'no-store' }
      );
      const freshJson = await fresh.json();
      setSellers(freshJson.data || []);
    } catch (err) {
      onError(err.message || 'Failed to create store');
    } finally {
      setSaving(false);
    }
  };

  // ── Step 1: Seller Selection ───────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-3 text-sm text-gray-600">
            Select a verified, active seller that does not yet have a store. The store will be linked to them automatically.
          </p>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              placeholder="Search by business name, seller ID, or contact..."
              value={sellerSearch}
              onChange={(e) => setSellerSearch(e.target.value)}
            />
          </div>
        </div>

        {sellersLoading ? (
          <p className="py-6 text-center text-sm text-gray-500">Loading eligible sellers...</p>
        ) : filteredSellers.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            {sellerSearch ? 'No sellers match your search.' : 'No eligible sellers found.'}
          </p>
        ) : (
          <div className="space-y-3">
            {/* Results count */}
            <p className="text-xs text-gray-400">
              Showing {Math.min((sellerPage - 1) * SELLERS_PER_PAGE + 1, filteredSellers.length)}–{Math.min(sellerPage * SELLERS_PER_PAGE, filteredSellers.length)} of {filteredSellers.length} eligible sellers
            </p>

            {/* 3-column grid */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {pagedSellers.map((seller) => (
                <button
                  key={seller.id}
                  type="button"
                  onClick={() => handleSelectSeller(seller)}
                  className="group flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:border-[#2E5C45] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 group-hover:text-[#2E5C45] truncate text-sm">
                        {seller.business_name || seller.seller_id || 'Unnamed seller'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate">{seller.seller_id || '—'}</p>
                    </div>
                    <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize ${tierColor(seller.seller_tier_computed)}`}>
                      {seller.seller_tier_computed || seller.tier || 'basic'}
                    </span>
                  </div>
                  {seller.contact_person && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                      <FiUser className="h-3 w-3 shrink-0" /> {seller.contact_person}
                    </span>
                  )}
                  <div className="flex gap-2 text-[11px] text-gray-400">
                    <span>Score: <strong className="text-gray-600">{seller.seller_score ?? '—'}</strong></span>
                    <span>·</span>
                    <span>Commission: <strong className="text-gray-600">{seller.commission_rate != null ? `${seller.commission_rate}%` : '—'}</strong></span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination controls */}
            {sellerTotalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={sellerPage <= 1}
                  onClick={() => setSellerPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: sellerTotalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSellerPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        p === sellerPage
                          ? 'bg-[#2E5C45] text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={sellerPage >= sellerTotalPages}
                  onClick={() => setSellerPage(p => Math.min(sellerTotalPages, p + 1))}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Step 2: Confirmation ───────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="mt-4 space-y-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to seller list
        </button>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-amber-800">Please confirm your selection</p>
              <p className="text-sm text-amber-700">
                You're about to create a store for the seller below. This cannot be easily undone.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#dbe7e0] bg-[#f3f8f5] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-5 w-5 text-[#2E5C45]" />
            <p className="font-bold text-gray-900 text-lg">{selectedSeller.business_name}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Seller ID</p>
              <p className="font-mono font-semibold text-gray-900">{selectedSeller.seller_id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Contact Person</p>
              <p className="font-semibold text-gray-900">{selectedSeller.contact_person || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Business Type</p>
              <p className="capitalize font-semibold text-gray-900">{selectedSeller.business_type || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Tier</p>
              <p className="capitalize font-semibold text-gray-900">{selectedSeller.seller_tier_computed || selectedSeller.tier || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
              <p className="capitalize font-semibold text-green-700">{selectedSeller.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Verification</p>
              <p className="capitalize font-semibold text-green-700">{selectedSeller.verification_status}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 pt-1">
            Store name will be pre-filled as: <span className="font-mono font-semibold text-gray-700">{selectedSeller.seller_id}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-[#2E5C45] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#254a38]"
          >
            Yes, create store for this seller
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Pre-filled Form ────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="mt-4 space-y-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to confirmation
        </button>

        <div className="rounded-xl border border-[#dbe7e0] bg-[#f3f8f5] px-4 py-2.5 text-sm text-gray-700">
          Creating store for: <span className="font-bold text-[#2E5C45]">{selectedSeller.business_name}</span>{' '}
          <span className="font-mono text-gray-500">({selectedSeller.seller_id})</span>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2 grid grid-cols-1 gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Store Name <span className="text-red-500">*</span></label>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              placeholder="Store name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-400">Pre-filled with seller ID. You may edit if needed.</p>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</label>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              placeholder="url-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Logo URL</label>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              placeholder="https://..."
              value={form.logo_url}
              onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              placeholder="Store description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</label>
            <select
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">KYC Status</label>
            <select
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              value={form.kyc_status}
              onChange={(e) => setForm((f) => ({ ...f, kyc_status: e.target.value }))}
            >
              <option value="pending">KYC Pending</option>
              <option value="verified">KYC Verified</option>
              <option value="rejected">KYC Rejected</option>
              <option value="not_required">KYC Not Required</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Owner User UUID (optional)</label>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#2E5C45] focus:outline-none focus:ring-1 focus:ring-[#2E5C45]"
              placeholder="Leave blank if unknown"
              value={form.owner_user_id}
              onChange={(e) => setForm((f) => ({ ...f, owner_user_id: e.target.value }))}
            />
          </div>

          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={form.payout_ready}
                onChange={(e) => setForm((f) => ({ ...f, payout_ready: e.target.checked }))}
                className="h-4 w-4 rounded accent-[#2E5C45]"
              />
              Payout ready
            </label>
          </div>

          <div className="md:col-span-2 flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              disabled={saving}
              className="rounded-xl bg-[#2E5C45] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60"
            >
              {saving ? 'Creating store...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
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
  const [assignModal, setAssignModal] = useState({ open: false, storeId: '', storeName: '' });
  const [assignMode, setAssignMode] = useState('uuid');
  const [assignValue, setAssignValue] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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

  const deleteStore = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the store "${name}"? This will also delete all associated products and CANNOT be undone.`)) return;
    try {
      setDeletingId(id);
      setError('');
      setNotice('');
      const res = await fetch(`/api/admin/stores/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete store');
      setNotice(`Store "${name}" and its products were successfully deleted.`);
      setNoticeType('success');
      await loadStores(page, limit);
    } catch (err) {
      setError(err.message || 'Failed to delete store');
    } finally {
      setDeletingId(null);
    }
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
    const payload = assignMode === 'uuid' ? { user_id: value } : { email: value.toLowerCase() };
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
        ? `Owner assigned with role "${ownerRole}". New account created${ownerEmail ? ` for ${ownerEmail}` : ''}.`
        : `Owner assigned with role "${ownerRole}" successfully.`;
      let nextNoticeType = 'success';
      if (emailStatus === 'sent' && ownerEmail) nextNotice += ` Email sent to ${ownerEmail}.`;
      if (emailStatus === 'failed') {
        nextNotice += ` Email failed${json?.data?.email_error ? `: ${json.data.email_error}` : '.'}`;
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
      {/* Assign Owner Modal */}
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
                  onClick={() => { setAssignMode('uuid'); setAssignValue(''); setAssignError(''); }}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${assignMode === 'uuid' ? 'border-[#2E5C45] bg-[#2E5C45] text-white' : 'border-gray-200 text-gray-700'}`}
                >
                  Use UUID
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignMode('email'); setAssignValue(''); setAssignError(''); }}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${assignMode === 'email' ? 'border-[#2E5C45] bg-[#2E5C45] text-white' : 'border-gray-200 text-gray-700'}`}
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
                If the email does not exist, an account is created, assigned as owner, and credentials are emailed.
              </p>
              {assignError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{assignError}</div>
              ) : null}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeAssignOwnerModal} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                <button disabled={assigning} className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60">
                  {assigning ? 'Assigning...' : 'Assign owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Create Store Panel */}
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setIsCreateOpen((v) => !v)}
          aria-expanded={isCreateOpen}
          className="flex w-full items-center justify-between rounded-xl border border-[#dbe7e0] bg-[#f5faf7] px-4 py-3 text-left"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Store</h2>
            <p className="text-sm text-gray-600">Select a verified seller to onboard and create a store for.</p>
          </div>
          {isCreateOpen ? <FiChevronUp className="h-5 w-5 text-[#2E5C45]" /> : <FiChevronDown className="h-5 w-5 text-[#2E5C45]" />}
        </button>

        {isCreateOpen ? (
          <CreateStoreWizard
            onSuccess={(msg, type) => {
              setNotice(msg);
              setNoticeType(type);
              loadStores(1, limit);
            }}
            onError={(msg) => {
              if (msg) setError(msg);
            }}
          />
        ) : null}
      </div>

      {/* Store Governance Table */}
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-gray-900">Store Governance</h2>
          <div className="flex gap-2">
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder="Search name or slug"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45]"
              onClick={() => { setPage(1); loadStores(1, limit); }}
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
                        <button
                          disabled={deletingId === store.id}
                          onClick={() => deleteStore(store.id, store.name)}
                          className="rounded-lg border border-red-500 px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === store.id ? 'Deleting...' : 'Delete'}
                        </button>
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
                onClick={() => { const p = Math.max(1, page - 1); setPage(p); loadStores(p, limit); }}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => { const p = Math.min(meta.totalPages, page + 1); setPage(p); loadStores(p, limit); }}
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