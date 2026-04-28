"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getQrImageUrl, getQrValueForProduct } from "../_lib/products-utils";

export function useProductsWorkspace({ initialProducts = [], initialSummary = null, initialDraft = null }) {
  const [rows, setRows] = useState(initialProducts);
  const [summary, setSummary] = useState(initialSummary);
  const [pendingDraft, setPendingDraft] = useState(initialDraft);
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);

  const limit = 20;
  const abortControllerRef = useRef(null);
  const isFirstRender = useRef(true);

  const qrValue = qrProduct ? getQrValueForProduct(qrProduct) : "";
  const qrImageUrl = getQrImageUrl(qrValue, 320);

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
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
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
      return;
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

  const openQrModal = (row) => {
    setQrProduct(row);
    setQrModalOpen(true);
  };

  const copyQrValue = async () => {
    if (!qrValue) return;
    try {
      await navigator.clipboard.writeText(qrValue);
      setNotice("QR value copied.");
    } catch {
      setError("Could not copy QR value.");
    }
  };

  const openQrImage = () => {
    if (!qrImageUrl) return;
    window.open(qrImageUrl, "_blank", "noopener,noreferrer");
  };

  const downloadQrImage = async () => {
    if (!qrImageUrl || !qrProduct) return;
    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error("Failed to download QR image");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeSku = (qrProduct.sku || qrProduct.slug || qrProduct.id || "product")
        .toString()
        .replace(/[^a-zA-Z0-9_-]+/g, "-");
      link.href = objectUrl;
      link.download = `${safeSku}-qr.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setNotice("QR image downloaded.");
    } catch {
      setError("Could not download QR image.");
    }
  };

  const printQr = () => {
    if (!qrImageUrl || !qrProduct) return;
    const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=560");
    if (!w) return;
    const name = (qrProduct.name || "Product").replace(/</g, "&lt;");
    const sku = (qrProduct.sku || "No SKU").replace(/</g, "&lt;");
    const value = qrValue.replace(/</g, "&lt;");
    w.document.write(
      `<html><head><title>Print QR</title><style>body{font-family:Arial,sans-serif;margin:0;padding:24px;text-align:center;color:#111}.card{border:1px solid #ddd;border-radius:12px;padding:16px;max-width:340px;margin:0 auto}img{width:240px;height:240px;display:block;margin:0 auto 12px}h2{font-size:16px;margin:0 0 8px}p{margin:4px 0;font-size:12px;color:#555;word-break:break-all}</style></head><body><div class="card"><img src="${qrImageUrl}" alt="Product QR"/><h2>${name}</h2><p>SKU: ${sku}</p><p>${value}</p></div></body></html>`
    );
    w.document.close();
    w.addEventListener('load', () => w.print(), { once: true });
  };

  return {
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
  };
}
