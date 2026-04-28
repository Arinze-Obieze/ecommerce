export const PAYMENT_FILTERS = ['all', 'pending', 'paid', 'failed', 'refunded'];
export const FULFILLMENT_FILTERS = ['all', 'processing', 'packed', 'shipped', 'delivered', 'issue'];
export const ESCROW_FILTERS = ['all', 'not_funded', 'funded', 'released'];

export function prettify(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function buildOrderSearchText(row) {
  return [row.id, row.payment_reference, row.status, row.fulfillment_status, row.escrow_status]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getReceiptUrl(orderId, download = false) {
  if (!orderId) return '#';
  return `/api/store/orders/${orderId}/receipt${download ? '?download=1' : ''}`;
}
