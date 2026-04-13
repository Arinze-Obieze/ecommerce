'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const PAYMENT_FILTERS = ['all', 'pending', 'paid', 'failed', 'refunded'];
const FULFILLMENT_FILTERS = ['all', 'processing', 'packed', 'shipped', 'delivered', 'issue'];
const ESCROW_FILTERS = ['all', 'not_funded', 'funded', 'released'];

function prettify(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function buildOrderSearchText(row) {
  return [
    row.id,
    row.payment_reference,
    row.status,
    row.fulfillment_status,
    row.escrow_status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getReceiptUrl(orderId, download = false) {
  if (!orderId) return '#';
  const query = download ? '?download=1' : '';
  return `/api/store/orders/${orderId}/receipt${query}`;
}

function StatValue({ loading, children }) {
  if (loading) {
    return <span className="mt-1 block h-6 w-16 animate-pulse rounded-md bg-gray-200" aria-hidden="true" />;
  }
  return <>{children}</>;
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
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d0d7de] text-gray-600 transition hover:bg-gray-100"
        aria-label="Open quick actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-base leading-none">...</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#dbe7e0] bg-white p-2 shadow-lg" role="menu">
          <Link
            href={`/store/dashboard/orders/${orderId}`}
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-[#f2f7f4]"
            onClick={onClose}
          >
            Open full order
          </Link>
          <Link
            href={`/store/dashboard/orders/${orderId}#fulfillment-update`}
            className="mt-1 block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-[#f2f7f4]"
            onClick={onClose}
          >
            Update fulfillment status
          </Link>
          <button
            type="button"
            onClick={() => {
              onOpenReceipt(orderId);
              onClose();
            }}
            className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-[#f2f7f4]"
          >
            Preview Zova receipt (PDF)
          </button>
          <button
            type="button"
            onClick={() => {
              onDownloadReceipt(orderId);
              onClose();
            }}
            className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-[#f2f7f4]"
          >
            Download Zova receipt
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function StoreOrdersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [escrowFilter, setEscrowFilter] = useState('all');

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [menuOpenForOrderId, setMenuOpenForOrderId] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: '1', limit: '100' });
      const res = await fetch(`/api/store/orders?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load orders');
      const data = Array.isArray(json.data) ? json.data : [];
      setRows(data);
      if (data.length > 0) {
        setSelectedOrderId((current) => current || data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetail = async (orderId) => {
    if (!orderId) return;
    try {
      setDetailLoading(true);
      setDetailError('');
      const res = await fetch(`/api/store/orders/${orderId}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load order details');
      setDetail(json.data || null);
    } catch (err) {
      setDetailError(err.message || 'Failed to load order details');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;
    void loadOrderDetail(selectedOrderId);
  }, [selectedOrderId]);

  useEffect(() => {
    const closeMenu = () => setMenuOpenForOrderId('');
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (paymentFilter !== 'all' && String(row.status || '').toLowerCase() !== paymentFilter) return false;
      if (fulfillmentFilter !== 'all' && String(row.fulfillment_status || '').toLowerCase() !== fulfillmentFilter) return false;
      if (escrowFilter !== 'all' && String(row.escrow_status || '').toLowerCase() !== escrowFilter) return false;
      if (!q) return true;
      return buildOrderSearchText(row).includes(q);
    });
  }, [rows, query, paymentFilter, fulfillmentFilter, escrowFilter]);

  useEffect(() => {
    if (!filteredRows.length) {
      setSelectedOrderId('');
      setDetail(null);
      return;
    }
    const hasSelected = filteredRows.some((row) => row.id === selectedOrderId);
    if (!hasSelected) {
      setSelectedOrderId(filteredRows[0].id);
    }
  }, [filteredRows, selectedOrderId]);

  const stats = useMemo(() => {
    const totalOrders = filteredRows.length;
    const processingOrders = filteredRows.filter((row) => (row.fulfillment_status || 'processing') === 'processing').length;
    const shippedOrders = filteredRows.filter((row) => row.fulfillment_status === 'shipped').length;
    const deliveredOrders = filteredRows.filter((row) => row.fulfillment_status === 'delivered').length;
    const totalValue = filteredRows.reduce((sum, row) => sum + Number(row.store_subtotal || 0), 0);

    return {
      totalOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalValue,
    };
  }, [filteredRows]);

  const detailOrder = detail?.order || null;
  const detailItems = detail?.items || [];
  const detailCustomer = detail?.customer || null;
  const detailAddress = detail?.shippingAddress || null;
  const detailUpdates = detail?.fulfillmentUpdates || [];

  const openReceipt = (orderId) => {
    if (!orderId) return;
    window.open(getReceiptUrl(orderId), '_blank', 'noopener,noreferrer');
  };

  const downloadReceipt = (orderId) => {
    if (!orderId) return;
    window.open(getReceiptUrl(orderId, true), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Orders</h2>
        <p className="text-sm text-gray-500">Search, filter, and inspect order details quickly from one workspace.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Total Orders</p>
          <p className="mt-1 text-base font-semibold text-gray-900"><StatValue loading={loading}>{stats.totalOrders}</StatValue></p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Processing</p>
          <p className="mt-1 text-base font-semibold text-gray-900"><StatValue loading={loading}>{stats.processingOrders}</StatValue></p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Shipped</p>
          <p className="mt-1 text-base font-semibold text-gray-900"><StatValue loading={loading}>{stats.shippedOrders}</StatValue></p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Delivered</p>
          <p className="mt-1 text-base font-semibold text-gray-900"><StatValue loading={loading}>{stats.deliveredOrders}</StatValue></p>
        </div>
        <div className="col-span-2 rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm xl:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">Store Revenue (Filtered)</p>
          <p className="mt-1 text-base font-semibold text-gray-900"><StatValue loading={loading}>{formatMoney(stats.totalValue)}</StatValue></p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order ID, payment ref, status"
                className="rounded-xl border border-[#d0d7de] bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#2E5C45] focus:ring-2 focus:ring-[#2E5C45]/20 md:col-span-2 xl:col-span-2"
              />

              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                className="rounded-xl border border-[#d0d7de] bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#2E5C45] focus:ring-2 focus:ring-[#2E5C45]/20"
              >
                {PAYMENT_FILTERS.map((value) => (
                  <option key={value} value={value}>{value === 'all' ? 'All payment' : prettify(value)}</option>
                ))}
              </select>

              <select
                value={fulfillmentFilter}
                onChange={(event) => setFulfillmentFilter(event.target.value)}
                className="rounded-xl border border-[#d0d7de] bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#2E5C45] focus:ring-2 focus:ring-[#2E5C45]/20"
              >
                {FULFILLMENT_FILTERS.map((value) => (
                  <option key={value} value={value}>{value === 'all' ? 'All fulfillment' : prettify(value)}</option>
                ))}
              </select>

              <select
                value={escrowFilter}
                onChange={(event) => setEscrowFilter(event.target.value)}
                className="rounded-xl border border-[#d0d7de] bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#2E5C45] focus:ring-2 focus:ring-[#2E5C45]/20"
              >
                {ESCROW_FILTERS.map((value) => (
                  <option key={value} value={value}>{value === 'all' ? 'All escrow' : prettify(value)}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setPaymentFilter('all');
                  setFulfillmentFilter('all');
                  setEscrowFilter('all');
                }}
                className="rounded-xl border border-[#d0d7de] px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
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
                            className={`cursor-pointer border-b border-gray-50 transition ${active ? 'bg-[#f2f7f4]' : 'hover:bg-gray-50'}`}
                            onClick={() => setSelectedOrderId(row.id)}
                          >
                            <td className="py-2 pr-3 font-mono text-xs font-semibold text-[#2E5C45]">{row.id.slice(0, 8)}</td>
                            <td className="py-2 pr-3 capitalize">{prettify(row.status || 'pending')}</td>
                            <td className="py-2 pr-3 capitalize">{prettify(row.fulfillment_status || 'processing')}</td>
                            <td className="py-2 pr-3 capitalize">{prettify(row.escrow_status || 'not_funded')}</td>
                            <td className="py-2 pr-3">{row.items_count || 0}</td>
                            <td className="py-2 pr-3">{formatMoney(row.store_subtotal || 0)}</td>
                            <td className="py-2 pr-3 whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                            <td className="py-2 pr-0">
                              <QuickActionsMenu
                                orderId={row.id}
                                open={menuOpenForOrderId === row.id}
                                onToggle={() => setMenuOpenForOrderId((current) => (current === row.id ? '' : row.id))}
                                onClose={() => setMenuOpenForOrderId('')}
                                onOpenReceipt={openReceipt}
                                onDownloadReceipt={downloadReceipt}
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
                        className={`w-full cursor-pointer rounded-xl border p-3 text-left shadow-sm transition ${active ? 'border-[#2E5C45] bg-[#f2f7f4]' : 'border-[#dbe7e0] bg-white hover:bg-gray-50'}`}
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
                          <p className="font-mono text-xs font-semibold text-[#2E5C45]">{row.id.slice(0, 8)}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">{formatDateTime(row.created_at)}</p>
                            <QuickActionsMenu
                              orderId={row.id}
                              open={menuOpenForOrderId === row.id}
                              onToggle={() => setMenuOpenForOrderId((current) => (current === row.id ? '' : row.id))}
                              onClose={() => setMenuOpenForOrderId('')}
                              onOpenReceipt={openReceipt}
                              onDownloadReceipt={downloadReceipt}
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

        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900">Order Details</h3>
              {selectedOrderId ? (
                <Link href={`/store/dashboard/orders/${selectedOrderId}`} className="text-xs font-semibold text-[#2E5C45] hover:underline">
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
                  <div className="rounded-lg border border-[#e4ece7] p-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Payment</p>
                    <p className="mt-1 text-xs font-semibold text-gray-900">{prettify(detailOrder.status || 'pending')}</p>
                  </div>
                  <div className="rounded-lg border border-[#e4ece7] p-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Fulfillment</p>
                    <p className="mt-1 text-xs font-semibold text-gray-900">{prettify(detailOrder.fulfillment_status || 'processing')}</p>
                  </div>
                  <div className="rounded-lg border border-[#e4ece7] p-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Escrow</p>
                    <p className="mt-1 text-xs font-semibold text-gray-900">{prettify(detailOrder.escrow_status || 'not_funded')}</p>
                  </div>
                  <div className="rounded-lg border border-[#e4ece7] p-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Store subtotal</p>
                    <p className="mt-1 text-xs font-semibold text-gray-900">
                      {formatMoney(detailItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0))}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/store/dashboard/orders/${selectedOrderId}#fulfillment-update`}
                    className="rounded-lg border border-[#d0d7de] px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Update fulfillment
                  </Link>
                  <button
                    type="button"
                    onClick={() => openReceipt(selectedOrderId)}
                    className="rounded-lg border border-[#2E5C45] bg-[#eef4f0] px-3 py-2 text-xs font-semibold text-[#2E5C45] transition hover:bg-[#e2eee8]"
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
                        <p className="text-gray-500">{item.variant?.color || '-'} {item.variant?.size ? `• ${item.variant.size}` : ''}</p>
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
      </div>
    </div>
  );
}
