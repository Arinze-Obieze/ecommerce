export const STATUS_OPTIONS = [
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'issue', label: 'Issue' },
];

export const RETURN_STATUS_OPTIONS = ['approved', 'rejected', 'received', 'refunded', 'closed'];
export const REFUND_STATUS_OPTIONS = ['not_requested', 'pending', 'processing', 'refunded', 'rejected'];

export const initialFulfillmentForm = {
  fulfillment_status: 'processing',
  tracking_reference: '',
  note: '',
};

export const initialReturnForm = {
  status: 'approved',
  refund_status: 'pending',
  refund_amount: '',
  refund_reference: '',
  note: '',
};

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

export function prettify(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildVariantLabel(variant) {
  if (!variant) return '';
  return [variant.color, variant.size].filter(Boolean).join(' / ');
}

export function getReceiptUrl(orderId, download = false) {
  if (!orderId) return '#';
  return `/api/store/orders/${orderId}/receipt${download ? '?download=1' : ''}`;
}
