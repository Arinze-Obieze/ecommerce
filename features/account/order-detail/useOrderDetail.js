'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ORDER_STATUS } from '@/features/account/order-detail/orderDetail.constants';
import { buildTimeline } from '@/features/account/order-detail/orderDetail.utils';

export default function useOrderDetail({ orderId, userId }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [cancellationRequest, setCancellationRequest] = useState(null);
  const [returnRequest, setReturnRequest] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnBusy, setReturnBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || !orderId) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const supabase = createClient();

        const { data: orderRow, error: orderError } = await supabase
          .from('orders')
          .select('id, user_id, total_amount, status, payment_reference, created_at, updated_at, fulfillment_status, escrow_status, buyer_confirmed_at, escrow_funded_at, escrow_released_at')
          .eq('id', orderId)
          .eq('user_id', userId)
          .maybeSingle();

        if (orderError) throw orderError;
        if (!orderRow) throw new Error('Order not found.');

        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('id, product_id, quantity, price, variant_id')
          .eq('order_id', orderRow.id);

        if (itemsError) throw itemsError;

        const { data: shippingRow, error: shippingError } = await supabase
          .from('order_shipping_addresses')
          .select('id, label, address_line1, address_line2, city, state, postal_code, country, phone')
          .eq('order_id', orderRow.id)
          .maybeSingle();

        if (shippingError && shippingError.code !== 'PGRST116') {
          throw shippingError;
        }

        const productIds = [...new Set((orderItems || []).map((item) => item.product_id).filter(Boolean))];
        const variantIds = [...new Set((orderItems || []).map((item) => item.variant_id).filter(Boolean))];
        let productsById = new Map();
        let variantsById = new Map();

        if (productIds.length > 0) {
          const { data: productRows, error: productsError } = await supabase
            .from('products')
            .select('id, name, slug, image_urls')
            .in('id', productIds);

          if (!productsError) {
            productsById = new Map((productRows || []).map((product) => [product.id, product]));
          }
        }

        if (variantIds.length > 0) {
          const { data: variantRows, error: variantsError } = await supabase
            .from('product_variants')
            .select('id, color, size')
            .in('id', variantIds);

          if (!variantsError) {
            variantsById = new Map((variantRows || []).map((variant) => [variant.id, variant]));
          }
        }

        setOrder(orderRow);
        setShippingAddress(shippingRow || null);
        setItems(
          (orderItems || []).map((item) => ({
            ...item,
            product: productsById.get(item.product_id) || null,
            variant: variantsById.get(item.variant_id) || null,
          }))
        );

        const cancelRes = await fetch(`/api/account/orders/${orderRow.id}/cancel`, { cache: 'no-store' });
        const cancelJson = await cancelRes.json();
        if (cancelRes.ok) {
          setCancellationRequest(cancelJson.data?.cancellation_request || null);
        }

        const returnRes = await fetch(`/api/account/orders/${orderRow.id}/return`, { cache: 'no-store' });
        const returnJson = await returnRes.json();
        if (returnRes.ok) {
          setReturnRequest(returnJson.data?.return_request || null);
        }
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.message || 'Failed to load order details.');
        setOrder(null);
        setShippingAddress(null);
        setItems([]);
        setCancellationRequest(null);
        setReturnRequest(null);
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [orderId, userId]);

  const status = ORDER_STATUS[String(order?.status || '').toLowerCase()] || ORDER_STATUS.pending;
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const timeline = useMemo(() => buildTimeline(order), [order]);
  const orderTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );

  const canRequestCancellation = Boolean(
    order &&
      String(order.status || '').toLowerCase() !== 'cancelled' &&
      !['packed', 'shipped', 'delivered'].includes(String(order.fulfillment_status || '').toLowerCase()) &&
      String(cancellationRequest?.status || '').toLowerCase() !== 'pending'
  );

  const canRequestReturn = Boolean(
    order &&
      ['delivered', 'delivered_confirmed'].includes(String(order.fulfillment_status || '').toLowerCase()) &&
      !['pending', 'approved', 'received', 'processing'].includes(String(returnRequest?.status || '').toLowerCase())
  );

  const submitCancellationRequest = async () => {
    try {
      setCancelBusy(true);
      setError('');
      const res = await fetch(`/api/account/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit cancellation request');
      setCancellationRequest(json.data || null);
      setCancelReason('');
      setCancelModalOpen(false);
    } catch (requestError) {
      setError(requestError.message || 'Failed to submit cancellation request');
    } finally {
      setCancelBusy(false);
    }
  };

  const submitReturnRequest = async () => {
    try {
      setReturnBusy(true);
      setError('');
      const res = await fetch(`/api/account/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: returnReason,
          details: returnDetails,
          requested_resolution: 'refund',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit return request');
      setReturnRequest(json.data || null);
      setReturnReason('');
      setReturnDetails('');
    } catch (requestError) {
      setError(requestError.message || 'Failed to submit return request');
    } finally {
      setReturnBusy(false);
    }
  };

  return {
    order,
    items,
    shippingAddress,
    cancellationRequest,
    returnRequest,
    cancelReason,
    cancelBusy,
    cancelModalOpen,
    returnReason,
    returnDetails,
    returnBusy,
    loading,
    error,
    status,
    itemCount,
    timeline,
    orderTotal,
    canRequestCancellation,
    canRequestReturn,
    setCancelReason,
    setCancelModalOpen,
    setReturnReason,
    setReturnDetails,
    submitCancellationRequest,
    submitReturnRequest,
  };
}
