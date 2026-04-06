'use client';

import { useEffect, useMemo, useState } from 'react';

const LOW_STOCK_THRESHOLD = 5;
const REASON_OPTIONS = [
  { value: 'correction', label: 'Count correction' },
  { value: 'restock', label: 'Restock received' },
  { value: 'damage', label: 'Damage / shrinkage' },
  { value: 'return', label: 'Customer return' },
  { value: 'count', label: 'Cycle count' },
];

function createAdjustmentState() {
  return {
    scope: 'product',
    productId: '',
    variantId: '',
    mode: 'add',
    quantity: '1',
    reason: 'restock',
    note: '',
  };
}

function formatTimestamp(value) {
  if (!value) return 'Just now';

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function inventoryTone(stock) {
  if (stock <= 0) return 'text-red-700 bg-red-50 border-red-200';
  if (stock <= LOW_STOCK_THRESHOLD) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-emerald-700 bg-emerald-50 border-emerald-200';
}

export default function StoreInventoryPage() {
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({ total: 0, lowStock: 0, outOfStock: 0, variantManaged: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustment, setAdjustment] = useState(createAdjustmentState());
  const [bulkRestockTarget, setBulkRestockTarget] = useState('12');

  const applyInventoryPayload = (json) => {
    setRows(json.rows || []);
    setHistory(json.history || []);
    setSummary(json.summary || { total: 0, lowStock: 0, outOfStock: 0, variantManaged: 0 });
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/store/inventory', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load inventory');
      applyInventoryPayload(json);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch = !normalizedSearch ||
        row.name?.toLowerCase().includes(normalizedSearch) ||
        row.slug?.toLowerCase().includes(normalizedSearch) ||
        row.sku?.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;
      if (filter === 'low_stock') return row.effective_stock_quantity > 0 && row.effective_stock_quantity <= LOW_STOCK_THRESHOLD;
      if (filter === 'out_of_stock') return row.effective_stock_quantity <= 0;
      if (filter === 'variant_managed') return row.has_variants;
      return true;
    });
  }, [filter, rows, search]);

  const selectedProduct = useMemo(
    () => rows.find((row) => String(row.id) === String(selectedProductId)) || null,
    [rows, selectedProductId]
  );

  useEffect(() => {
    if (!selectedProduct && rows.length > 0 && !selectedProductId) {
      const fallback = rows.find((row) => row.low_stock) || rows[0];
      setSelectedProductId(String(fallback.id));
      return;
    }

    if (selectedProduct?.has_variants) {
      setAdjustment((current) => ({
        ...current,
        scope: 'variant',
        productId: String(selectedProduct.id),
        variantId: current.variantId && selectedProduct.variants.some((variant) => String(variant.id) === String(current.variantId))
          ? current.variantId
          : String(selectedProduct.variants[0]?.id || ''),
      }));
      return;
    }

    if (selectedProduct) {
      setAdjustment((current) => ({
        ...current,
        scope: 'product',
        productId: String(selectedProduct.id),
        variantId: '',
      }));
    }
  }, [rows, selectedProduct, selectedProductId]);

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

      applyInventoryPayload(json);
      setNotice(successMessage);
    } catch (err) {
      setError(err.message || 'Inventory action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitAdjustment = async (event) => {
    event.preventDefault();

    if (adjustment.scope === 'variant') {
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
      productId: adjustment.productId,
      mode: adjustment.mode,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      note: adjustment.note,
    }, 'Product inventory updated.');
  };

  const handleQuickRestock = async (row, target) => {
    if (row.has_variants) {
      const firstEmptyVariant = row.variants.find((variant) => variant.stock_quantity <= LOW_STOCK_THRESHOLD) || row.variants[0];
      if (!firstEmptyVariant) return;

      await submitAction({
        action: 'adjust_variant',
        variantId: firstEmptyVariant.id,
        mode: 'set',
        quantity: target,
        reason: 'restock',
        note: `Quick restock from low-stock shortcut for ${firstEmptyVariant.label}.`,
      }, `${row.name} variant restocked.`);
      return;
    }

    await submitAction({
      action: 'adjust_product',
      productId: row.id,
      mode: 'set',
      quantity: target,
      reason: 'restock',
      note: 'Quick restock from low-stock shortcut.',
    }, `${row.name} restocked.`);
  };

  const lowStockRows = useMemo(
    () => rows.filter((row) => row.effective_stock_quantity <= LOW_STOCK_THRESHOLD),
    [rows]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#dbe7e0] bg-[linear-gradient(135deg,#f7fbf8_0%,#ecf7f0_55%,#fff8ef_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2E5C45]">Inventory Operations</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Move from stock monitoring to stock control.</h2>
            <p className="mt-2 text-sm text-gray-600">
              Adjust counts manually, restock low-stock items, edit variant quantities, and review every recent inventory change from one screen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">All SKUs</p>
              <p className="mt-1 text-2xl font-bold text-[#2E5C45]">{summary.total}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Low Stock</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{summary.lowStock}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Out of Stock</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{summary.outOfStock}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Variant Managed</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{summary.variantManaged}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Inventory list</h3>
                <p className="text-sm text-gray-500">Filter the catalog, then jump straight into product or variant adjustments.</p>
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product, slug, or SKU"
                  className="rounded-2xl border border-[#dbe7e0] bg-white px-4 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-[#2E5C45]"
                />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="rounded-2xl border border-[#dbe7e0] bg-white px-4 py-2 text-sm text-gray-900 outline-none"
                >
                  <option value="all">All inventory</option>
                  <option value="low_stock">Low stock</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="variant_managed">Variant managed</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-gray-500">Loading inventory...</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-3 pr-3">Product</th>
                      <th className="py-3 pr-3">Type</th>
                      <th className="py-3 pr-3">Status</th>
                      <th className="py-3 pr-3">Available</th>
                      <th className="py-3 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const tone = inventoryTone(row.effective_stock_quantity);
                      return (
                        <tr
                          key={row.id}
                          className={`border-b border-gray-50 align-top transition ${String(selectedProductId) === String(row.id) ? 'bg-[#f6fbf8]' : ''}`}
                        >
                          <td className="py-3 pr-3">
                            <button
                              type="button"
                              onClick={() => setSelectedProductId(String(row.id))}
                              className="text-left"
                            >
                              <div className="font-semibold text-gray-900">{row.name}</div>
                              <div className="text-xs text-gray-500">/{row.slug} {row.sku ? `· ${row.sku}` : ''}</div>
                            </button>
                          </td>
                          <td className="py-3 pr-3">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {row.has_variants ? `${row.variant_count} variants` : 'Direct stock'}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="text-sm capitalize text-gray-700">{row.moderation_status}</div>
                            <div className="text-xs text-gray-500">{row.is_active ? 'Live to buyers' : 'Not live'}</div>
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
                              {row.effective_stock_quantity} units
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductId(String(row.id));
                                  setAdjustment((current) => ({
                                    ...current,
                                    scope: row.has_variants ? 'variant' : 'product',
                                    productId: String(row.id),
                                    variantId: row.has_variants ? String(row.variants[0]?.id || '') : '',
                                    mode: 'add',
                                    quantity: '1',
                                  }));
                                }}
                                className="rounded-full border border-[#dbe7e0] px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#2E5C45] hover:text-[#2E5C45]"
                              >
                                Adjust
                              </button>
                              {row.effective_stock_quantity <= LOW_STOCK_THRESHOLD ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleQuickRestock(row, 8)}
                                    className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Restock to 8
                                  </button>
                                  <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleQuickRestock(row, 15)}
                                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Restock to 15
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500">
                          No products match the current filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Low-stock shortcuts</h3>
                <p className="text-sm text-gray-500">Handle at-risk inventory before it turns into lost sales.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={bulkRestockTarget}
                  onChange={(event) => setBulkRestockTarget(event.target.value)}
                  inputMode="numeric"
                  className="w-20 rounded-2xl border border-[#dbe7e0] px-3 py-2 text-sm outline-none focus:border-[#2E5C45]"
                />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitAction({
                    action: 'restock_low_stock',
                    targetQuantity: bulkRestockTarget,
                    scope: 'low_stock_only',
                    note: 'Bulk restock from low-stock shortcut panel.',
                  }, 'Low-stock direct-stock items restocked.')}
                  className="rounded-2xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#254a38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Restock direct-stock items
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {lowStockRows.slice(0, 6).map((row) => (
                <div key={row.id} className="rounded-2xl border border-[#eef4ef] bg-[#fbfdfb] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{row.name}</div>
                      <div className="text-xs text-gray-500">
                        {row.has_variants ? `${row.variant_count} variants` : row.sku || 'No SKU'}
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${inventoryTone(row.effective_stock_quantity)}`}>
                      {row.effective_stock_quantity} left
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleQuickRestock(row, 10)}
                      className="rounded-full border border-[#dbe7e0] px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#2E5C45] hover:text-[#2E5C45] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Set to 10
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleQuickRestock(row, 20)}
                      className="rounded-full border border-[#dbe7e0] px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#2E5C45] hover:text-[#2E5C45] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Set to 20
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(String(row.id))}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Open controls
                    </button>
                  </div>
                </div>
              ))}

              {lowStockRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#dbe7e0] bg-[#fbfdfb] p-5 text-sm text-gray-500">
                  Everything is above the low-stock threshold right now.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-3xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Manual adjustment</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedProduct?.has_variants
                ? 'This product is variant-managed. Update the specific variant that changed.'
                : 'Apply direct stock corrections, restocks, or shrinkage adjustments.'}
            </p>

            <form onSubmit={onSubmitAdjustment} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  className="w-full rounded-2xl border border-[#dbe7e0] bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#2E5C45]"
                >
                  {rows.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name} · {row.effective_stock_quantity} in stock
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct ? (
                <div className="rounded-2xl border border-[#eef4ef] bg-[#fbfdfb] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{selectedProduct.name}</div>
                      <div className="text-xs text-gray-500">
                        {selectedProduct.sku || 'No SKU'} {selectedProduct.has_variants ? `· ${selectedProduct.variant_count} variants` : '· Direct-stock product'}
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${inventoryTone(selectedProduct.effective_stock_quantity)}`}>
                      {selectedProduct.effective_stock_quantity} units available
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Adjustment mode</label>
                  <select
                    value={adjustment.mode}
                    onChange={(event) => setAdjustment((current) => ({ ...current, mode: event.target.value }))}
                    className="w-full rounded-2xl border border-[#dbe7e0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                  >
                    <option value="add">Add units</option>
                    <option value="subtract">Subtract units</option>
                    <option value="set">Set exact stock</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</label>
                  <input
                    value={adjustment.quantity}
                    onChange={(event) => setAdjustment((current) => ({ ...current, quantity: event.target.value }))}
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-[#dbe7e0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                  />
                </div>
              </div>

              {selectedProduct?.has_variants ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Variant</label>
                  <select
                    value={adjustment.variantId}
                    onChange={(event) => setAdjustment((current) => ({ ...current, variantId: event.target.value, scope: 'variant' }))}
                    className="w-full rounded-2xl border border-[#dbe7e0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                  >
                    {selectedProduct.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.label} · {variant.stock_quantity} in stock
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Reason</label>
                  <select
                    value={adjustment.reason}
                    onChange={(event) => setAdjustment((current) => ({ ...current, reason: event.target.value }))}
                    className="w-full rounded-2xl border border-[#dbe7e0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                  >
                    {REASON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Internal note</label>
                  <input
                    value={adjustment.note}
                    onChange={(event) => setAdjustment((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Optional context for your team"
                    className="w-full rounded-2xl border border-[#dbe7e0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedProduct}
                className="w-full rounded-2xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#254a38] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Applying adjustment...' : 'Apply inventory update'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Variant stock</h3>
            <p className="mt-1 text-sm text-gray-500">Inspect individual variant quantities without leaving the page.</p>

            {selectedProduct?.has_variants ? (
              <div className="mt-4 space-y-3">
                {selectedProduct.variants.map((variant) => (
                  <div key={variant.id} className="rounded-2xl border border-[#eef4ef] bg-[#fbfdfb] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{variant.label}</div>
                        <div className="text-xs text-gray-500">Variant ID: {variant.id.slice(0, 8)}...</div>
                      </div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${inventoryTone(variant.stock_quantity)}`}>
                        {variant.stock_quantity} units
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjustment((current) => ({
                          ...current,
                          scope: 'variant',
                          productId: String(selectedProduct.id),
                          variantId: String(variant.id),
                          mode: 'add',
                          quantity: '5',
                          reason: 'restock',
                        }))}
                        className="rounded-full border border-[#dbe7e0] px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#2E5C45] hover:text-[#2E5C45]"
                      >
                        Queue +5
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => submitAction({
                          action: 'adjust_variant',
                          variantId: variant.id,
                          mode: 'set',
                          quantity: 10,
                          reason: 'restock',
                          note: `Quick set to 10 from variant panel for ${variant.label}.`,
                        }, `${variant.label} updated.`)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Set to 10
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[#dbe7e0] bg-[#fbfdfb] p-5 text-sm text-gray-500">
                {selectedProduct ? 'This product does not have variants. Use the manual adjustment form above.' : 'Select a product to inspect its stock controls.'}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Adjustment history</h3>
            <p className="mt-1 text-sm text-gray-500">Recent inventory changes are logged for operational traceability.</p>

            <div className="mt-4 space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-[#eef4ef] bg-[#fbfdfb] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{entry.product_name}</div>
                      <div className="text-xs text-gray-500">
                        {entry.variant_label ? `${entry.variant_label} · ` : ''}
                        {entry.reason || 'correction'} · {entry.mode}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">{formatTimestamp(entry.created_at)}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <p className="text-gray-700">{entry.message}</p>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {entry.previous_quantity} → {entry.next_quantity}
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
          </div>
        </section>
      </div>
    </div>
  );
}
