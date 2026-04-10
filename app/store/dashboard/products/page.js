'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FiArchive,
  FiCheckSquare,
  FiChevronRight,
  FiCopy,
  FiEdit3,
  FiEye,
  FiLayers,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSquare,
  FiTrash2,
} from 'react-icons/fi';

const STATUS_OPTIONS = ['all', 'draft', 'pending_review', 'approved', 'rejected', 'archived'];

function getStatusBadgeClasses(status) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending_review':
      return 'bg-amber-100 text-amber-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'archived':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

function describeDraft(draft) {
  if (!draft?.state) return 'Unfinished product draft';
  const parts = [
    draft.state.productName || 'Untitled draft',
    draft.state.subcategory || draft.state.category || '',
  ].filter(Boolean);
  return parts.join(' • ');
}

function formatMoney(value) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

function compactDate(value) {
  if (!value) return 'Not submitted';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ActionIconButton({ onClick, disabled, label, children, tone = 'default' }) {
  const tones = {
    default: 'border-gray-200 text-gray-700 hover:bg-gray-50',
    brand: 'border-[#2E5C45]/20 text-[#2E5C45] hover:bg-[#f3f8f5]',
    danger: 'border-red-200 text-red-700 hover:bg-red-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function BulkButton({ onClick, disabled, label, tone = 'default' }) {
  const tones = {
    default: 'border-gray-200 text-gray-700 hover:bg-gray-50',
    brand: 'border-[#2E5C45] text-[#2E5C45] hover:bg-[#f3f8f5]',
    danger: 'border-red-200 text-red-700 hover:bg-red-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

export default function StoreProductsPage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actingId, setActingId] = useState('');
  const [actingType, setActingType] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActing, setBulkActing] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('moderationStatus', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/store/products?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load products');
      setRows(json.data || []);
      setSummary(json.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    try {
      setDraftLoading(true);
      const res = await fetch('/api/store/products/draft', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load draft');
      setPendingDraft(json.data || null);
    } catch {
      setPendingDraft(null);
    } finally {
      setDraftLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter]);

  useEffect(() => {
    void loadDraft();
  }, []);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => rows.some((row) => row.id === id)));
  }, [rows]);

  const counts = useMemo(() => summary || {}, [summary]);
  const draftRows = useMemo(() => rows.filter((row) => row.moderation_status === 'draft'), [rows]);
  const rejectedRows = useMemo(() => rows.filter((row) => row.moderation_status === 'rejected'), [rows]);
  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.includes(row.id)), [rows, selectedIds]);
  const selectedArchivedCount = selectedRows.filter((row) => row.moderation_status === 'archived').length;
  const selectedDeletableCount = selectedRows.filter((row) => ['draft', 'rejected', 'archived'].includes(row.moderation_status)).length;

  const summarizeBulkDiscounts = (tiers) => {
    if (!Array.isArray(tiers) || tiers.length === 0) return 'No bulk offer';
    const highestTier = [...tiers].sort((a, b) => b.minimum_quantity - a.minimum_quantity)[0];
    return `${highestTier.discount_percent}% @ ${highestTier.minimum_quantity}+`;
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    ));
  };

  const toggleSelectAllVisible = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(rows.map((row) => row.id));
  };

  const handleRowAction = async (row, action) => {
    try {
      setActingId(row.id);
      setActingType(action);
      setError('');
      setNotice('');

      let response;
      if (action === 'duplicate') {
        response = await fetch('/api/store/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'bulk_duplicate', ids: [row.id] }),
        });
      } else if (action === 'resubmit') {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submit_for_review: true }),
        });
      } else if (action === 'archive') {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archive: true }),
        });
      } else if (action === 'unarchive') {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archive: false }),
        });
      } else if (action === 'delete') {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: 'DELETE',
        });
      } else {
        throw new Error('Unsupported action');
      }

      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || 'Action failed');

      if (action === 'duplicate') {
        const createdId = json.data?.created?.[0]?.id;
        setNotice('Product duplicated.');
        if (createdId) {
          window.location.href = `/store/dashboard/products/${createdId}`;
          return;
        }
      } else if (action === 'resubmit') {
        setNotice('Product submitted for review.');
      } else if (action === 'archive') {
        setNotice('Product archived.');
      } else if (action === 'unarchive') {
        setNotice('Product moved back to draft.');
      } else {
        setNotice('Product deleted.');
      }

      await load();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActingId('');
      setActingType('');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;

    try {
      setBulkActing(action);
      setError('');
      setNotice('');

      const res = await fetch('/api/store/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Bulk action failed');

      if (action === 'bulk_duplicate') {
        setNotice(`${json.data?.count || 0} product(s) duplicated.`);
      } else if (action === 'bulk_archive') {
        setNotice(`${json.data?.count || 0} product(s) archived.`);
      } else if (action === 'bulk_unarchive') {
        setNotice(`${json.data?.count || 0} product(s) moved back to draft.`);
      } else if (action === 'bulk_delete') {
        const skipped = Number(json.data?.skipped || 0);
        setNotice(skipped > 0
          ? `${json.data?.count || 0} product(s) deleted. ${skipped} could not be deleted because they are still approved or pending.`
          : `${json.data?.count || 0} product(s) deleted.`);
      }

      setSelectedIds([]);
      await load();
    } catch (err) {
      setError(err.message || 'Bulk action failed');
    } finally {
      setBulkActing('');
    }
  };

  const discardPendingDraft = async () => {
    try {
      setError('');
      setNotice('');
      const res = await fetch('/api/store/products/draft', { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to discard draft');
      setPendingDraft(null);
      setNotice('Draft discarded. You can start a fresh product now.');
    } catch (err) {
      setError(err.message || 'Failed to discard draft');
    }
  };

  const openDraftFilter = () => {
    setStatusFilter('draft');
    setSelectedIds([]);
  };

  const openRejectedFilter = () => {
    setStatusFilter('rejected');
    setSelectedIds([]);
  };

  const renderProductMetaChips = (row) => (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">/{row.slug}</span>
      {row.sku ? (
        <span className="rounded-full bg-[#f3f8f5] px-2.5 py-1 font-mono text-[11px] font-medium text-[#2E5C45]">{row.sku}</span>
      ) : null}
    </div>
  );

  const renderRowActions = (row, mobile = false) => {
    const actionBusy = actingId === row.id;
    const iconSize = mobile ? 16 : 15;

    return (
      <div className={`flex flex-wrap ${mobile ? 'gap-2' : 'gap-1.5'}`}>
        <ActionIconButton label="Open product" onClick={() => { window.location.href = `/store/dashboard/products/${row.id}`; }}>
          <FiEye size={iconSize} />
        </ActionIconButton>
        <ActionIconButton
          label={actionBusy && actingType === 'duplicate' ? 'Duplicating product' : 'Duplicate product'}
          onClick={() => handleRowAction(row, 'duplicate')}
          disabled={actionBusy}
          tone="brand"
        >
          <FiCopy size={iconSize} />
        </ActionIconButton>
        {row.moderation_status === 'archived' ? (
          <ActionIconButton
            label={actionBusy && actingType === 'unarchive' ? 'Unarchiving product' : 'Unarchive product'}
            onClick={() => handleRowAction(row, 'unarchive')}
            disabled={actionBusy}
          >
            <FiRefreshCw size={iconSize} />
          </ActionIconButton>
        ) : (
          <ActionIconButton
            label={actionBusy && actingType === 'archive' ? 'Archiving product' : 'Archive product'}
            onClick={() => handleRowAction(row, 'archive')}
            disabled={actionBusy}
            tone="danger"
          >
            <FiArchive size={iconSize} />
          </ActionIconButton>
        )}
        {(row.moderation_status === 'draft' || row.moderation_status === 'rejected') ? (
          <ActionIconButton
            label={actionBusy && actingType === 'resubmit' ? 'Submitting product' : 'Submit for review'}
            onClick={() => handleRowAction(row, 'resubmit')}
            disabled={actionBusy}
            tone="brand"
          >
            <FiSend size={iconSize} />
          </ActionIconButton>
        ) : null}
        {['draft', 'rejected', 'archived'].includes(row.moderation_status) ? (
          <ActionIconButton
            label={actionBusy && actingType === 'delete' ? 'Deleting product' : 'Delete product'}
            onClick={() => handleRowAction(row, 'delete')}
            disabled={actionBusy}
            tone="danger"
          >
            <FiTrash2 size={iconSize} />
          </ActionIconButton>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500">Manage drafts, review queues, bulk actions, and seller-side edits without fighting the layout on mobile.</p>
          </div>
          <Link href="./products/new" className="inline-flex items-center justify-center rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#254a38]">
            Create Product
          </Link>
        </div>
      </div>

      {!draftLoading && pendingDraft ? (
        <div className="rounded-2xl border border-[#cfe1d7] bg-gradient-to-r from-[#f4fbf7] via-white to-[#eef7f1] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2E5C45]">Saved draft</p>
              <h3 className="mt-1 text-lg font-bold text-gray-900">Resume your unfinished create flow before starting something new.</h3>
              <p className="mt-2 text-sm text-gray-600">{describeDraft(pendingDraft)}</p>
              <p className="mt-1 text-sm text-gray-500">
                Saved on step {pendingDraft.currentStep || 1}
                {pendingDraft.updatedAt ? ` • Updated ${new Date(pendingDraft.updatedAt).toLocaleString()}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={discardPendingDraft}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Start fresh
              </button>
              <Link href="./products/new/step-1" className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38]">
                Resume draft
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ['Total', counts.total || 0],
          ['Draft', counts.draft || 0],
          ['Pending', counts.pending_review || 0],
          ['Approved', counts.approved || 0],
          ['Rejected', counts.rejected || 0],
          ['Archived', counts.archived || 0],
        ].map(([label, value]) => (
          <button
            key={label}
            type="button"
            onClick={() => setStatusFilter(label.toLowerCase() === 'total' ? 'all' : label.toLowerCase().replace('pending', 'pending_review'))}
            className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-3 text-center shadow-sm transition hover:border-[#b8d0c4]"
          >
            <p className="text-xs uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#2E5C45]">{value}</p>
          </button>
        ))}
      </div>

      {statusFilter === 'all' && (draftRows.length > 0 || rejectedRows.length > 0) ? (
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Draft workbench</h3>
              <p className="mt-1 text-sm text-gray-500">When you have a long backlog, start here. Drafts and rejected products stay visible as a focused work queue instead of disappearing inside the full catalog.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={openDraftFilter} className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45] hover:bg-[#f3f8f5]">
                View all {counts.draft || 0} drafts
              </button>
              {(counts.rejected || 0) > 0 ? (
                <button type="button" onClick={openRejectedFilter} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                  Review {counts.rejected || 0} rejected
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...draftRows, ...rejectedRows.filter((row) => !draftRows.some((draft) => draft.id === row.id))].slice(0, 6).map((row) => (
              <div key={row.id} className="rounded-2xl border border-[#dbe7e0] bg-[#fbfcfb] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/store/dashboard/products/${row.id}`} className="block truncate text-sm font-bold text-gray-900 hover:text-[#2E5C45]">
                      {row.name}
                    </Link>
                    {renderProductMetaChips(row)}
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusBadgeClasses(row.moderation_status)}`}>
                    {row.moderation_status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>{formatMoney(row.discount_price ?? row.price)}</span>
                  <span>{row.stock_quantity} in stock</span>
                </div>
                {row.rejection_reason ? (
                  <p className="mt-3 line-clamp-2 text-xs text-red-700">{row.rejection_reason}</p>
                ) : (
                  <p className="mt-3 text-xs text-gray-500">{compactDate(row.submitted_at)}</p>
                )}
                <div className="mt-4 flex justify-between">
                  {renderRowActions(row, true)}
                  <Link href={`/store/dashboard/products/${row.id}`} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-[#2E5C45] hover:bg-[#f3f8f5]">
                    Edit
                    <FiChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Catalog queue</h3>
              <p className="text-sm text-gray-500">Use checkboxes for batch work, or tap the action icons for one-off changes.</p>
            </div>
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {selectedIds.length === rows.length && rows.length > 0 ? <FiCheckSquare size={16} /> : <FiSquare size={16} />}
              {selectedIds.length === rows.length && rows.length > 0 ? 'Clear visible selection' : 'Select visible'}
            </button>
          </div>

          <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_auto]">
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500">
              <FiSearch size={16} />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="Search by name or slug"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void load();
                }}
              />
            </label>
            <button type="button" onClick={load} className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45]">
              Apply
            </button>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-[#cfe1d7] bg-[#f6faf7] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedIds.length} selected</p>
                <p className="text-xs text-gray-500">Archive, duplicate, unarchive, or delete several products at once.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <BulkButton onClick={() => handleBulkAction('bulk_duplicate')} disabled={Boolean(bulkActing)} label={bulkActing === 'bulk_duplicate' ? 'Duplicating...' : 'Duplicate'} tone="brand" />
                <BulkButton onClick={() => handleBulkAction('bulk_archive')} disabled={Boolean(bulkActing)} label={bulkActing === 'bulk_archive' ? 'Archiving...' : 'Archive'} />
                {selectedArchivedCount > 0 ? (
                  <BulkButton onClick={() => handleBulkAction('bulk_unarchive')} disabled={Boolean(bulkActing)} label={bulkActing === 'bulk_unarchive' ? 'Unarchiving...' : 'Unarchive'} />
                ) : null}
                <BulkButton
                  onClick={() => handleBulkAction('bulk_delete')}
                  disabled={Boolean(bulkActing) || selectedDeletableCount === 0}
                  label={bulkActing === 'bulk_delete' ? 'Deleting...' : `Delete${selectedDeletableCount !== selectedIds.length ? ` (${selectedDeletableCount} eligible)` : ''}`}
                  tone="danger"
                />
              </div>
            </div>
          </div>
        ) : null}

        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}

        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
            No products found for this filter.
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {rows.map((row) => {
                const selected = selectedIds.includes(row.id);
                return (
                  <div key={row.id} className={`rounded-2xl border p-4 shadow-sm transition ${selected ? 'border-[#2E5C45] bg-[#f7fbf8]' : 'border-[#dbe7e0] bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelect(row.id)}
                        className="mt-0.5 text-[#2E5C45]"
                        aria-label={selected ? 'Deselect product' : 'Select product'}
                      >
                        {selected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/store/dashboard/products/${row.id}`} className="block truncate text-sm font-bold text-gray-900 hover:text-[#2E5C45]">
                              {row.name}
                            </Link>
                            {renderProductMetaChips(row)}
                          </div>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusBadgeClasses(row.moderation_status)}`}>
                            {row.moderation_status}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-xl bg-gray-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">Price</p>
                            <p className="mt-1 font-semibold text-gray-900">{formatMoney(row.discount_price ?? row.price)}</p>
                          </div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">Stock</p>
                            <p className="mt-1 font-semibold text-gray-900">{row.stock_quantity}</p>
                          </div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">Media</p>
                            <p className="mt-1 font-semibold text-gray-900">{(row.image_urls?.length || 0)} img / {(row.video_urls?.length || 0)} vid</p>
                          </div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">Submitted</p>
                            <p className="mt-1 font-semibold text-gray-900">{compactDate(row.submitted_at)}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-xs text-gray-500">{summarizeBulkDiscounts(row.bulk_discount_tiers)}</p>
                          {renderRowActions(row, true)}
                        </div>

                        {row.rejection_reason ? <p className="mt-3 text-xs text-red-700">{row.rejection_reason}</p> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-3">Select</th>
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Price</th>
                    <th className="py-2 pr-3">Stock</th>
                    <th className="py-2 pr-3">Bulk</th>
                    <th className="py-2 pr-3">Media</th>
                    <th className="py-2 pr-3">Submitted</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const selected = selectedIds.includes(row.id);
                    return (
                      <tr key={row.id} className={`border-b border-gray-50 align-top ${selected ? 'bg-[#f7fbf8]' : ''}`}>
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            onClick={() => toggleSelect(row.id)}
                            className="text-[#2E5C45]"
                            aria-label={selected ? 'Deselect product' : 'Select product'}
                          >
                            {selected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                          </button>
                        </td>
                        <td className="py-3 pr-3">
                          <Link href={`/store/dashboard/products/${row.id}`} className="font-semibold text-gray-900 hover:text-[#2E5C45]">
                            {row.name}
                          </Link>
                          {renderProductMetaChips(row)}
                          {row.rejection_reason ? <div className="mt-2 max-w-xs text-xs text-red-700">{row.rejection_reason}</div> : null}
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(row.moderation_status)}`}>
                            {row.moderation_status}
                          </span>
                          <div className="mt-2 text-xs text-gray-500">{row.is_active ? 'Visible to buyers' : 'Hidden from buyers'}</div>
                        </td>
                        <td className="py-3 pr-3 text-gray-900">{formatMoney(row.discount_price ?? row.price)}</td>
                        <td className="py-3 pr-3">{row.stock_quantity}</td>
                        <td className="py-3 pr-3">{summarizeBulkDiscounts(row.bulk_discount_tiers)}</td>
                        <td className="py-3 pr-3">{(row.image_urls?.length || 0)} img / {(row.video_urls?.length || 0)} vid</td>
                        <td className="py-3 pr-3">{compactDate(row.submitted_at)}</td>
                        <td className="py-3 pr-3">{renderRowActions(row)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selectedIds.length > 0 ? (
        <div className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-[#cfe1d7] bg-white/95 p-3 shadow-xl backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{selectedIds.length} selected</p>
              <p className="text-xs text-gray-500">Bulk actions for your current selection</p>
            </div>
            <div className="flex gap-2">
              <ActionIconButton label="Bulk duplicate" onClick={() => handleBulkAction('bulk_duplicate')} disabled={Boolean(bulkActing)} tone="brand">
                <FiCopy size={16} />
              </ActionIconButton>
              <ActionIconButton label="Bulk archive" onClick={() => handleBulkAction('bulk_archive')} disabled={Boolean(bulkActing)}>
                <FiArchive size={16} />
              </ActionIconButton>
              <ActionIconButton label="Bulk unarchive" onClick={() => handleBulkAction('bulk_unarchive')} disabled={Boolean(bulkActing) || selectedArchivedCount === 0}>
                <FiRefreshCw size={16} />
              </ActionIconButton>
              <ActionIconButton label="Bulk delete" onClick={() => handleBulkAction('bulk_delete')} disabled={Boolean(bulkActing) || selectedDeletableCount === 0} tone="danger">
                <FiTrash2 size={16} />
              </ActionIconButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
