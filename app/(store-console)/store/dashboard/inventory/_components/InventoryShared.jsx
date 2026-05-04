'use client';

import SharedStatCard from '@/components/store-console/dashboard/StatCard';
import { PAGE_SIZE_OPTIONS, REASON_OPTIONS } from '../_lib/constants';
import { inventoryTone } from '../_lib/inventory-utils';

export function StatCard({ label, value, tone = 'emerald', loading = false }) {
  const toneMap = { emerald: 'brand', amber: 'amber', red: 'red', slate: 'slate' };
  return <SharedStatCard label={label} value={value} loading={loading} tone={toneMap[tone] ?? 'brand'} />;
}

export function StockBadge({ stock, lowStockThreshold }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${inventoryTone(stock, lowStockThreshold)}`}>
      {stock} units
    </span>
  );
}

export function ProductMeta({ row }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-gray-900">{row.name}</p>
      <p className="mt-0.5 truncate text-xs text-gray-500">
        /{row.slug} {row.sku ? `· ${row.sku}` : ''}
      </p>
    </div>
  );
}

export function PaginationControls({ pagination, pageSize, setPage, setPageSize, loading }) {
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
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option} / page</option>)}
        </select>
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function AdjustmentPanel({ row, adjustment, setAdjustment, onSubmit, submitting, lowStockThreshold, onClose }) {
  if (!row) return null;

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#B8D4A0] bg-[#f7fbf8] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">Adjust {row.name}</p>
          <p className="text-xs text-gray-500">
            {row.has_variants ? 'Variant-managed product. Choose the exact size/color that changed.' : 'Direct-stock product.'}
          </p>
        </div>
        <div className="flex gap-2 items-start">
          <StockBadge stock={row.effective_stock_quantity} lowStockThreshold={lowStockThreshold} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            title="Close adjustment form"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {row.has_variants ? (
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Variant</span>
            <select
              value={adjustment.variantId}
              onChange={(event) => setAdjustment((current) => ({ ...current, scope: 'variant', variantId: event.target.value }))}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
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
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
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
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reason</span>
          <select
            value={adjustment.reason}
            onChange={(event) => setAdjustment((current) => ({ ...current, reason: event.target.value }))}
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
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
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Applying...' : 'Apply update'}
        </button>
        {row.has_variants ? (row.variants || []).slice(0, 4).map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => setAdjustment((current) => ({ ...current, scope: 'variant', variantId: String(variant.id), mode: 'add', quantity: '5', reason: 'restock' }))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
          >
            Queue +5 for {variant.label}
          </button>
        )) : null}
      </div>
    </form>
  );
}
