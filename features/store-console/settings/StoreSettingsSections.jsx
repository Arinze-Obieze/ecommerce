'use client';

import AlertBanner from '@/components/store-console/dashboard/AlertBanner';
import { makeStoreUrl } from '@/features/store-console/settings/storeSettings.utils';

export function StoreSettingsIntro() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Store Settings</h2>
      <p className="text-sm text-gray-500">Manage your store identity and storefront profile details.</p>
    </div>
  );
}

export function StoreSettingsMetaCards({ meta, snapshot }) {
  const cards = [
    { label: 'Role', value: meta.role || '-' },
    { label: 'Store Status', value: snapshot?.status || '-' },
    { label: 'KYC / Payout', value: `${snapshot?.kyc_status || 'pending'} / ${snapshot?.payout_ready ? 'Ready' : 'Not ready'}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">{card.label}</p>
          <p className="mt-1 break-words text-sm font-semibold capitalize text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function StoreSettingsForm({
  error,
  notice,
  meta,
  form,
  setForm,
  changed,
  saving,
  uploadingLogo,
  onSave,
  onRefresh,
  onLogoFileChange,
}) {
  return (
    <form onSubmit={onSave} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <AlertBanner type="error" message={error} />
      <AlertBanner type="notice" message={notice} />
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
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Store Slug</span>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={form.slug}
            disabled={!meta.can_edit}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
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
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            maxLength={1000}
          />
        </label>

        <div className="text-sm md:col-span-2">
          <span className="mb-1 block font-semibold text-gray-700">Store Logo</span>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {form.logo_url ? (
                  <img src={form.logo_url} alt={`${form.name || 'Store'} logo`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">No Logo</div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary-soft disabled:opacity-60">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={!meta.can_edit || uploadingLogo}
                    onChange={onLogoFileChange}
                  />
                  {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                </label>
                <button
                  type="button"
                  disabled={!meta.can_edit || uploadingLogo || !form.logo_url}
                  onClick={() => setForm((current) => ({ ...current, logo_url: '' }))}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Use a square JPG, PNG, or WebP image (max 5MB) for best results.</p>
          </div>
        </div>

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
            onChange={(event) => setForm((current) => ({ ...current, low_stock_threshold: event.target.value }))}
            required
          />
          <span className="mt-1 block text-xs text-gray-500">Products at or below this quantity are treated as low stock in inventory.</span>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={!meta.can_edit || !changed || saving || uploadingLogo} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button type="button" onClick={onRefresh} disabled={saving} className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60">
          Refresh
        </button>
      </div>
    </form>
  );
}
