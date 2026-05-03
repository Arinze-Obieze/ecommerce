'use client';

import Link from 'next/link';
import {
  buildVariantLabel,
  formatDateTime,
  formatMoney,
  prettify,
  REFUND_STATUS_OPTIONS,
  RETURN_STATUS_OPTIONS,
  STATUS_OPTIONS,
} from '@/features/store-console/order-detail/orderDetail.utils';

export function OrderDetailHeader({ order, receiptUrl, receiptDownloadUrl }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/store/dashboard/orders" className="text-sm font-semibold text-primary hover:underline">
            Back to orders
          </Link>
          <h2 className="mt-2 text-lg font-bold text-gray-900">Order {order.id}</h2>
          <p className="text-sm text-gray-500">
            Manage fulfillment state, dispatch details, and internal handling notes for this store order.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <a
            href={receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-primary bg-primary-soft px-3 py-2 text-sm font-semibold text-primary transition hover:bg-[#e2eee8]"
          >
            Preview Zova PDF
          </a>
          <a
            href={receiptDownloadUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Download receipt
          </a>
          <div className="rounded-xl bg-primary-soft px-3 py-2 text-sm font-semibold text-primary">
            {prettify(order.fulfillment_status || 'processing')}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderSummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">{card.label}</p>
          <p className="mt-1 break-words text-sm font-semibold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function OrderItemsSection({ items }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">Items in this store order</h3>
        <p className="text-sm text-gray-500">Only products belonging to this store are shown here.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-gray-900">{item.product?.name || 'Product'}</p>
                <p className="text-sm text-gray-500">
                  {item.product?.sku || 'No SKU'}
                  {buildVariantLabel(item.variant) ? ` • ${buildVariantLabel(item.variant)}` : ''}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Qty {item.quantity} • {formatMoney(item.price)} each
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-gray-500">No store-owned items found for this order.</p> : null}
      </div>
    </section>
  );
}

export function FulfillmentTimelineSection({ updates }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">Fulfillment timeline</h3>
        <p className="text-sm text-gray-500">Recent seller-side fulfillment updates appear here.</p>
      </div>
      <div className="space-y-3">
        {updates.map((update) => (
          <div key={update.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-gray-900">{prettify(update.status)}</p>
              <p className="text-xs text-gray-500">{formatDateTime(update.created_at)}</p>
            </div>
            {update.tracking_reference ? (
              <p className="mt-2 text-sm text-gray-600">
                Tracking reference: <span className="font-medium text-gray-900">{update.tracking_reference}</span>
              </p>
            ) : null}
            {update.note ? <p className="mt-2 text-sm text-gray-600">{update.note}</p> : null}
          </div>
        ))}
        {updates.length === 0 ? (
          <p className="text-sm text-gray-500">No fulfillment actions recorded yet. The first status update will start the timeline.</p>
        ) : null}
      </div>
    </section>
  );
}

export function FulfillmentUpdateForm({ form, setForm, saving, onSubmit }) {
  return (
    <section id="fulfillment-update" className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">Update fulfillment</h3>
      <p className="mt-1 text-sm text-gray-500">
        Move the order forward as operations progress. Shipping requires a tracking reference. Issue requires an internal note.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Fulfillment status</span>
          <select
            value={form.fulfillment_status}
            onChange={(event) => setForm((current) => ({ ...current, fulfillment_status: event.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Tracking reference</span>
          <input
            value={form.tracking_reference}
            onChange={(event) => setForm((current) => ({ ...current, tracking_reference: event.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Waybill, rider ref, or dispatch code"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Internal note</span>
          <textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            className="min-h-28 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Packaging note, delay reason, rider handoff detail, or issue summary"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save fulfillment update'}
        </button>
      </form>
    </section>
  );
}

export function ReceiptSection({ receiptUrl, receiptDownloadUrl }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">Zova receipt (PDF)</h3>
      <p className="mt-1 text-sm text-gray-500">
        Generate and share a branded order receipt PDF for operations, customer support, or dispatch records.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-primary bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition hover:bg-[#e2eee8]"
        >
          Preview Zova PDF
        </a>
        <a
          href={receiptDownloadUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Download receipt
        </a>
      </div>
      <div className="mt-4 md:hidden">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Mobile preview</p>
        <object data={receiptUrl} type="application/pdf" className="h-[60vh] w-full rounded-xl border border-border">
          <a
            href={receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary"
          >
            Open receipt preview
          </a>
        </object>
      </div>
    </section>
  );
}

export function ReturnRequestForm({ returnRequest, returnForm, setReturnForm, returnSaving, onSubmit }) {
  if (!returnRequest) return null;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">Handle return request</h3>
      <p className="mt-1 text-sm text-gray-500">
        Approve or reject the return, then track refund visibility for the buyer.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Return status</span>
          <select
            value={returnForm.status}
            onChange={(event) => setReturnForm((current) => ({ ...current, status: event.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {RETURN_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {prettify(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Refund status</span>
          <select
            value={returnForm.refund_status}
            onChange={(event) => setReturnForm((current) => ({ ...current, refund_status: event.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {REFUND_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {prettify(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Refund amount</span>
          <input
            value={returnForm.refund_amount}
            onChange={(event) => setReturnForm((current) => ({ ...current, refund_amount: event.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="0"
            inputMode="decimal"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Refund reference</span>
          <input
            value={returnForm.refund_reference}
            onChange={(event) => setReturnForm((current) => ({ ...current, refund_reference: event.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Gateway ref or ops ticket"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Seller note</span>
          <textarea
            value={returnForm.note}
            onChange={(event) => setReturnForm((current) => ({ ...current, note: event.target.value }))}
            className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Inspection result, approval note, or refund handling detail"
          />
        </label>

        <button
          type="submit"
          disabled={returnSaving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {returnSaving ? 'Saving...' : 'Save return update'}
        </button>
      </form>
    </section>
  );
}

export function OrderMetaSidebar({ cancellationRequest, returnRequest, customer, shippingAddress, order }) {
  return (
    <>
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Cancellation request</h3>
        {cancellationRequest ? (
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p><span className="font-semibold text-gray-900">Status:</span> {prettify(cancellationRequest.status)}</p>
            <p><span className="font-semibold text-gray-900">Requested:</span> {formatDateTime(cancellationRequest.created_at)}</p>
            <p><span className="font-semibold text-gray-900">Reason:</span> {cancellationRequest.reason}</p>
            {cancellationRequest.resolution_note ? (
              <p><span className="font-semibold text-gray-900">Resolution note:</span> {cancellationRequest.resolution_note}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No buyer cancellation request has been submitted for this order.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Return & refund</h3>
        {returnRequest ? (
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p><span className="font-semibold text-gray-900">Status:</span> {prettify(returnRequest.status)}</p>
            <p><span className="font-semibold text-gray-900">Refund:</span> {prettify(returnRequest.refund_status)}</p>
            <p><span className="font-semibold text-gray-900">Reason:</span> {returnRequest.reason}</p>
            {returnRequest.details ? <p><span className="font-semibold text-gray-900">Details:</span> {returnRequest.details}</p> : null}
            {returnRequest.refund_amount ? (
              <p><span className="font-semibold text-gray-900">Refund amount:</span> {formatMoney(returnRequest.refund_amount)}</p>
            ) : null}
            {returnRequest.refund_reference ? (
              <p><span className="font-semibold text-gray-900">Refund reference:</span> {returnRequest.refund_reference}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No return request has been submitted for this order.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Customer</h3>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p><span className="font-semibold text-gray-900">Name:</span> {customer?.full_name || 'Unknown customer'}</p>
          <p><span className="font-semibold text-gray-900">Email:</span> {customer?.email || '-'}</p>
          <p><span className="font-semibold text-gray-900">Phone:</span> {customer?.phone || shippingAddress?.phone || '-'}</p>
          <p><span className="font-semibold text-gray-900">Order created:</span> {formatDateTime(order.created_at)}</p>
          <p><span className="font-semibold text-gray-900">Payment reference:</span> {order.payment_reference || '-'}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Shipping address</h3>
        {shippingAddress ? (
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{shippingAddress.label}</p>
            <p>{shippingAddress.address_line1}</p>
            {shippingAddress.address_line2 ? <p>{shippingAddress.address_line2}</p> : null}
            <p>{shippingAddress.city}, {shippingAddress.state}</p>
            <p>{shippingAddress.country}{shippingAddress.postal_code ? ` • ${shippingAddress.postal_code}` : ''}</p>
            <p>{shippingAddress.phone}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No shipping address snapshot was found for this order.</p>
        )}
      </section>
    </>
  );
}
