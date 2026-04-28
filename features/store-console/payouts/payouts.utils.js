export const initialPayoutForm = {
  account_name: '',
  account_number: '',
  bank_code: '',
  bank_name: '',
};

export const PAYOUT_VIEW_OPTIONS = [
  { value: 'escrow', label: 'Escrow' },
  { value: 'payouts', label: 'Payouts' },
  { value: 'operations', label: 'Operations' },
];

export function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function normalizeAccountNumber(value) {
  return String(value || '').replace(/\D+/g, '').slice(0, 10);
}

export function payoutStatusTone(status) {
  switch (String(status || '').toLowerCase()) {
    case 'success':
    case 'paid':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'processing':
    case 'queued':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'eligible':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export function prettifyStatus(status) {
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
