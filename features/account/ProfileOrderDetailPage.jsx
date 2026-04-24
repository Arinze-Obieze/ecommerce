'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiClock, FiHome, FiMapPin, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Brand tokens — sourced from app/globals.css
const THEME = {
  green:       'var(--zova-primary-action)',
  greenDark:   'var(--zova-primary-action-hover)',
  greenTint:   'var(--zova-green-soft)',
  greenBorder: '#B8D4A0',
  white:       '#FFFFFF',
  pageBg:      'var(--zova-linen)',
  charcoal:    'var(--zova-ink)',
  medGray:     'var(--zova-text-body)',
  mutedText:   'var(--zova-text-muted)',
  border:      'var(--zova-border)',
  softGray:    'var(--zova-surface-alt)',
};

const STATUS = {
  completed:  { label: 'Completed',  color: 'var(--zova-primary-action)', bg: 'var(--zova-green-soft)', border: '#B8D4A0' },
  processing: { label: 'Processing', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  pending:    { label: 'Pending',    color: 'var(--zova-text-body)', bg: 'var(--zova-surface-alt)', border: 'var(--zova-border)' },
  cancelled:  { label: 'Cancelled',  color: 'var(--zova-error)', bg: '#FEF2F2', border: '#FECACA' },
};

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return value || 'N/A';
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function buildVariantLabel(variant) {
  if (!variant) return '';
  return [variant.color, variant.size].filter(Boolean).join(' / ');
}

function buildTimeline(order) {
  const paymentComplete = Boolean(order?.payment_reference);
  const fulfillment = String(order?.fulfillment_status || '').toLowerCase();
  const escrow = String(order?.escrow_status || '').toLowerCase();
  const cancelled = String(order?.status || '').toLowerCase() === 'cancelled';

  return [
    {
      id: 'placed',
      title: 'Order placed',
      description: 'Your order was created successfully.',
      timestamp: order?.created_at,
      state: 'complete',
    },
    {
      id: 'payment',
      title: 'Payment confirmed',
      description: paymentComplete ? 'Payment has been verified for this order.' : 'Awaiting payment confirmation.',
      timestamp: paymentComplete ? order?.updated_at : null,
      state: paymentComplete ? 'complete' : cancelled ? 'cancelled' : 'pending',
    },
    {
      id: 'fulfillment',
      title: 'Fulfillment progress',
      description: order?.fulfillment_status
        ? `Current fulfillment status: ${order.fulfillment_status}.`
        : 'Fulfillment has not started yet.',
      timestamp: fulfillment && fulfillment !== 'processing' ? order?.updated_at : null,
      state: paymentComplete ? (fulfillment && fulfillment !== 'processing' ? 'complete' : 'active') : 'pending',
    },
    {
      id: 'escrow',
      title: 'Escrow status',
      description: order?.escrow_status
        ? `Current escrow status: ${order.escrow_status}.`
        : 'Escrow status is not available yet.',
      timestamp: order?.escrow_released_at || order?.escrow_funded_at || null,
      state: escrow === 'released' ? 'complete' : escrow === 'funded' ? 'active' : cancelled ? 'cancelled' : 'pending',
    },
  ];
}

function DetailCard({ title, children }) {
  return (
    <section
      style={{
        background: THEME.white,
        border: `1px solid ${THEME.border}`,
        borderRadius: 20,
        padding: 20,
      }}
      className="sm:p-6"
    >
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: THEME.charcoal }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ProfileOrderDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const orderId = Array.isArray(params?.id) ? params.id[0] : params?.id;
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
    if (!user?.id || !orderId) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const supabase = createClient();

        const { data: orderRow, error: orderError } = await supabase
          .from('orders')
          .select('id, user_id, total_amount, status, payment_reference, created_at, updated_at, fulfillment_status, escrow_status, buyer_confirmed_at, escrow_funded_at, escrow_released_at')
          .eq('id', orderId)
          .eq('user_id', user.id)
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
  }, [orderId, user?.id]);

  const status = STATUS[String(order?.status || '').toLowerCase()] || STATUS.pending;
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const timeline = useMemo(() => buildTimeline(order), [order]);
  const orderTotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0),
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

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#2E6417]">Loading order details...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'rgba(249,250,251,0.88)' }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/profile?tab=orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 999,
              border: `1px solid ${THEME.border}`,
              background: THEME.white,
              textDecoration: 'none',
              color: THEME.charcoal,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <FiArrowLeft size={14} />
            Back to orders
          </Link>

          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 999,
              border: `1px solid ${THEME.greenBorder}`,
              background: THEME.greenTint,
              textDecoration: 'none',
              color: THEME.greenDark,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <FiShoppingBag size={14} />
            Shop more
          </Link>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 999,
              border: `1px solid ${THEME.border}`,
              background: THEME.white,
              textDecoration: 'none',
              color: THEME.medGray,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <FiHome size={14} />
            Home
          </Link>
        </div>

      {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
      ) : null}

      {cancelModalOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 17, 17, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 60,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: THEME.white,
              border: `1px solid ${THEME.border}`,
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 24px 80px rgba(17, 17, 17, 0.18)',
            }}
          >
            <div className="space-y-3">
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText }}>
                  Cancellation Request
                </p>
                <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 900, color: THEME.charcoal }}>
                  Why do you want to cancel this order?
                </h2>
              </div>

              <p style={{ margin: 0, fontSize: 14, color: THEME.medGray, lineHeight: 1.7 }}>
                Share a short reason and the operations team will review it before dispatch progresses further.
              </p>

              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Tell us why you need this order cancelled"
                style={{
                  width: '100%',
                  minHeight: 140,
                  borderRadius: 16,
                  border: `1px solid ${THEME.border}`,
                  padding: '14px 16px',
                  fontSize: 14,
                  color: THEME.charcoal,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (cancelBusy) return;
                    setCancelModalOpen(false);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: `1px solid ${THEME.border}`,
                    background: THEME.white,
                    color: THEME.charcoal,
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '12px 16px',
                    cursor: cancelBusy ? 'not-allowed' : 'pointer',
                    opacity: cancelBusy ? 0.6 : 1,
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={submitCancellationRequest}
                  disabled={cancelBusy || !cancelReason.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: 'none',
                    background: THEME.green,
                    color: THEME.white,
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '12px 18px',
                    cursor: cancelBusy || !cancelReason.trim() ? 'not-allowed' : 'pointer',
                    opacity: cancelBusy || !cancelReason.trim() ? 0.6 : 1,
                  }}
                >
                  {cancelBusy ? 'Submitting...' : 'Submit cancellation request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

        {order ? (
          <div className="space-y-6">
            <section
              style={{
                background: THEME.white,
                border: `1px solid ${THEME.border}`,
                borderRadius: 24,
                padding: 20,
              }}
              className="sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText }}>
                    Order Details
                  </p>
                  <h1 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 900, color: THEME.charcoal }}>
                    #{String(order.id).slice(0, 8).toUpperCase()}
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: THEME.medGray }}>
                    Placed on {formatDateTime(order.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      color: status.color,
                      background: status.bg,
                      border: `1px solid ${status.border}`,
                    }}
                  >
                    {status.label}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      color: THEME.charcoal,
                      background: THEME.softGray,
                      border: `1px solid ${THEME.border}`,
                    }}
                  >
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            </section>

            <section
              style={{
                background: THEME.white,
                border: `1px solid ${THEME.border}`,
                borderRadius: 24,
                padding: 20,
              }}
              className="sm:p-7"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText }}>
                    Cancellation
                  </p>
                  {cancellationRequest ? (
                    <>
                      <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 800, color: THEME.charcoal }}>
                        Cancellation request submitted
                      </p>
                      <p style={{ margin: '8px 0 0', fontSize: 14, color: THEME.medGray, lineHeight: 1.7 }}>
                        We have your request and the operations team will review it before dispatch progresses further.
                      </p>
                    </>
                  ) : canRequestCancellation ? (
                    <>
                      <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 800, color: THEME.charcoal }}>
                        Need to stop this order?
                      </p>
                      <p style={{ margin: '8px 0 0', fontSize: 14, color: THEME.medGray, lineHeight: 1.7 }}>
                        Start a cancellation request here and share the reason in a quick confirmation modal.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 800, color: THEME.charcoal }}>
                        Cancellation unavailable
                      </p>
                      <p style={{ margin: '8px 0 0', fontSize: 14, color: THEME.medGray, lineHeight: 1.7 }}>
                        This order is no longer in a stage where a new cancellation request can be submitted.
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {cancellationRequest ? (
                    <div className="inline-flex items-center rounded-full border border-[#E8E8E8] bg-[#F5F5F5] px-4 py-2 text-sm font-semibold text-[#111111]">
                      {String(cancellationRequest.status || 'pending').replace(/_/g, ' ')}
                    </div>
                  ) : canRequestCancellation ? (
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 999,
                        border: 'none',
                        background: THEME.green,
                        color: THEME.white,
                        fontSize: 14,
                        fontWeight: 800,
                        padding: '12px 18px',
                        cursor: 'pointer',
                      }}
                    >
                      Request cancellation
                    </button>
                  ) : (
                    <div
                      className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
                      style={{
                        color: THEME.medGray,
                        background: THEME.softGray,
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      Not available
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <DetailCard title="Items in this order">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        paddingBottom: 14,
                        borderBottom: `1px solid ${THEME.border}`,
                      }}
                    >
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 14,
                          overflow: 'hidden',
                          background: THEME.softGray,
                          border: `1px solid ${THEME.border}`,
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={item.product?.image_urls?.[0] || 'https://placehold.co/144x144?text=Item'}
                          alt={item.product?.name || 'Ordered item'}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: THEME.charcoal }}>
                          {item.product?.name || 'Product item'}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.medGray }}>
                          Quantity: {item.quantity}
                        </p>
                        {buildVariantLabel(item.variant) ? (
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.medGray }}>
                            Variant: {buildVariantLabel(item.variant)}
                          </p>
                        ) : null}
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.medGray }}>
                          Unit price: {formatMoney(item.price)}
                        </p>
                        {item.product?.slug ? (
                          <Link
                            href={`/products/${item.product.slug}`}
                            style={{
                              display: 'inline-flex',
                              marginTop: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              color: THEME.green,
                              textDecoration: 'none',
                            }}
                          >
                            View product
                          </Link>
                        ) : null}
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 800, color: THEME.charcoal }}>
                        {formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailCard>

              <div className="space-y-6">
                <DetailCard title="Order timeline">
                  <div className="space-y-4">
                    {timeline.map((entry, index) => {
                      const isComplete = entry.state === 'complete';
                      const isActive = entry.state === 'active';
                      const isCancelled = entry.state === 'cancelled';
                      return (
                        <div key={entry.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isComplete ? THEME.greenTint : isActive ? '#FFF7ED' : THEME.softGray,
                                border: `1px solid ${isComplete ? THEME.greenBorder : isActive ? '#FED7AA' : THEME.border}`,
                                color: isCancelled ? '#E53935' : isComplete ? THEME.green : isActive ? '#EA580C' : THEME.mutedText,
                              }}
                            >
                              {isComplete ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
                            </div>
                            {index < timeline.length - 1 ? (
                              <div style={{ width: 1, flex: 1, minHeight: 26, background: THEME.border, marginTop: 6 }} />
                            ) : null}
                          </div>
                          <div style={{ paddingTop: 2 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: THEME.charcoal }}>
                              {entry.title}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.medGray, lineHeight: 1.6 }}>
                              {entry.description}
                            </p>
                            {entry.timestamp ? (
                              <p style={{ margin: '6px 0 0', fontSize: 11, color: THEME.mutedText }}>
                                {formatDateTime(entry.timestamp)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DetailCard>

                <DetailCard title="Order summary">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span style={{ color: THEME.medGray }}>Items total</span>
                      <strong style={{ color: THEME.charcoal }}>{formatMoney(orderTotal || order.total_amount)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span style={{ color: THEME.medGray }}>Payment reference</span>
                      <strong style={{ color: THEME.charcoal, wordBreak: 'break-word', textAlign: 'right' }}>
                        {order.payment_reference || 'Pending'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span style={{ color: THEME.medGray }}>Last updated</span>
                      <strong style={{ color: THEME.charcoal, textAlign: 'right' }}>{formatDateTime(order.updated_at)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span style={{ color: THEME.medGray }}>Fulfillment</span>
                      <strong style={{ color: THEME.charcoal, textTransform: 'capitalize', textAlign: 'right' }}>
                        {order.fulfillment_status || 'Processing'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span style={{ color: THEME.medGray }}>Escrow</span>
                      <strong style={{ color: THEME.charcoal, textTransform: 'capitalize', textAlign: 'right' }}>
                        {order.escrow_status || 'Not funded'}
                      </strong>
                    </div>
                    <div style={{ height: 1, background: THEME.border, margin: '6px 0' }} />
                    <div className="flex items-center justify-between gap-4">
                      <span style={{ color: THEME.charcoal, fontSize: 14, fontWeight: 700 }}>Order total</span>
                      <strong style={{ color: THEME.charcoal, fontSize: 18 }}>{formatMoney(order.total_amount)}</strong>
                    </div>
                  </div>
                </DetailCard>

                <DetailCard title="Return & Refund">
                  {returnRequest ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center rounded-full border border-[#E8E8E8] bg-[#F5F5F5] px-3 py-1 font-semibold text-[#111111]">
                          Return: {String(returnRequest.status || 'pending').replace(/_/g, ' ')}
                        </div>
                        <div className="inline-flex items-center rounded-full border border-[#B8D4A0] bg-[#EDF5E6] px-3 py-1 font-semibold text-[#245213]">
                          Refund: {String(returnRequest.refund_status || 'not_requested').replace(/_/g, ' ')}
                        </div>
                      </div>
                      <p style={{ margin: 0, color: THEME.medGray, lineHeight: 1.7 }}>
                        Reason: {returnRequest.reason}
                      </p>
                      {returnRequest.details ? (
                        <p style={{ margin: 0, color: THEME.medGray, lineHeight: 1.7 }}>
                          Details: {returnRequest.details}
                        </p>
                      ) : null}
                      {returnRequest.seller_note ? (
                        <p style={{ margin: 0, color: THEME.medGray, lineHeight: 1.7 }}>
                          Seller note: {returnRequest.seller_note}
                        </p>
                      ) : null}
                      {returnRequest.refund_amount ? (
                        <p style={{ margin: 0, color: THEME.medGray, lineHeight: 1.7 }}>
                          Refund amount: {formatMoney(returnRequest.refund_amount)}
                        </p>
                      ) : null}
                      {returnRequest.refund_reference ? (
                        <p style={{ margin: 0, color: THEME.medGray, lineHeight: 1.7 }}>
                          Refund reference: {returnRequest.refund_reference}
                        </p>
                      ) : null}
                      <p style={{ margin: 0, fontSize: 12, color: THEME.mutedText }}>
                        Submitted {formatDateTime(returnRequest.created_at)}
                      </p>
                    </div>
                  ) : canRequestReturn ? (
                    <div className="space-y-3">
                      <p style={{ margin: 0, fontSize: 13, color: THEME.medGray, lineHeight: 1.7 }}>
                        If the delivered item needs to come back, submit a return request here and we will keep the refund status visible as it moves through review and payout handling.
                      </p>
                      <input
                        value={returnReason}
                        onChange={(event) => setReturnReason(event.target.value)}
                        placeholder="Reason for the return"
                        style={{
                          width: '100%',
                          borderRadius: 14,
                          border: `1px solid ${THEME.border}`,
                          padding: '12px 14px',
                          fontSize: 13,
                          color: THEME.charcoal,
                          outline: 'none',
                        }}
                      />
                      <textarea
                        value={returnDetails}
                        onChange={(event) => setReturnDetails(event.target.value)}
                        placeholder="Share any item issue, sizing problem, or quality concern"
                        style={{
                          width: '100%',
                          minHeight: 110,
                          borderRadius: 14,
                          border: `1px solid ${THEME.border}`,
                          padding: '12px 14px',
                          fontSize: 13,
                          color: THEME.charcoal,
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={submitReturnRequest}
                        disabled={returnBusy || !returnReason.trim()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 999,
                          border: 'none',
                          background: THEME.green,
                          color: THEME.white,
                          fontSize: 13,
                          fontWeight: 800,
                          padding: '11px 16px',
                          cursor: returnBusy || !returnReason.trim() ? 'not-allowed' : 'pointer',
                          opacity: returnBusy || !returnReason.trim() ? 0.6 : 1,
                        }}
                      >
                        {returnBusy ? 'Submitting...' : 'Request return'}
                      </button>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: THEME.medGray, lineHeight: 1.7 }}>
                      Returns become available after delivery, and active requests will remain visible here until closure.
                    </p>
                  )}
                </DetailCard>

                <DetailCard title="Delivery address">
                  {shippingAddress ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#B8D4A0] bg-[#EDF5E6] px-3 py-1 text-xs font-semibold text-[#245213]">
                        <FiMapPin size={12} />
                        {shippingAddress.label || 'Delivery address'}
                      </div>
                      <div className="text-sm text-gray-700 leading-6">
                        <p style={{ margin: 0, fontWeight: 700, color: THEME.charcoal }}>{shippingAddress.address_line1}</p>
                        {shippingAddress.address_line2 ? (
                          <p style={{ margin: '2px 0 0' }}>{shippingAddress.address_line2}</p>
                        ) : null}
                        <p style={{ margin: '2px 0 0' }}>
                          {[shippingAddress.city, shippingAddress.state, shippingAddress.postal_code].filter(Boolean).join(', ')}
                        </p>
                        <p style={{ margin: '2px 0 0' }}>{shippingAddress.country}</p>
                        <p style={{ margin: '8px 0 0', fontWeight: 700, color: THEME.charcoal }}>{shippingAddress.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: THEME.mutedText }}>
                      Delivery address snapshot not available for this order.
                    </p>
                  )}
                </DetailCard>

                <DetailCard title="What you can do next">
                  <div className="space-y-3">
                    <Link
                      href="/profile?tab=orders"
                      style={{
                        display: 'inline-flex',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 16px',
                        borderRadius: 14,
                        background: THEME.green,
                        color: THEME.white,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      <FiPackage size={15} />
                      Back to all orders
                    </Link>
                    <Link
                      href="/shop"
                      style={{
                        display: 'inline-flex',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 16px',
                        borderRadius: 14,
                        background: THEME.greenTint,
                        color: THEME.greenDark,
                        border: `1px solid ${THEME.greenBorder}`,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      <FiShoppingBag size={15} />
                      Continue shopping
                    </Link>
                  </div>
                </DetailCard>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
