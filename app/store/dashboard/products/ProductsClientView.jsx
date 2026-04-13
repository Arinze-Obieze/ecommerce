"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArchive,
  FiCheckSquare,
  FiChevronRight,
  FiCopy,
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

const STATUS_OPTIONS = [
  "all",
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "archived",
];

function getStatusBadgeClasses(status) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending_review":
      return "bg-amber-100 text-amber-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "archived":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

function describeDraft(draft) {
  if (!draft?.state) return "Unfinished product draft";
  const parts = [
    draft.state.productName || "Untitled draft",
    draft.state.subcategory || draft.state.category || "",
  ].filter(Boolean);
  return parts.join(" • ");
}

function formatMoney(value) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

function compactDate(value) {
  if (!value) return "Not submitted";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ActionIconButton({
  onClick,
  disabled,
  label,
  children,
  tone = "default",
}) {
  const tones = {
    default: "border-gray-200 text-gray-700 hover:bg-gray-50",
    brand: "border-[#2E5C45]/20 text-[#2E5C45] hover:bg-[#f3f8f5]",
    danger: "border-red-200 text-red-700 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function BulkButton({ onClick, disabled, label, tone = "default" }) {
  const tones = {
    default: "border-gray-200 text-gray-700 hover:bg-gray-50",
    brand: "border-[#2E5C45] text-[#2E5C45] hover:bg-[#f3f8f5]",
    danger: "border-red-200 text-red-700 hover:bg-red-50",
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

export default function ProductsClientView({
  initialProducts = [],
  initialSummary = null,
  initialDraft = null,
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialProducts);
  const [summary, setSummary] = useState(initialSummary);
  const [pendingDraft, setPendingDraft] = useState(initialDraft);
  // No initial loading if we have data from the server.
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState("");
  const [actingType, setActingType] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActing, setBulkActing] = useState("");
  const [mobileViewMode, setMobileViewMode] = useState("line");
  const [page, setPage] = useState(1);
  const [openActionMenuId, setOpenActionMenuId] = useState("");
  const limit = 20;
  const abortControllerRef = useRef(null);
  const isFirstRender = useRef(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const confirmDelete = (row) => {
    setProductToDelete(row);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    setDeleteModalOpen(false);
    await handleRowAction(productToDelete, "delete");
    setProductToDelete(null);
  };

  const confirmBulkDelete = () => {
    setBulkDeleteModalOpen(true);
  };

  const executeBulkDelete = async () => {
    setBulkDeleteModalOpen(false);
    await handleBulkAction("bulk_delete");
  };

  const load = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("moderationStatus", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      
      const res = await fetch(`/api/store/products?${params.toString()}`, {
        cache: "no-store",
        signal,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load products");
      setRows(json.data || []);
      setSummary(json.summary || null);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Network error. Failed to fetch products.");
      // Edge case: if network fails, we don't wipe out the existing 'rows'
      // Instead, we let the old state remain to prevent jarring blank screens.
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    // If we have an initialDraft passed from context, we don't strictly need to refetch
    // on mount, unless we want to ensure freshness. Let's skip if it exists.
    if (initialDraft) return;

    try {
      setDraftLoading(true);
      const res = await fetch("/api/store/products/draft", {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load draft");
      setPendingDraft(json.data || null);
    } catch {
      setPendingDraft(null);
    } finally {
      setDraftLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip the fetch on initial mount since we use server data.
    }
    void load();
    return () => abortControllerRef.current?.abort();
  }, [statusFilter, page]);

  useEffect(() => {
    void loadDraft();
  }, []);

  useEffect(() => {
    const rowIds = new Set(rows.map((row) => row.id));
    setSelectedIds((current) => current.filter((id) => rowIds.has(id)));
    setOpenActionMenuId((current) => (rowIds.has(current) ? current : ""));
  }, [rows]);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("[data-row-actions-menu]")) {
        setOpenActionMenuId("");
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const counts = useMemo(() => summary || {}, [summary]);
  const draftRows = useMemo(
    () => rows.filter((row) => row.moderation_status === "draft"),
    [rows],
  );
  const rejectedRows = useMemo(
    () => rows.filter((row) => row.moderation_status === "rejected"),
    [rows],
  );
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds],
  );
  const selectedArchivedCount = selectedRows.filter(
    (row) => row.moderation_status === "archived",
  ).length;
  const selectedDeletableCount = selectedRows.filter((row) =>
    ["draft", "rejected", "archived"].includes(row.moderation_status),
  ).length;

  const summarizeBulkDiscounts = (tiers) => {
    if (!Array.isArray(tiers) || tiers.length === 0) return "No bulk offer";
    const highestTier = [...tiers].sort(
      (a, b) => b.minimum_quantity - a.minimum_quantity,
    )[0];
    return `${highestTier.discount_percent}% @ ${highestTier.minimum_quantity}+`;
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
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
      setError("");
      setNotice("");

      let response;
      if (action === "resubmit") {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submit_for_review: true }),
        });
      } else if (action === "archive") {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archive: true }),
        });
      } else if (action === "unarchive") {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archive: false }),
        });
      } else if (action === "delete") {
        response = await fetch(`/api/store/products/${row.id}`, {
          method: "DELETE",
        });
      } else {
        throw new Error("Unsupported action");
      }

      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Action failed");

      if (action === "resubmit") {
        setNotice("Product submitted for review.");
      } else if (action === "archive") {
        setNotice("Product archived.");
      } else if (action === "unarchive") {
        setNotice("Product moved back to draft.");
      } else {
        setNotice("Product deleted.");
      }

      await load();
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setActingId("");
      setActingType("");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;

    try {
      setBulkActing(action);
      setError("");
      setNotice("");

      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Bulk action failed");

      if (action === "bulk_archive") {
        setNotice(`${json.data?.count || 0} product(s) archived.`);
      } else if (action === "bulk_unarchive") {
        setNotice(`${json.data?.count || 0} product(s) moved back to draft.`);
      } else if (action === "bulk_delete") {
        const skipped = Number(json.data?.skipped || 0);
        setNotice(
          skipped > 0
            ? `${json.data?.count || 0} product(s) deleted. ${skipped} could not be deleted because they are still approved or pending.`
            : `${json.data?.count || 0} product(s) deleted.`,
        );
      }

      setSelectedIds([]);
      await load();
    } catch (err) {
      setError(err.message || "Bulk action failed");
    } finally {
      setBulkActing("");
    }
  };

  const discardPendingDraft = async () => {
    try {
      setError("");
      setNotice("");
      const res = await fetch("/api/store/products/draft", {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to discard draft");
      setPendingDraft(null);
      setNotice("Draft discarded. You can start a fresh product now.");
    } catch (err) {
      setError(err.message || "Failed to discard draft");
    }
  };

  const openDraftFilter = () => {
    setStatusFilter("draft");
    setSelectedIds([]);
  };

  const openRejectedFilter = () => {
    setStatusFilter("rejected");
    setSelectedIds([]);
  };

  const renderProductMetaChips = (row) => (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
        /{row.slug}
      </span>
      {row.sku ? (
        <span className="rounded-full bg-[#f3f8f5] px-2.5 py-1 font-mono text-[11px] font-medium text-[#2E5C45]">
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
        tone: "text-[#2E5C45] hover:bg-[#f3f8f5]",
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
        tone: "text-[#2E5C45] hover:bg-[#f3f8f5]",
      });
    }

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
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && productToDelete ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Products</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete the selected products? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setBulkDeleteModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

      {!draftLoading && pendingDraft ? (
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
                onClick={discardPendingDraft}
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
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["Total", counts.total || 0],
          ["Draft", counts.draft || 0],
          ["Pending", counts.pending_review || 0],
          ["Approved", counts.approved || 0],
          ["Rejected", counts.rejected || 0],
          ["Archived", counts.archived || 0],
        ].map(([label, value]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setStatusFilter(
                label.toLowerCase() === "total"
                  ? "all"
                  : label.toLowerCase().replace("pending", "pending_review"),
              );
              setPage(1);
            }}
            className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-3 text-center shadow-sm transition hover:border-[#b8d0c4]"
          >
            <p className="text-xs uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#2E5C45]">{value}</p>
          </button>
        ))}
      </div>

      {statusFilter === "all" &&
      (draftRows.length > 0 || rejectedRows.length > 0) ? (
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
                onClick={openDraftFilter}
                className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45] hover:bg-[#f3f8f5]"
              >
                View all {counts.draft || 0} drafts
              </button>
              {(counts.rejected || 0) > 0 ? (
                <button
                  type="button"
                  onClick={openRejectedFilter}
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
      ) : null}

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
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
              className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45]"
            >
              Apply
            </button>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-[#cfe1d7] bg-[#f6faf7] p-4">
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
                className={`flex flex-1 items-center justify-center rounded-xl px-3 py-2 transition ${mobileViewMode === "grid" ? "bg-[#2E5C45] text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                <FiGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode("line")}
                aria-label="Line view"
                className={`flex flex-1 items-center justify-center rounded-xl px-3 py-2 transition ${mobileViewMode === "line" ? "bg-[#2E5C45] text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
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
                      className={`w-full rounded-xl border p-3 text-left shadow-sm transition cursor-pointer ${selected ? "border-[#2E5C45] bg-[#f7fbf8]" : "border-[#dbe7e0] bg-white hover:border-[#b8d0c4]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(row.id);
                          }}
                          className="text-[#2E5C45]"
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
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0" />
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
                      className={`rounded-2xl border p-4 shadow-sm transition ${selected ? "border-[#2E5C45] bg-[#f7fbf8]" : "border-[#dbe7e0] bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelect(row.id)}
                          className="mt-0.5 text-[#2E5C45]"
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
                            className="text-[#2E5C45]"
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
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-50 flex-shrink-0 border border-gray-100" />
                            )}
                            <div>
                              <Link
                                href={`/store/dashboard/products/${row.id}`}
                                className="font-semibold text-gray-900 hover:text-[#2E5C45]"
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

      {selectedIds.length > 0 ? (
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
                onClick={() => handleBulkAction("bulk_archive")}
                disabled={Boolean(bulkActing)}
              >
                <FiArchive size={16} />
              </ActionIconButton>
              <ActionIconButton
                label="Bulk unarchive"
                onClick={() => handleBulkAction("bulk_unarchive")}
                disabled={Boolean(bulkActing) || selectedArchivedCount === 0}
              >
                <FiRefreshCw size={16} />
              </ActionIconButton>
              <ActionIconButton
                label="Bulk delete"
                onClick={() => confirmBulkDelete()}
                disabled={Boolean(bulkActing) || selectedDeletableCount === 0}
                tone="danger"
              >
                <FiTrash2 size={16} />
              </ActionIconButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
