export const STATUS_OPTIONS = [
  'all',
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'archived',
];

export function getStatusBadgeClasses(status) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending_review':
      return 'bg-amber-100 text-amber-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'archived':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

export function describeDraft(draft) {
  if (!draft?.state) return 'Unfinished product draft';
  const parts = [
    draft.state.productName || 'Untitled draft',
    draft.state.subcategory || draft.state.category || '',
  ].filter(Boolean);
  return parts.join(' • ');
}

export function formatMoney(value) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

export function compactDate(value) {
  if (!value) return 'Not submitted';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getBaseUrl() {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (configured) {
    const normalized = configured.replace(/\/+$/, '');
    if (/^https?:\/\//i.test(normalized)) return normalized;
    return `https://${normalized}`;
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function getQrValueForProduct(row) {
  if (!row) return '';
  const target = row.slug || row.id;
  const baseUrl = getBaseUrl();
  return baseUrl
    ? `${baseUrl}/qr/p/${encodeURIComponent(target)}`
    : `/qr/p/${encodeURIComponent(target)}`;
}

export function getQrImageUrl(value, size = 320) {
  if (!value) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&margin=12&data=${encodeURIComponent(value)}`;
}

export function summarizeBulkDiscounts(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return 'No bulk offer';
  const highestTier = [...tiers].sort((a, b) => b.minimum_quantity - a.minimum_quantity)[0];
  return `${highestTier.discount_percent}% @ ${highestTier.minimum_quantity}+`;
}
