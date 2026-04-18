"use client";

import Link from "next/link";
import { FiArchive, FiChevronRight, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { ActionIconButton } from "./ProductsActionButtons";
import { compactDate, describeDraft, formatMoney, getStatusBadgeClasses } from "../_lib/products-utils";

export function ProductsHeaderCard() {
  return (
    <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            Manage drafts, review queues, bulk actions, and seller-side edits
            without fighting the layout on mobile.
          </p>
        </div>
        <Link
          href="./products/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#254a38]"
        >
          Create Product
        </Link>
      </div>
    </div>
  );
}

export function ProductsPendingDraftBanner({ draftLoading, pendingDraft, onDiscard }) {
  if (draftLoading || !pendingDraft) return null;

  return (
    <div className="rounded-2xl border border-[#cfe1d7] bg-gradient-to-r from-[#f4fbf7] via-white to-[#eef7f1] p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2E5C45]">
            Saved draft
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">
            Resume your unfinished create flow before starting something
            new.
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {describeDraft(pendingDraft)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Saved on step {pendingDraft.currentStep || 1}
            {pendingDraft.updatedAt
              ? ` • Updated ${new Date(pendingDraft.updatedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Start fresh
          </button>
          <Link
            href="./products/new/step-1"
            className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38]"
          >
            Resume draft
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProductsSummaryCards({ counts, onSelectStatus }) {
  const cards = [
    ["Total", counts.total || 0],
    ["Draft", counts.draft || 0],
    ["Pending", counts.pending_review || 0],
    ["Approved", counts.approved || 0],
    ["Rejected", counts.rejected || 0],
    ["Archived", counts.archived || 0],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
      {cards.map(([label, value]) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelectStatus(label)}
          className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-3 text-center shadow-sm transition hover:border-[#b8d0c4]"
        >
          <p className="text-xs uppercase text-gray-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-[#2E5C45]">{value}</p>
        </button>
      ))}
    </div>
  );
}

export function ProductsDraftWorkbench({
  statusFilter,
  draftRows,
  rejectedRows,
  counts,
  onOpenDraftFilter,
  onOpenRejectedFilter,
  renderProductMetaChips,
  renderRowActions,
}) {
  if (!(statusFilter === "all" && (draftRows.length > 0 || rejectedRows.length > 0))) return null;

  return (
    <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Draft workbench
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            When you have a long backlog, start here. Drafts and rejected
            products stay visible as a focused work queue instead of
            disappearing inside the full catalog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenDraftFilter}
            className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45] hover:bg-[#f3f8f5]"
          >
            View all {counts.draft || 0} drafts
          </button>
          {(counts.rejected || 0) > 0 ? (
            <button
              type="button"
              onClick={onOpenRejectedFilter}
              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Review {counts.rejected || 0} rejected
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          ...draftRows,
          ...rejectedRows.filter(
            (row) => !draftRows.some((draft) => draft.id === row.id),
          ),
        ]
          .slice(0, 6)
          .map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-[#dbe7e0] bg-[#fbfcfb] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/store/dashboard/products/${row.id}`}
                    className="block truncate text-sm font-bold text-gray-900 hover:text-[#2E5C45]"
                  >
                    {row.name}
                  </Link>
                  {renderProductMetaChips(row)}
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusBadgeClasses(row.moderation_status)}`}
                >
                  {row.moderation_status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <span>{formatMoney(row.discount_price ?? row.price)}</span>
                <span>{row.stock_quantity} in stock</span>
              </div>
              {row.rejection_reason ? (
                <p className="mt-3 line-clamp-2 text-xs text-red-700">
                  {row.rejection_reason}
                </p>
              ) : (
                <p className="mt-3 text-xs text-gray-500">
                  {compactDate(row.submitted_at)}
                </p>
              )}
              <div className="mt-4 flex justify-between">
                {renderRowActions(row, true)}
                <Link
                  href={`/store/dashboard/products/${row.id}`}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-[#2E5C45] hover:bg-[#f3f8f5]"
                >
                  View
                  <FiChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export function ProductsMobileBulkBar({
  selectedIds,
  bulkActing,
  selectedArchivedCount,
  selectedDeletableCount,
  onBulkArchive,
  onBulkUnarchive,
  onBulkDelete,
}) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-[#cfe1d7] bg-white/95 p-3 shadow-xl backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {selectedIds.length} selected
          </p>
          <p className="text-xs text-gray-500">
            Bulk actions for your current selection
          </p>
        </div>
        <div className="flex gap-2">
          <ActionIconButton
            label="Bulk archive"
            onClick={onBulkArchive}
            disabled={Boolean(bulkActing)}
          >
            <FiArchive size={16} />
          </ActionIconButton>
          <ActionIconButton
            label="Bulk unarchive"
            onClick={onBulkUnarchive}
            disabled={Boolean(bulkActing) || selectedArchivedCount === 0}
          >
            <FiRefreshCw size={16} />
          </ActionIconButton>
          <ActionIconButton
            label="Bulk delete"
            onClick={onBulkDelete}
            disabled={Boolean(bulkActing) || selectedDeletableCount === 0}
            tone="danger"
          >
            <FiTrash2 size={16} />
          </ActionIconButton>
        </div>
      </div>
    </div>
  );
}
