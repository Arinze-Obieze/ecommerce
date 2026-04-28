export function formatDateTime(value) {
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

export function formatMoney(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export function buildVariantLabel(variant) {
  if (!variant) return '';
  return [variant.color, variant.size].filter(Boolean).join(' / ');
}

export function buildTimeline(order) {
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
