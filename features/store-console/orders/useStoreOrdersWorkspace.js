'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildOrderSearchText,
  formatMoney,
  getReceiptUrl,
} from '@/features/store-console/orders/orders.utils';

export default function useStoreOrdersWorkspace() {
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
      const response = await fetch(`/api/store/orders?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load orders');
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
      const response = await fetch(`/api/store/orders/${orderId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load order details');
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
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (paymentFilter !== 'all' && String(row.status || '').toLowerCase() !== paymentFilter) return false;
      if (fulfillmentFilter !== 'all' && String(row.fulfillment_status || '').toLowerCase() !== fulfillmentFilter) return false;
      if (escrowFilter !== 'all' && String(row.escrow_status || '').toLowerCase() !== escrowFilter) return false;
      if (!normalizedQuery) return true;
      return buildOrderSearchText(row).includes(normalizedQuery);
    });
  }, [rows, query, paymentFilter, fulfillmentFilter, escrowFilter]);

  useEffect(() => {
    if (!filteredRows.length) {
      setSelectedOrderId('');
      setDetail(null);
      return;
    }
    const hasSelected = filteredRows.some((row) => row.id === selectedOrderId);
    if (!hasSelected) setSelectedOrderId(filteredRows[0].id);
  }, [filteredRows, selectedOrderId]);

  const stats = useMemo(() => {
    const totalOrders = filteredRows.length;
    const processingOrders = filteredRows.filter((row) => (row.fulfillment_status || 'processing') === 'processing').length;
    const shippedOrders = filteredRows.filter((row) => row.fulfillment_status === 'shipped').length;
    const deliveredOrders = filteredRows.filter((row) => row.fulfillment_status === 'delivered').length;
    const totalValue = filteredRows.reduce((sum, row) => sum + Number(row.store_subtotal || 0), 0);
    return { totalOrders, processingOrders, shippedOrders, deliveredOrders, totalValueLabel: formatMoney(totalValue) };
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

  const resetFilters = () => {
    setQuery('');
    setPaymentFilter('all');
    setFulfillmentFilter('all');
    setEscrowFilter('all');
  };

  return {
    loading,
    error,
    query,
    setQuery,
    paymentFilter,
    setPaymentFilter,
    fulfillmentFilter,
    setFulfillmentFilter,
    escrowFilter,
    setEscrowFilter,
    selectedOrderId,
    setSelectedOrderId,
    detailLoading,
    detailError,
    menuOpenForOrderId,
    setMenuOpenForOrderId,
    filteredRows,
    stats,
    detailOrder,
    detailItems,
    detailCustomer,
    detailAddress,
    detailUpdates,
    openReceipt,
    downloadReceipt,
    resetFilters,
  };
}
