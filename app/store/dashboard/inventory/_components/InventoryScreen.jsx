'use client';

import { Fragment } from 'react';
import DashboardPageHeader from '@/components/Store/dashboard/DashboardPageHeader';
import AlertBanner from '@/components/Store/dashboard/AlertBanner';
import { FILTER_OPTIONS } from '../_lib/constants';
import { formatTimestamp } from '../_lib/inventory-utils';
import { useInventoryWorkspace } from '../_hooks/useInventoryWorkspace';
import {
  AdjustmentPanel,
  PaginationControls,
  ProductMeta,
  StatCard,
  StockBadge,
} from './InventoryShared';

export default function InventoryScreen() {
  const {
    rows,
    history,
    summary,
    pagination,
    loading,
    submitting,
    error,
    notice,
    searchDraft,
    filter,
    pageSize,
    expandedRowId,
    adjustment,
    showHistory,
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
  } = useInventoryWorkspace();

  return (
    <div className="space-y-5">
      <DashboardPageHeader
        title="Find stock issues and fix counts fast."
        subtitle={`Search the catalog, act on low-stock rows, and open inline operations only when you need them. Low stock starts at ${lowStockThreshold} units.`}
      >
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </DashboardPageHeader>

      <section className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="All SKUs" value={summary.total} loading={loading} />
          <StatCard label="Low stock" value={summary.lowStock} tone="amber" loading={loading} />
          <StatCard label="Out of stock" value={summary.outOfStock} tone="red" loading={loading} />
          <StatCard label="Variant managed" value={summary.variantManaged} tone="slate" loading={loading} />
        </div>
      </section>

      <AlertBanner type="error" message={error} />
      <AlertBanner type="notice" message={notice} />

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
                            <button
                              type="button"
                              onClick={() => window.open(`/store/dashboard/products/${row.id}`, '_blank')}
                              className="rounded-full border border-[#dbe7e0] px-3 py-1 text-xs font-semibold text-gray-700 hover:border-[#2E5C45] hover:text-[#2E5C45]"
                            >
                              View details
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
                              onClose={() => setExpandedRowId('')}
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
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openAdjustment(row)} className="shrink-0 rounded-full border border-[#2E5C45] px-2.5 py-1 font-semibold text-[#2E5C45]">
                        Adjust
                      </button>
                      <button type="button" onClick={() => window.open(`/store/dashboard/products/${row.id}`, '_blank')} className="shrink-0 rounded-full border border-[#2E5C45] px-2.5 py-1 font-semibold text-[#2E5C45]">
                        View
                      </button>
                    </div>
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
                        onClose={() => setExpandedRowId('')}
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
    </div>
  );
}
