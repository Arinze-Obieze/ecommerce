'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatMoney,
  getReceiptUrl,
  initialFulfillmentForm,
  initialReturnForm,
  prettify,
} from '@/features/store-console/order-detail/orderDetail.utils';

export default function useStoreOrderDetail(orderId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [returnSaving, setReturnSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(initialFulfillmentForm);
  const [returnForm, setReturnForm] = useState(initialReturnForm);

  const load = async () => {
    if (!orderId) {
      setLoading(false);
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/store/orders/${orderId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load order');

      setData(json.data || null);
      setForm((current) => ({
        ...current,
        fulfillment_status: json.data?.order?.fulfillment_status || initialFulfillmentForm.fulfillment_status,
      }));
      setReturnForm((current) => ({
        ...current,
        status: json.data?.returnRequest?.status || initialReturnForm.status,
        refund_status: json.data?.returnRequest?.refund_status || initialReturnForm.refund_status,
        refund_amount: json.data?.returnRequest?.refund_amount || '',
        refund_reference: json.data?.returnRequest?.refund_reference || '',
      }));
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [orderId]);

  const order = data?.order || null;
  const items = data?.items || [];
  const shippingAddress = data?.shippingAddress || null;
  const customer = data?.customer || null;
  const updates = data?.fulfillmentUpdates || [];
  const cancellationRequest = data?.cancellationRequest || null;
  const returnRequest = data?.returnRequest || null;
  const receiptUrl = getReceiptUrl(order?.id);
  const receiptDownloadUrl = getReceiptUrl(order?.id, true);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const storeSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );

  const summaryCards = useMemo(
    () => [
      { label: 'Payment', value: prettify(order?.status || 'pending') },
      { label: 'Escrow', value: prettify(order?.escrow_status || 'not_funded') },
      { label: 'Items', value: String(itemCount) },
      { label: 'Store subtotal', value: formatMoney(storeSubtotal) },
      { label: 'Return status', value: prettify(returnRequest?.status || 'none') },
      { label: 'Refund status', value: prettify(returnRequest?.refund_status || 'not_requested') },
    ],
    [itemCount, order?.escrow_status, order?.status, returnRequest?.refund_status, returnRequest?.status, storeSubtotal]
  );

  const submitFulfillmentUpdate = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const response = await fetch(`/api/store/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to update fulfillment');
      setNotice(`Order moved to ${prettify(json.data?.fulfillment_status || form.fulfillment_status)}.`);
      setForm((current) => ({
        ...current,
        tracking_reference: '',
        note: '',
      }));
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update fulfillment');
    } finally {
      setSaving(false);
    }
  };

  const submitReturnUpdate = async (event) => {
    event.preventDefault();
    try {
      setReturnSaving(true);
      setError('');
      setNotice('');
      const response = await fetch(`/api/store/orders/${orderId}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnForm),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to update return request');
      setNotice(`Return request updated to ${prettify(json.data?.status || returnForm.status)}.`);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update return request');
    } finally {
      setReturnSaving(false);
    }
  };

  return {
    loading,
    saving,
    returnSaving,
    error,
    notice,
    order,
    items,
    shippingAddress,
    customer,
    updates,
    cancellationRequest,
    returnRequest,
    receiptUrl,
    receiptDownloadUrl,
    form,
    setForm,
    returnForm,
    setReturnForm,
    summaryCards,
    submitFulfillmentUpdate,
    submitReturnUpdate,
  };
}
