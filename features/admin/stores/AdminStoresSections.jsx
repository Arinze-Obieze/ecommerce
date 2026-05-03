'use client';

import Link from 'next/link';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import StoreCreationWizard from '@/features/admin/stores/StoreCreationWizard';

export function AssignOwnerModal({
  assignModal,
  assignMode,
  setAssignMode,
  assignValue,
  setAssignValue,
  assignError,
  assigning,
  onClose,
  onSubmit,
  clearAssignError,
}) {
  if (!assignModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-white p-5 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Assign Owner</h3>
          <p className="text-sm text-gray-600">
            Assign an owner to <span className="font-semibold text-gray-800">{assignModal.storeName}</span> by UUID or email.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {['uuid', 'email'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAssignMode(mode);
                  setAssignValue('');
                  clearAssignError('');
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  assignMode === mode ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-700'
                }`}
              >
                {mode === 'uuid' ? 'Use UUID' : 'Use Email'}
              </button>
            ))}
          </div>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder={assignMode === 'uuid' ? 'Owner user UUID' : 'Owner email'}
            value={assignValue}
            onChange={(event) => setAssignValue(event.target.value)}
            type={assignMode === 'uuid' ? 'text' : 'email'}
          />
          <p className="text-xs text-gray-500">
            If the email does not exist, an account is created, assigned as owner, and credentials are emailed.
          </p>
          {assignError ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{assignError}</div> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
              Cancel
            </button>
            <button disabled={assigning} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60">
              {assigning ? 'Assigning...' : 'Assign owner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateStorePanel({ isOpen, onToggle, onSuccess, onError }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-[#f5faf7] px-4 py-3 text-left"
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900">Create Store</h2>
          <p className="text-sm text-gray-600">Select a verified seller to onboard and create a store for.</p>
        </div>
        {isOpen ? <FiChevronUp className="h-5 w-5 text-primary" /> : <FiChevronDown className="h-5 w-5 text-primary" />}
      </button>

      {isOpen ? <StoreCreationWizard onSuccess={onSuccess} onError={onError} /> : null}
    </div>
  );
}

export function StoreGovernancePanel({
  loading,
  error,
  notice,
  noticeType,
  search,
  setSearch,
  status,
  setStatus,
  onApplyFilters,
  items,
  onUpdateStatus,
  onAssignOwner,
  onDeleteStore,
  deletingId,
  meta,
  page,
  limit,
  onLimitChange,
  onPageChange,
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-bold text-gray-900">Store Governance</h2>
        <div className="flex gap-2">
          <input
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Search name or slug"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary" onClick={onApplyFilters}>
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
                      onChange={(event) => onUpdateStatus(store.id, event.target.value)}
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
                      <button className="rounded-lg border border-primary px-2 py-1 text-xs font-semibold text-primary" onClick={() => onAssignOwner(store)}>
                        Assign owner
                      </button>
                      <Link href={`/admin/stores/${store.id}`} className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700">
                        View
                      </Link>
                      <button
                        disabled={deletingId === store.id}
                        onClick={() => onDeleteStore(store.id, store.name)}
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
            <select className="rounded-lg border border-gray-200 px-2 py-1 text-sm" value={limit} onChange={(event) => onLimitChange(Number(event.target.value))}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
