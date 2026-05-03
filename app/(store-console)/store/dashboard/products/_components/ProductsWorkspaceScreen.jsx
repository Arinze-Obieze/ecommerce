"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArchive,
  FiCheckSquare,
  FiChevronRight,
  FiEdit3,
  FiEye,
  FiLayers,
  FiMoreVertical,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSquare,
  FiTrash2,
  FiGrid,
  FiList
} from "react-icons/fi";
import ConfirmModal from "@/components/store-console/dashboard/ConfirmModal";
import ProductQrModal from "@/components/store-console/dashboard/ProductQrModal";
import AlertBanner from "@/components/store-console/dashboard/AlertBanner";
import { ActionIconButton, BulkButton } from "./ProductsActionButtons";
import {
  ProductsDraftWorkbench,
  ProductsHeaderCard,
  ProductsMobileBulkBar,
  ProductsPendingDraftBanner,
  ProductsSummaryCards,
} from "./ProductsWorkspaceSections";
import {
  STATUS_OPTIONS,
  compactDate,
  describeDraft,
  formatMoney,
  getStatusBadgeClasses,
  summarizeBulkDiscounts,
} from "../_lib/products-utils";
import { useProductsWorkspace } from "../_hooks/useProductsWorkspace";

export default function ProductsWorkspaceScreen({
  initialProducts = [],
  initialSummary = null,
  initialDraft = null,
}) {
  const router = useRouter();
  const {
    rows,
    counts,
    draftRows,
    rejectedRows,
    pendingDraft,
    loading,
    draftLoading,
    error,
    notice,
    statusFilter,
    search,
    selectedIds,
    bulkActing,
    mobileViewMode,
    page,
    openActionMenuId,
    actingId,
    actingType,
    selectedArchivedCount,
    selectedDeletableCount,
    qrModalOpen,
    qrProduct,
    qrValue,
    qrImageUrl,
    deleteModalOpen,
    productToDelete,
    bulkDeleteModalOpen,
    limit,
    setError,
    setNotice,
    setStatusFilter,
    setSearch,
    setSelectedIds,
    setMobileViewMode,
    setPage,
    setOpenActionMenuId,
    setQrModalOpen,
    setQrProduct,
    setDeleteModalOpen,
    setProductToDelete,
    setBulkDeleteModalOpen,
    load,
    toggleSelect,
    toggleSelectAllVisible,
    handleRowAction,
    handleBulkAction,
    discardPendingDraft,
    openDraftFilter,
    openRejectedFilter,
    confirmDelete,
    executeDelete,
    confirmBulkDelete,
    executeBulkDelete,
    openQrModal,
    copyQrValue,
    openQrImage,
    downloadQrImage,
    printQr,
  } = useProductsWorkspace({ initialProducts, initialSummary, initialDraft });
  const renderProductMetaChips = (row) => (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
        /{row.slug}
      </span>
      {row.sku ? (
        <span className="rounded-full bg-primary-soft px-2.5 py-1 font-mono text-[11px] font-medium text-primary">
          {row.sku}
        </span>
      ) : null}
    </div>
  );

  const renderRowActions = (row, mobile = false) => {
    const actionBusy = actingId === row.id;
    const iconSize = mobile ? 16 : 15;

    return (
      <div className={`flex flex-wrap ${mobile ? "gap-2" : "gap-1.5"}`}>
        <ActionIconButton
          label="View product details"
          onClick={() => {
            router.push(`/store/dashboard/products/${row.id}`);
          }}
        >
          <FiEye size={iconSize} />
        </ActionIconButton>
        <ActionIconButton
          label="Edit product"
          onClick={() => {
            router.push(`/store/dashboard/products/${row.id}?mode=edit`);
          }}
          tone="brand"
        >
          <FiEdit3 size={iconSize} />
        </ActionIconButton>
        {row.moderation_status === "archived" ? (
          <ActionIconButton
            label={
              actionBusy && actingType === "unarchive"
                ? "Unarchiving product"
                : "Unarchive product"
            }
            onClick={() => handleRowAction(row, "unarchive")}
            disabled={actionBusy}
          >
            <FiRefreshCw size={iconSize} />
          </ActionIconButton>
        ) : (
          <ActionIconButton
            label={
              actionBusy && actingType === "archive"
                ? "Archiving product"
                : "Archive product"
            }
            onClick={() => handleRowAction(row, "archive")}
            disabled={actionBusy}
            tone="danger"
          >
            <FiArchive size={iconSize} />
          </ActionIconButton>
        )}
        {row.moderation_status === "draft" ||
        row.moderation_status === "rejected" ? (
          <ActionIconButton
            label={
              actionBusy && actingType === "resubmit"
                ? "Submitting product"
                : "Submit for review"
            }
            onClick={() => handleRowAction(row, "resubmit")}
            disabled={actionBusy}
            tone="brand"
          >
            <FiSend size={iconSize} />
          </ActionIconButton>
        ) : null}
        <ActionIconButton
          label="Open QR code"
          onClick={() => openQrModal(row)}
        >
          <span className="text-[11px] font-bold leading-none">QR</span>
        </ActionIconButton>
        <ActionIconButton
          label={
            actionBusy && actingType === "delete"
              ? "Deleting product"
              : "Delete product"
          }
          onClick={() => confirmDelete(row)}
          disabled={actionBusy}
          tone="danger"
        >
          <FiTrash2 size={iconSize} />
        </ActionIconButton>
      </div>
    );
  };

  const getRowActionItems = (row) => {
    const actionBusy = actingId === row.id;
    const items = [
      {
        label: "View",
        onClick: () => router.push(`/store/dashboard/products/${row.id}`),
        tone: "text-gray-700 hover:bg-gray-50",
      },
      {
        label: "Edit",
        onClick: () => router.push(`/store/dashboard/products/${row.id}?mode=edit`),
        tone: "text-primary hover:bg-primary-soft",
      },
    ];

    if (row.moderation_status === "archived") {
      items.push({
        label: actionBusy && actingType === "unarchive" ? "Unarchiving..." : "Unarchive",
        onClick: () => handleRowAction(row, "unarchive"),
        disabled: actionBusy,
        tone: "text-gray-700 hover:bg-gray-50",
      });
    } else {
      items.push({
        label: actionBusy && actingType === "archive" ? "Archiving..." : "Archive",
        onClick: () => handleRowAction(row, "archive"),
        disabled: actionBusy,
        tone: "text-amber-700 hover:bg-amber-50",
      });
    }

    if (row.moderation_status === "draft" || row.moderation_status === "rejected") {
      items.push({
        label: actionBusy && actingType === "resubmit" ? "Submitting..." : "Submit for review",
        onClick: () => handleRowAction(row, "resubmit"),
        disabled: actionBusy,
        tone: "text-primary hover:bg-primary-soft",
      });
    }

    items.push({
      label: "QR code",
      onClick: () => openQrModal(row),
      tone: "text-gray-700 hover:bg-gray-50",
    });

    items.push({
      label: actionBusy && actingType === "delete" ? "Deleting..." : "Delete",
      onClick: () => confirmDelete(row),
      disabled: actionBusy,
      tone: "text-red-700 hover:bg-red-50",
    });

    return items;
  };

  const renderRowActionsMenu = (row) => {
    const isOpen = openActionMenuId === row.id;
    const items = getRowActionItems(row);

    return (
      <div className="relative" data-row-actions-menu>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenActionMenuId((current) => (current === row.id ? "" : row.id));
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Open actions"
        >
          <FiMoreVertical size={16} />
        </button>
        {isOpen ? (
          <div className="absolute right-0 top-10 z-30 min-w-[170px] rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId("");
                  item.onClick?.();
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${item.tone || "text-gray-700 hover:bg-gray-50"} disabled:opacity-50`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <ConfirmModal
        open={deleteModalOpen && !!productToDelete}
        title="Delete Product"
        message={<>Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.</>}
        confirmLabel="Delete"
        onConfirm={executeDelete}
        onCancel={() => { setDeleteModalOpen(false); setProductToDelete(null); }}
      />

      <ConfirmModal
        open={bulkDeleteModalOpen}
        title="Delete Products"
        message="Are you sure you want to delete the selected products? This action cannot be undone."
        confirmLabel="Delete All"
        onConfirm={executeBulkDelete}
        onCancel={() => setBulkDeleteModalOpen(false)}
      />

      <ProductQrModal
        open={qrModalOpen}
        product={qrProduct}
        qrValue={qrValue}
        qrImageUrl={qrImageUrl}
        onCopyValue={copyQrValue}
        onOpenPng={openQrImage}
        onDownload={downloadQrImage}
        onPrint={printQr}
        onClose={() => { setQrModalOpen(false); setQrProduct(null); }}
      />


      <ProductsHeaderCard />

      <ProductsPendingDraftBanner
        draftLoading={draftLoading}
        pendingDraft={pendingDraft}
        onDiscard={discardPendingDraft}
      />

      <ProductsSummaryCards
        counts={counts}
        onSelectStatus={(label) => {
          setStatusFilter(
            label.toLowerCase() === "total"
              ? "all"
              : label.toLowerCase().replace("pending", "pending_review"),
          );
          setPage(1);
        }}
      />

      <ProductsDraftWorkbench
        statusFilter={statusFilter}
        draftRows={draftRows}
        rejectedRows={rejectedRows}
        counts={counts}
        onOpenDraftFilter={openDraftFilter}
        onOpenRejectedFilter={openRejectedFilter}
        renderProductMetaChips={renderProductMetaChips}
        renderRowActions={renderRowActions}
      />

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Catalog queue
              </h3>
              <p className="text-sm text-gray-500">
                Use checkboxes for batch work, or tap the action icons for
                one-off changes.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {selectedIds.length === rows.length && rows.length > 0 ? (
                <FiCheckSquare size={16} />
              ) : (
                <FiSquare size={16} />
              )}
              {selectedIds.length === rows.length && rows.length > 0
                ? "Clear visible selection"
                : "Select visible"}
            </button>
          </div>

          <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_auto]">
            <select
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
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
                  if (e.key === "Enter") {
                    setPage(1);
                    void load();
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                void load();
              }}
              className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary"
            >
              Apply
            </button>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-[#B8D4A0] bg-[#f6faf7] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedIds.length} selected
                </p>
                <p className="text-xs text-gray-500">
                  Archive, unarchive, or delete several products at once.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <BulkButton
                  onClick={() => handleBulkAction("bulk_archive")}
                  disabled={Boolean(bulkActing)}
                  label={
                    bulkActing === "bulk_archive" ? "Archiving..." : "Archive"
                  }
                />
                {selectedArchivedCount > 0 ? (
                  <BulkButton
                    onClick={() => handleBulkAction("bulk_unarchive")}
                    disabled={Boolean(bulkActing)}
                    label={
                      bulkActing === "bulk_unarchive"
                        ? "Unarchiving..."
                        : "Unarchive"
                    }
                  />
                ) : null}
                <BulkButton
                  onClick={() => confirmBulkDelete()}
                  disabled={Boolean(bulkActing) || selectedDeletableCount === 0}
                  label={
                    bulkActing === "bulk_delete"
                      ? "Deleting..."
                      : `Delete${selectedDeletableCount !== selectedIds.length ? ` (${selectedDeletableCount} eligible)` : ""}`
                  }
                  tone="danger"
                />
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-3 flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            <div className="flex items-center gap-2">
              <strong>Error:</strong>
              <p>{error}</p>
            </div>
            <button
              onClick={() => {
                setError("");
                void load();
              }}
              className="whitespace-nowrap rounded-lg bg-red-100 px-3 py-1.5 font-semibold text-red-800 hover:bg-red-200 transition"
            >
              Retry fetch
            </button>
          </div>
        ) : null}
        {notice ? (
          <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
            No products found for this filter.
          </div>
        ) : (
          <>
            <div className="mb-3 flex gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileViewMode("grid")}
                aria-label="Grid view"
                className={`flex flex-1 items-center justify-center rounded-xl px-3 py-2 transition ${mobileViewMode === "grid" ? "bg-primary text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                <FiGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode("line")}
                aria-label="Line view"
                className={`flex flex-1 items-center justify-center rounded-xl px-3 py-2 transition ${mobileViewMode === "line" ? "bg-primary text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                <FiList size={16} />
              </button>
            </div>

            {mobileViewMode === "line" ? (
              <div className="space-y-2 md:hidden">
                {rows.map((row) => {
                  const selected = selectedIds.includes(row.id);
                  const thumbnailUrl =
                    row.image_urls?.length > 0 ? row.image_urls[0] : null;
                  return (
                    <div
                      key={row.id}
                      onClick={() =>
                        router.push(`/store/dashboard/products/${row.id}`)
                      }
                      className={`w-full rounded-xl border p-3 text-left shadow-sm transition cursor-pointer ${selected ? "border-primary bg-[#f7fbf8]" : "border-border bg-white hover:border-[#b8d0c4]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(row.id);
                          }}
                          className="text-primary"
                          aria-label={
                            selected ? "Deselect product" : "Select product"
                          }
                        >
                          {selected ? (
                            <FiCheckSquare size={18} />
                          ) : (
                            <FiSquare size={18} />
                          )}
                        </button>
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={row.name}
                            className="h-12 w-12 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-gray-900">
                            {row.name}
                          </p>
                          <p className="truncate text-[11px] text-gray-500">
                            {formatMoney(row.discount_price ?? row.price)} ·{" "}
                            {row.stock_quantity} in stock
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusBadgeClasses(row.moderation_status)}`}
                            >
                              {row.moderation_status}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {compactDate(row.submitted_at)}
                            </span>
                          </div>
                        </div>
                        <div className="pl-1">
                          {renderRowActionsMenu(row)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 md:hidden">
                {rows.map((row) => {
                  const selected = selectedIds.includes(row.id);
                  return (
                    <div
                      key={row.id}
                      className={`rounded-2xl border p-4 shadow-sm transition ${selected ? "border-primary bg-[#f7fbf8]" : "border-border bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelect(row.id)}
                          className="mt-0.5 text-primary"
                          aria-label={
                            selected ? "Deselect product" : "Select product"
                          }
                        >
                          {selected ? (
                            <FiCheckSquare size={18} />
                          ) : (
                            <FiSquare size={18} />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/store/dashboard/products/${row.id}`}
                                className="block truncate text-sm font-bold text-gray-900 hover:text-primary"
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

                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-xl bg-gray-50 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                Price
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {formatMoney(row.discount_price ?? row.price)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                Stock
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {row.stock_quantity}
                              </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                Media
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {row.image_urls?.length || 0} img /{" "}
                                {row.video_urls?.length || 0} vid
                              </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                Submitted
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {compactDate(row.submitted_at)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="min-w-0 truncate text-xs text-gray-500">
                              {summarizeBulkDiscounts(row.bulk_discount_tiers)}
                            </p>
                            {renderRowActionsMenu(row)}
                          </div>

                          {row.rejection_reason ? (
                            <p className="mt-3 text-xs text-red-700">
                              {row.rejection_reason}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                      <tr
                        key={row.id}
                        className={`border-b border-gray-50 align-top ${selected ? "bg-[#f7fbf8]" : ""}`}
                      >
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            onClick={() => toggleSelect(row.id)}
                            className="text-primary"
                            aria-label={
                              selected ? "Deselect product" : "Select product"
                            }
                          >
                            {selected ? (
                              <FiCheckSquare size={18} />
                            ) : (
                              <FiSquare size={18} />
                            )}
                          </button>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-start gap-3">
                            {row.image_urls?.[0] ? (
                              <img
                                src={row.image_urls[0]}
                                alt={row.name}
                                className="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-100"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-50 shrink-0 border border-gray-100" />
                            )}
                            <div>
                              <Link
                                href={`/store/dashboard/products/${row.id}`}
                                className="font-semibold text-gray-900 hover:text-primary"
                              >
                                {row.name}
                              </Link>
                              {renderProductMetaChips(row)}
                              {row.rejection_reason ? (
                                <div className="mt-2 max-w-xs text-xs text-red-700">
                                  {row.rejection_reason}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(row.moderation_status)}`}
                          >
                            {row.moderation_status}
                          </span>
                          <div className="mt-2 text-xs text-gray-500">
                            {row.is_active
                              ? "Visible to buyers"
                              : "Hidden from buyers"}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-gray-900">
                          {formatMoney(row.discount_price ?? row.price)}
                        </td>
                        <td className="py-3 pr-3">{row.stock_quantity}</td>
                        <td className="py-3 pr-3">
                          {summarizeBulkDiscounts(row.bulk_discount_tiers)}
                        </td>
                        <td className="py-3 pr-3">
                          {row.image_urls?.length || 0} img /{" "}
                          {row.video_urls?.length || 0} vid
                        </td>
                        <td className="py-3 pr-3">
                          {compactDate(row.submitted_at)}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="hidden xl:block">{renderRowActions(row)}</div>
                          <div className="xl:hidden">{renderRowActionsMenu(row)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-500">
                Page {page}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={rows.length < limit}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <ProductsMobileBulkBar
        selectedIds={selectedIds}
        bulkActing={bulkActing}
        selectedArchivedCount={selectedArchivedCount}
        selectedDeletableCount={selectedDeletableCount}
        onBulkArchive={() => handleBulkAction("bulk_archive")}
        onBulkUnarchive={() => handleBulkAction("bulk_unarchive")}
        onBulkDelete={confirmBulkDelete}
      />
    </div>
  );
}
