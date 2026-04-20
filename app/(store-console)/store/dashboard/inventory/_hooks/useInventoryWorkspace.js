'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '../_lib/constants';
import { createAdjustmentState } from '../_lib/inventory-utils';

const EMPTY_SUMMARY = { total: 0, lowStock: 0, outOfStock: 0, variantManaged: 0 };
const EMPTY_SETTINGS = { low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD };

export function useInventoryWorkspace() {
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedRowId, setExpandedRowId] = useState('');
  const [adjustment, setAdjustment] = useState(createAdjustmentState());
  const [showHistory, setShowHistory] = useState(false);

  const applyInventoryPayload = useCallback((json) => {
    setRows(json.rows || []);
    setHistory(json.history || []);
    setSummary(json.summary || EMPTY_SUMMARY);
    setSettings(json.settings || EMPTY_SETTINGS);
    setPagination(json.pagination || { page, pageSize, total: 0, totalPages: 1 });
  }, [page, pageSize]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        filter,
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/store/inventory?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load inventory');

      applyInventoryPayload(json);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [applyInventoryPayload, filter, page, pageSize, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const expandedRow = useMemo(
    () => rows.find((row) => String(row.id) === String(expandedRowId)) || null,
    [expandedRowId, rows]
  );

  const lowStockThreshold = Number.isFinite(Number(settings.low_stock_threshold))
    ? Number(settings.low_stock_threshold)
    : DEFAULT_LOW_STOCK_THRESHOLD;

  useEffect(() => {
    if (!expandedRowId) return;
    if (!rows.some((row) => String(row.id) === String(expandedRowId))) {
      setExpandedRowId('');
    }
  }, [expandedRowId, rows]);

  const openAdjustment = useCallback((row, defaults = {}) => {
    setExpandedRowId(String(row.id));
    setAdjustment({ ...createAdjustmentState(row), ...defaults, productId: String(row.id) });
  }, []);

  const submitAction = useCallback(async (payload, successMessage) => {
    try {
      setSubmitting(true);
      setError('');
      setNotice('');

      const res = await fetch('/api/store/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Inventory action failed');

      setNotice(successMessage);
      await load();
    } catch (err) {
      setError(err.message || 'Inventory action failed');
    } finally {
      setSubmitting(false);
    }
  }, [load]);

  const submitAdjustment = useCallback(async (event) => {
    event.preventDefault();
    if (!expandedRow) return;

    if (expandedRow.has_variants) {
      await submitAction({
        action: 'adjust_variant',
        variantId: adjustment.variantId,
        mode: adjustment.mode,
        quantity: adjustment.quantity,
        reason: adjustment.reason,
        note: adjustment.note,
      }, 'Variant inventory updated.');
      return;
    }

    await submitAction({
      action: 'adjust_product',
      productId: expandedRow.id,
      mode: adjustment.mode,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      note: adjustment.note,
    }, 'Product inventory updated.');
  }, [adjustment, expandedRow, submitAction]);

  const handleQuickRestock = useCallback(async (row, target) => {
    if (row.has_variants) {
      const variant = row.variants.find((item) => item.stock_quantity <= lowStockThreshold) || row.variants[0];
      if (!variant) return;

      await submitAction({
        action: 'adjust_variant',
        variantId: variant.id,
        mode: 'set',
        quantity: target,
        reason: 'restock',
        note: `Quick restock from inventory table for ${variant.label}.`,
      }, `${row.name} variant restocked.`);
      return;
    }

    await submitAction({
      action: 'adjust_product',
      productId: row.id,
      mode: 'set',
      quantity: target,
      reason: 'restock',
      note: 'Quick restock from inventory table.',
    }, `${row.name} restocked.`);
  }, [lowStockThreshold, submitAction]);

  const resetSearch = useCallback(() => {
    setSearchDraft('');
    setSearch('');
    setPage(1);
  }, []);

  return {
    rows,
    history,
    summary,
    settings,
    pagination,
    loading,
    submitting,
    error,
    notice,
    searchDraft,
    search,
    filter,
    page,
    pageSize,
    expandedRowId,
    adjustment,
    showHistory,
    expandedRow,
    lowStockThreshold,
    setSearchDraft,
    setSearch,
    setFilter,
    setPage,
    setPageSize,
    setExpandedRowId,
    setAdjustment,
    setShowHistory,
    load,
    openAdjustment,
    submitAdjustment,
    handleQuickRestock,
    resetSearch,
  };
}
