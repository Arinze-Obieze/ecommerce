'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_LOW_STOCK_THRESHOLD = 5;
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const REASON_OPTIONS = [
  { value: 'correction', label: 'Count correction' },
  { value: 'restock', label: 'Restock received' },
  { value: 'damage', label: 'Damage / shrinkage' },
  { value: 'return', label: 'Customer return' },
  { value: 'count', label: 'Cycle count' },
];
const FILTER_OPTIONS = [
  { value: 'all', label: 'All inventory' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'variant_managed', label: 'Variant managed' },
];

function createAdjustmentState(row = null) {
  const firstVariant = row?.has_variants ? row.variants?.[0] : null;
  return {
    scope: row?.has_variants ? 'variant' : 'product',
    productId: row ? String(row.id) : '',
    variantId: firstVariant ? String(firstVariant.id) : '',
    mode: 'add',
    quantity: '1',
    reason: 'restock',
    note: '',
  };
}

function formatTimestamp(value) {
  if (!value) return 'Just now';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

function inventoryTone(stock, lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD) {
  if (stock <= 0) return 'border-red-200 bg-red-50 text-red-700';
  if (stock <= lowStockThreshold) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function StatCard({ label, value, tone = 'emerald' }) {
  const tones = {
    emerald: 'text-[#2E5C45]',
    amber: 'text-amber-700',
    red: 'text-red-700',
    slate: 'text-slate-900',
  };

  return (
    <button
      type="button"
      className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-3 text-left shadow-sm transition hover:border-[#b8d0c4]"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-bold leading-tight ${tones[tone]}`}>{value}</p>
    </button>
  );
}

function StockBadge({ stock, lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${inventoryTone(stock, lowStockThreshold)}`}>
      {stock} units
    </span>
  );
}

function ProductMeta({ row }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-gray-900">{row.name}</p>
      <p className="mt-0.5 truncate text-xs text-gray-500">
        /{row.slug} {row.sku ? `· ${row.sku}` : ''}
      </p>
    </div>
  );
}

function PaginationControls({ pagination, pageSize, setPage, setPageSize, loading }) {
  const page = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
        {' '}for <span className="font-semibold text-gray-900">{total}</span> matching items.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
          className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option} / page</option>)}
        </select>
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded-xl border border-[#dbe7e0] px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function AdjustmentPanel({ row, adjustment, setAdjustment, onSubmit, submitting, lowStockThreshold }) {
  if (!row) return null;

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#cfe1d7] bg-[#f7fbf8] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">Adjust {row.name}</p>
          <p className="text-xs text-gray-500">
            {row.has_variants ? 'Variant-managed product. Choose the exact size/color that changed.' : 'Direct-stock product.'}
          </p>
        </div>
        <StockBadge stock={row.effective_stock_quantity} lowStockThreshold={lowStockThreshold} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {row.has_variants ? (
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Variant</span>
            <select
              value={adjustment.variantId}
              onChange={(event) => setAdjustment((current) => ({ ...current, scope: 'variant', variantId: event.target.value }))}
              className="w-full rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2E5C45]"
            >
              {(row.variants || []).map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.label} · {variant.stock_quantity} in stock</option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mode</span>
          <select
            value={adjustment.mode}
            onChange={(event) => setAdjustment((current) => ({ ...current, mode: event.target.value }))}
            className="w-full rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2E5C45]"
          >
            <option value="add">Add units</option>
            <option value="subtract">Subtract units</option>
            <option value="set">Set exact stock</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</span>
          <input
            value={adjustment.quantity}
            onChange={(event) => setAdjustment((current) => ({ ...current, quantity: event.target.value }))}
            inputMode="numeric"
            className="w-full rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2E5C45]"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reason</span>
          <select
            value={adjustment.reason}
            onChange={(event) => setAdjustment((current) => ({ ...current, reason: event.target.value }))}
            className="w-full rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2E5C45]"
          >
            {REASON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="space-y-1 md:col-span-2 xl:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Note</span>
          <input
            value={adjustment.note}
            onChange={(event) => setAdjustment((current) => ({ ...current, note: event.target.value }))}
            placeholder="Optional"
            className="w-full rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2E5C45]"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#254a38] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Applying...' : 'Apply update'}
        </button>
        {row.has_variants ? (row.variants || []).slice(0, 4).map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => setAdjustment((current) => ({ ...current, scope: 'variant', variantId: String(variant.id), mode: 'add', quantity: '5', reason: 'restock' }))}
            className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#2E5C45] hover:text-[#2E5C45]"
          >
            Queue +5 for {variant.label}
          </button>
        )) : null}
      </div>
    </form>
  );
}

export default function StoreInventoryPage() {
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({ total: 0, lowStock: 0, outOfStock: 0, variantManaged: 0 });
  const [settings, setSettings] = useState({ low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD });
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

  const applyInventoryPayload = (json) => {
    setRows(json.rows || []);
    setHistory(json.history || []);
    setSummary(json.summary || { total: 0, lowStock: 0, outOfStock: 0, variantManaged: 0 });
    setSettings(json.settings || { low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD });
    setPagination(json.pagination || { page, pageSize, total: 0, totalPages: 1 });
  };

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
  }, [filter, page, pageSize, search]);

  useEffect(() => { void load(); }, [load]);

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

  const openAdjustment = (row, defaults = {}) => {
    setExpandedRowId(String(row.id));
    setAdjustment({ ...createAdjustmentState(row), ...defaults, productId: String(row.id) });
  };

  const submitAction = async (payload, successMessage) => {
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
  };

  const submitAdjustment = async (event) => {
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
  };

  const handleQuickRestock = async (row, target) => {
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
  };

  const resetSearch = () => {
    setSearchDraft('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2E5C45]">Inventory</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Find stock issues and fix counts fast.</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Search the catalog, act on low-stock rows, and open inline operations only when you need them.
              Low stock starts at {lowStockThreshold} units.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="All SKUs" value={summary.total} />
          <StatCard label="Low stock" value={summary.lowStock} tone="amber" />
          <StatCard label="Out of stock" value={summary.outOfStock} tone="red" />
          <StatCard label="Variant managed" value={summary.variantManaged} tone="slate" />
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <section className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Stock workspace</h3>
            <p className="text-sm text-gray-500">Operations live in the row, so you do not have to hunt for a separate form.</p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchDraft);
              setPage(1);
            }}
            className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_190px_auto_auto]"
          >
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search product, slug, SKU, variant"
              className="col-span-2 rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#2E5C45] sm:col-span-1"
            />
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
              className="col-span-2 rounded-xl border border-[#dbe7e0] bg-white px-3 py-2 text-sm text-gray-900 outline-none sm:col-span-1"
            >
              {FILTER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button type="submit" className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38]">
              Apply
            </button>
            <button type="button" onClick={resetSearch} className="rounded-xl border border-[#dbe7e0] px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Clear
            </button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFilter(option.value);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === option.value ? 'bg-[#2E5C45] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#dbe7e0] p-8 text-center text-sm text-gray-500">Loading inventory...</div>
        ) : rows.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#dbe7e0] p-8 text-center text-sm text-gray-500">No products match the current filters.</div>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Stock</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <Fragment key={row.id}>
                      <tr className={`border-b border-gray-50 align-top ${String(expandedRowId) === String(row.id) ? 'bg-[#f7fbf8]' : ''}`}>
                        <td className="py-3 pr-4">
                          <button type="button" onClick={() => openAdjustment(row)} className="w-full text-left">
                            <ProductMeta row={row} />
                          </button>
                        </td>
                        <td className="py-3 pr-4"><StockBadge stock={row.effective_stock_quantity} lowStockThreshold={lowStockThreshold} /></td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {row.has_variants ? `${row.variant_count} variants` : 'Direct stock'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="capitalize text-gray-700">{row.moderation_status}</p>
                          <p className="text-xs text-gray-500">{row.is_active ? 'Live to buyers' : 'Not live'}</p>
                        </td>
                        <td className="py-3 pl-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openAdjustment(row)}
                              className="rounded-full border border-[#dbe7e0] px-3 py-1 text-xs font-semibold text-gray-700 hover:border-[#2E5C45] hover:text-[#2E5C45]"
                            >
                              Adjust
                            </button>
                            {row.effective_stock_quantity <= lowStockThreshold ? (
                              <>
                                <button type="button" disabled={submitting} onClick={() => handleQuickRestock(row, 10)} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-200 disabled:opacity-50">Set 10</button>
                                <button type="button" disabled={submitting} onClick={() => handleQuickRestock(row, 20)} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 disabled:opacity-50">Set 20</button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                      {String(expandedRowId) === String(row.id) ? (
                        <tr>
                          <td colSpan={5} className="border-b border-gray-100 px-0 py-4">
                            <AdjustmentPanel
                              row={row}
                              adjustment={adjustment}
                              setAdjustment={setAdjustment}
                              onSubmit={submitAdjustment}
                              submitting={submitting}
                              lowStockThreshold={lowStockThreshold}
                            />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 space-y-3 lg:hidden">
              {rows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <ProductMeta row={row} />
                    <StockBadge stock={row.effective_stock_quantity} lowStockThreshold={lowStockThreshold} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                        {row.has_variants ? `${row.variant_count} variants` : 'Direct stock'}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold capitalize text-gray-600">{row.moderation_status}</span>
                    </div>
                    <button type="button" onClick={() => openAdjustment(row)} className="shrink-0 rounded-full border border-[#2E5C45] px-2.5 py-1 font-semibold text-[#2E5C45]">
                      Adjust
                    </button>
                  </div>
                  {row.effective_stock_quantity <= lowStockThreshold ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" disabled={submitting} onClick={() => handleQuickRestock(row, 10)} className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-50">Set 10</button>
                      <button type="button" disabled={submitting} onClick={() => handleQuickRestock(row, 20)} className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 disabled:opacity-50">Set 20</button>
                    </div>
                  ) : null}
                  {String(expandedRowId) === String(row.id) ? (
                    <div className="mt-4">
                      <AdjustmentPanel
                        row={row}
                        adjustment={adjustment}
                        setAdjustment={setAdjustment}
                        onSubmit={submitAdjustment}
                        submitting={submitting}
                        lowStockThreshold={lowStockThreshold}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-5">
              <PaginationControls
                pagination={pagination}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
                loading={loading}
              />
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm sm:p-5">
        <button
          type="button"
          onClick={() => setShowHistory((current) => !current)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <h3 className="text-base font-bold text-gray-900">Adjustment history</h3>
            <p className="text-sm text-gray-500">Collapsed by default so recent logs do not compete with the stock workspace.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{showHistory ? 'Hide' : 'Show'}</span>
        </button>

        {showHistory ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-[#eef4ef] bg-[#fbfdfb] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{entry.product_name}</p>
                    <p className="text-xs text-gray-500">
                      {entry.variant_label ? `${entry.variant_label} · ` : ''}{entry.reason || 'correction'} · {entry.mode}
                    </p>
                  </div>
                  <p className="text-right text-xs text-gray-500">{formatTimestamp(entry.created_at)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <p className="text-gray-700">{entry.message}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {entry.previous_quantity} {'->'} {entry.next_quantity}
                  </span>
                </div>
                {entry.note ? <p className="mt-2 text-xs text-gray-500">Note: {entry.note}</p> : null}
              </div>
            ))}

            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dbe7e0] bg-[#fbfdfb] p-5 text-sm text-gray-500">
                Inventory adjustments will appear here once your team starts using the workflow.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
