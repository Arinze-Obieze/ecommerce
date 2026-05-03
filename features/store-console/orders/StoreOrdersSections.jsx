'use client';

import Link from 'next/link';
import DashboardPageHeader from '@/components/store-console/dashboard/DashboardPageHeader';
import StatCard from '@/components/store-console/dashboard/StatCard';
import {
  ESCROW_FILTERS,
  FULFILLMENT_FILTERS,
  formatDateTime,
  formatMoney,
  PAYMENT_FILTERS,
  prettify,
} from '@/features/store-console/orders/orders.utils';

export function OrdersHeader() {
  return <DashboardPageHeader title="Store Orders" subtitle="Search, filter, and inspect order details quickly from one workspace." />;
}

export function OrdersStats({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      <StatCard label="Total Orders" value={stats.totalOrders} loading={loading} tone="default" />
      <StatCard label="Processing" value={stats.processingOrders} loading={loading} tone="default" />
      <StatCard label="Shipped" value={stats.shippedOrders} loading={loading} tone="default" />
      <StatCard label="Delivered" value={stats.deliveredOrders} loading={loading} tone="default" />
      <div className="col-span-2 xl:col-span-1">
        <StatCard label="Store Revenue (Filtered)" value={stats.totalValueLabel} loading={loading} tone="default" />
      </div>
    </div>
  );
}

export function OrdersFilters({
  query,
  setQuery,
  paymentFilter,
  setPaymentFilter,
  fulfillmentFilter,
  setFulfillmentFilter,
  escrowFilter,
  setEscrowFilter,
  onReset,
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search order ID, payment ref, status"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-2 xl:col-span-2"
        />
        <FilterSelect value={paymentFilter} onChange={setPaymentFilter} options={PAYMENT_FILTERS} allLabel="All payment" />
        <FilterSelect value={fulfillmentFilter} onChange={setFulfillmentFilter} options={FULFILLMENT_FILTERS} allLabel="All fulfillment" />
        <FilterSelect value={escrowFilter} onChange={setEscrowFilter} options={ESCROW_FILTERS} allLabel="All escrow" />
        <button type="button" onClick={onReset} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
          Reset
        </button>
      </div>
    </div>
  );
}

export function OrdersTableCard({
  loading,
  filteredRows,
  selectedOrderId,
  setSelectedOrderId,
  menuOpenForOrderId,
  setMenuOpenForOrderId,
  onOpenReceipt,
  onDownloadReceipt,
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      {loading ? (
        <p className="text-sm text-gray-500">Loading orders...</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Payment</th>
                  <th className="py-2 pr-3">Fulfillment</th>
                  <th className="py-2 pr-3">Escrow</th>
                  <th className="py-2 pr-3">Items</th>
                  <th className="py-2 pr-3">Store Subtotal</th>
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const active = selectedOrderId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-gray-50 transition ${active ? 'bg-primary-soft' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedOrderId(row.id)}
                    >
                      <td className="py-2 pr-3 font-mono text-xs font-semibold text-primary">{row.id.slice(0, 8)}</td>
                      <td className="py-2 pr-3 capitalize">{prettify(row.status || 'pending')}</td>
                      <td className="py-2 pr-3 capitalize">{prettify(row.fulfillment_status || 'processing')}</td>
                      <td className="py-2 pr-3 capitalize">{prettify(row.escrow_status || 'not_funded')}</td>
                      <td className="py-2 pr-3">{row.items_count || 0}</td>
                      <td className="py-2 pr-3">{formatMoney(row.store_subtotal || 0)}</td>
                      <td className="whitespace-nowrap py-2 pr-3">{formatDateTime(row.created_at)}</td>
                      <td className="py-2 pr-0">
                        <QuickActionsMenu
                          orderId={row.id}
                          open={menuOpenForOrderId === row.id}
                          onToggle={() => setMenuOpenForOrderId((current) => (current === row.id ? '' : row.id))}
                          onClose={() => setMenuOpenForOrderId('')}
                          onOpenReceipt={onOpenReceipt}
                          onDownloadReceipt={onDownloadReceipt}
                        />
                      </td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">No orders match your current filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredRows.map((row) => {
              const active = selectedOrderId === row.id;
              return (
                <div
                  key={row.id}
                  onClick={() => setSelectedOrderId(row.id)}
                  className={`w-full cursor-pointer rounded-xl border p-3 text-left shadow-sm transition ${active ? 'border-primary bg-primary-soft' : 'border-border bg-white hover:bg-gray-50'}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedOrderId(row.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold text-primary">{row.id.slice(0, 8)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{formatDateTime(row.created_at)}</p>
                      <QuickActionsMenu
                        orderId={row.id}
                        open={menuOpenForOrderId === row.id}
                        onToggle={() => setMenuOpenForOrderId((current) => (current === row.id ? '' : row.id))}
                        onClose={() => setMenuOpenForOrderId('')}
                        onOpenReceipt={onOpenReceipt}
                        onDownloadReceipt={onDownloadReceipt}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{prettify(row.fulfillment_status || 'processing')}</p>
                  <p className="mt-1 text-xs text-gray-600">Payment: {prettify(row.status || 'pending')} • Escrow: {prettify(row.escrow_status || 'not_funded')}</p>
                  <p className="mt-1 text-xs text-gray-600">{row.items_count || 0} items • {formatMoney(row.store_subtotal || 0)}</p>
                </div>
              );
            })}
            {filteredRows.length === 0 ? <p className="text-center text-sm text-gray-500">No orders match your current filters.</p> : null}
          </div>
        </>
      )}
    </div>
  );
}

export function OrderPreviewSidebar({
  selectedOrderId,
  detailLoading,
  detailError,
  detailOrder,
  detailCustomer,
  detailItems,
  detailAddress,
  detailUpdates,
  onOpenReceipt,
}) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900">Order Details</h3>
          {selectedOrderId ? (
            <Link href={`/store/dashboard/orders/${selectedOrderId}`} className="text-xs font-semibold text-primary hover:underline">
              Open full page
            </Link>
          ) : null}
        </div>

        {!selectedOrderId ? <p className="text-sm text-gray-500">Select an order from the table to preview details.</p> : null}
        {detailLoading ? <p className="text-sm text-gray-500">Loading detail...</p> : null}
        {detailError ? <p className="text-sm text-red-600">{detailError}</p> : null}

        {detailOrder && !detailLoading ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-[#e4ece7] bg-[#f8fbf9] p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Order ID</p>
              <p className="mt-1 break-all font-mono text-xs text-gray-800">{detailOrder.id}</p>
              <p className="mt-2 text-xs text-gray-600">{formatDateTime(detailOrder.created_at)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MiniCard label="Payment" value={prettify(detailOrder.status || 'pending')} />
              <MiniCard label="Fulfillment" value={prettify(detailOrder.fulfillment_status || 'processing')} />
              <MiniCard label="Escrow" value={prettify(detailOrder.escrow_status || 'not_funded')} />
              <MiniCard label="Store subtotal" value={formatMoney(detailItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0))} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/store/dashboard/orders/${selectedOrderId}#fulfillment-update`} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
                Update fulfillment
              </Link>
              <button
                type="button"
                onClick={() => onOpenReceipt(selectedOrderId)}
                className="rounded-lg border border-primary bg-primary-soft px-3 py-2 text-xs font-semibold text-primary transition hover:bg-[#e2eee8]"
              >
                Preview Zova PDF
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</p>
              {detailCustomer ? (
                <div className="mt-1 rounded-lg border border-[#e4ece7] p-2 text-xs text-gray-700">
                  <p className="font-semibold text-gray-900">{detailCustomer.full_name || 'Unnamed customer'}</p>
                  <p>{detailCustomer.email || '-'}</p>
                  <p>{detailCustomer.phone || '-'}</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-500">No customer profile details found.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Items ({detailItems.length})</p>
              <div className="mt-1 max-h-40 space-y-1 overflow-auto rounded-lg border border-[#e4ece7] p-2">
                {detailItems.map((item) => (
                  <div key={item.id} className="rounded-md border border-gray-100 p-2 text-xs">
                    <p className="font-semibold text-gray-900">{item.product?.name || 'Product'}</p>
                    <p className="text-gray-600">Qty {item.quantity} • {formatMoney(item.price)}</p>
                    <p className="text-gray-500">
                      {item.variant?.color || '-'} {item.variant?.size ? `• ${item.variant.size}` : ''}
                    </p>
                  </div>
                ))}
                {detailItems.length === 0 ? <p className="text-xs text-gray-500">No store-owned items.</p> : null}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Shipping</p>
              {detailAddress ? (
                <div className="mt-1 rounded-lg border border-[#e4ece7] p-2 text-xs text-gray-700">
                  <p>{detailAddress.address_line1 || '-'}</p>
                  {detailAddress.address_line2 ? <p>{detailAddress.address_line2}</p> : null}
                  <p>{[detailAddress.city, detailAddress.state, detailAddress.country].filter(Boolean).join(', ') || '-'}</p>
                  <p>{detailAddress.phone || '-'}</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-500">No shipping address found.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Timeline</p>
              <p className="mt-1 text-xs text-gray-600">{detailUpdates.length} seller updates logged.</p>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function QuickActionsMenu({ orderId, open, onToggle, onClose, onOpenReceipt, onDownloadReceipt }) {
  if (!orderId) return null;

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-600 transition hover:bg-gray-100"
        aria-label="Open quick actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-base leading-none">...</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-border bg-white p-2 shadow-lg" role="menu">
          <Link href={`/store/dashboard/orders/${orderId}`} className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-primary-soft" onClick={onClose}>
            Open full order
          </Link>
          <Link href={`/store/dashboard/orders/${orderId}#fulfillment-update`} className="mt-1 block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-primary-soft" onClick={onClose}>
            Update fulfillment status
          </Link>
          <button type="button" onClick={() => { onOpenReceipt(orderId); onClose(); }} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-primary-soft">
            Preview Zova receipt (PDF)
          </button>
          <button type="button" onClick={() => { onDownloadReceipt(orderId); onClose(); }} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-primary-soft">
            Download Zova receipt
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
      {options.map((option) => (
        <option key={option} value={option}>
          {option === 'all' ? allLabel : prettify(option)}
        </option>
      ))}
    </select>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[#e4ece7] p-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-gray-900">{value}</p>
    </div>
  );
}
