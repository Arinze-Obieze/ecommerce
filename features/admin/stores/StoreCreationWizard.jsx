'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiSearch, FiUser } from 'react-icons/fi';
import { initialStoreForm, tierColor, toSlug } from '@/features/admin/stores/adminStores.utils';

const SELLERS_PER_PAGE = 9;

export default function StoreCreationWizard({ onSuccess, onError }) {
  const [step, setStep] = useState('select');
  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerPage, setSellerPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [form, setForm] = useState(initialStoreForm);
  const [saving, setSaving] = useState(false);

  const loadSellers = async () => {
    try {
      setSellersLoading(true);
      const response = await fetch('/api/admin/stores/sellers', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load sellers');
      setSellers(json.data || []);
    } catch (err) {
      onError(err.message || 'Failed to load sellers');
    } finally {
      setSellersLoading(false);
    }
  };

  useEffect(() => {
    void loadSellers();
  }, []);

  useEffect(() => {
    setSellerPage(1);
  }, [sellerSearch]);

  const filteredSellers = useMemo(() => {
    const query = sellerSearch.toLowerCase();
    return sellers.filter((seller) => {
      return (
        !query ||
        seller.business_name?.toLowerCase().includes(query) ||
        seller.seller_id?.toLowerCase().includes(query) ||
        seller.contact_person?.toLowerCase().includes(query)
      );
    });
  }, [sellerSearch, sellers]);

  const sellerTotalPages = Math.max(1, Math.ceil(filteredSellers.length / SELLERS_PER_PAGE));
  const pagedSellers = filteredSellers.slice((sellerPage - 1) * SELLERS_PER_PAGE, sellerPage * SELLERS_PER_PAGE);

  const handleSelectSeller = (seller) => {
    setSelectedSeller(seller);
    setStep('confirm');
  };

  const handleConfirmSeller = () => {
    setForm({
      name: selectedSeller.seller_id,
      slug: toSlug(selectedSeller.seller_id),
      description: selectedSeller.business_name ? `Store for ${selectedSeller.business_name}` : '',
      logo_url: '',
      status: 'pending',
      kyc_status: 'pending',
      payout_ready: false,
      owner_user_id: '',
    });
    setStep('form');
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setSelectedSeller(null);
      setStep('select');
      return;
    }
    if (step === 'form') {
      setStep('confirm');
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      onError('');
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          owner_user_id: form.owner_user_id || null,
          seller_id: selectedSeller?.seller_id,
        }),
      });
      const json = await response.json();
      if (!response.ok && response.status !== 207) {
        throw new Error(json.error || 'Failed to create store');
      }

      const ownerEmailStatus = json?.notifications?.ownerEmailStatus || 'skipped';
      const ownerEmail = json?.notifications?.ownerEmail;
      const ownerEmailError = json?.notifications?.ownerEmailError;

      let message = `Store "${form.name}" created successfully.`;
      let type = 'success';
      if (ownerEmailStatus === 'sent' && ownerEmail) message += ` Notification sent to ${ownerEmail}.`;
      if (ownerEmailStatus === 'failed') {
        message += ` Email failed${ownerEmailError ? `: ${ownerEmailError}` : '.'}`;
        type = 'warning';
      }

      if (response.status === 207) {
        onError(json.error || 'Store created with partial issues');
      }

      onSuccess(message, type);
      setStep('select');
      setSelectedSeller(null);
      setForm(initialStoreForm);
      await loadSellers();
    } catch (err) {
      onError(err.message || 'Failed to create store');
    } finally {
      setSaving(false);
    }
  };

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
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search by business name, seller ID, or contact..."
              value={sellerSearch}
              onChange={(event) => setSellerSearch(event.target.value)}
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
            <p className="text-xs text-gray-400">
              Showing {Math.min((sellerPage - 1) * SELLERS_PER_PAGE + 1, filteredSellers.length)}-
              {Math.min(sellerPage * SELLERS_PER_PAGE, filteredSellers.length)} of {filteredSellers.length} eligible sellers
            </p>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {pagedSellers.map((seller) => (
                <button
                  key={seller.id}
                  type="button"
                  onClick={() => handleSelectSeller(seller)}
                  className="group flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900 group-hover:text-primary">
                        {seller.business_name || seller.seller_id || 'Unnamed seller'}
                      </p>
                      <p className="truncate font-mono text-xs text-gray-400">{seller.seller_id || '—'}</p>
                    </div>
                    <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize ${tierColor(seller.seller_tier_computed)}`}>
                      {seller.seller_tier_computed || seller.tier || 'basic'}
                    </span>
                  </div>
                  {seller.contact_person ? (
                    <span className="flex items-center gap-1 truncate text-xs text-gray-500">
                      <FiUser className="h-3 w-3 shrink-0" /> {seller.contact_person}
                    </span>
                  ) : null}
                  <div className="flex gap-2 text-[11px] text-gray-400">
                    <span>Score: <strong className="text-gray-600">{seller.seller_score ?? '—'}</strong></span>
                    <span>·</span>
                    <span>Commission: <strong className="text-gray-600">{seller.commission_rate != null ? `${seller.commission_rate}%` : '—'}</strong></span>
                  </div>
                </button>
              ))}
            </div>

            {sellerTotalPages > 1 ? (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={sellerPage <= 1}
                  onClick={() => setSellerPage((current) => Math.max(1, current - 1))}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: sellerTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setSellerPage(pageNumber)}
                      className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                        pageNumber === sellerPage ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={sellerPage >= sellerTotalPages}
                  onClick={() => setSellerPage((current) => Math.min(sellerTotalPages, current + 1))}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  if (step === 'confirm' && selectedSeller) {
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
                You&apos;re about to create a store for the seller below. This cannot be easily undone.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-primary-soft p-5">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-gray-900">{selectedSeller.business_name}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <StoreInfo label="Seller ID" value={selectedSeller.seller_id} mono />
            <StoreInfo label="Contact Person" value={selectedSeller.contact_person || '—'} />
            <StoreInfo label="Business Type" value={selectedSeller.business_type || '—'} capitalize />
            <StoreInfo label="Tier" value={selectedSeller.seller_tier_computed || selectedSeller.tier || '—'} capitalize />
            <StoreInfo label="Status" value={selectedSeller.status} capitalize emphasis="text-green-700" />
            <StoreInfo label="Verification" value={selectedSeller.verification_status} capitalize emphasis="text-green-700" />
          </div>
          <p className="pt-1 text-xs text-gray-500">
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
            onClick={handleConfirmSeller}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Yes, create store for this seller
          </button>
        </div>
      </div>
    );
  }

  if (step === 'form' && selectedSeller) {
    return (
      <div className="mt-4 space-y-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to confirmation
        </button>

        <div className="rounded-xl border border-border bg-primary-soft px-4 py-2.5 text-sm text-gray-700">
          Creating store for: <span className="font-bold text-primary">{selectedSeller.business_name}</span>{' '}
          <span className="font-mono text-gray-500">({selectedSeller.seller_id})</span>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="grid grid-cols-1 gap-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Store name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <p className="text-xs text-gray-400">Pre-filled with seller ID. You may edit if needed.</p>
          </div>

          <StoreTextInput label="Slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} mono />
          <StoreTextInput label="Logo URL" value={form.logo_url} onChange={(value) => setForm((current) => ({ ...current, logo_url: value }))} />

          <div className="grid grid-cols-1 gap-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Store description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </div>

          <StoreSelect
            label="Status"
            value={form.status}
            onChange={(value) => setForm((current) => ({ ...current, status: value }))}
            options={[
              ['pending', 'Pending'],
              ['active', 'Active'],
              ['suspended', 'Suspended'],
            ]}
          />
          <StoreSelect
            label="KYC Status"
            value={form.kyc_status}
            onChange={(value) => setForm((current) => ({ ...current, kyc_status: value }))}
            options={[
              ['pending', 'KYC Pending'],
              ['verified', 'KYC Verified'],
              ['rejected', 'KYC Rejected'],
              ['not_required', 'KYC Not Required'],
            ]}
          />

          <StoreTextInput
            label="Owner User UUID (optional)"
            value={form.owner_user_id}
            onChange={(value) => setForm((current) => ({ ...current, owner_user_id: value }))}
            mono
            placeholder="Leave blank if unknown"
          />

          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={form.payout_ready}
                onChange={(event) => setForm((current) => ({ ...current, payout_ready: event.target.checked }))}
                className="h-4 w-4 rounded accent-primary"
              />
              Payout ready
            </label>
          </div>

          <div className="flex gap-2 pt-2 md:col-span-2">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
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

function StoreInfo({ label, value, mono = false, capitalize = false, emphasis = '' }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''} ${emphasis} font-semibold text-gray-900`}>
        {value}
      </p>
    </div>
  );
}

function StoreTextInput({ label, value, onChange, mono = false, placeholder = '' }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      <input
        className={`rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${mono ? 'font-mono' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function StoreSelect({ label, value, onChange, options }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      <select
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
