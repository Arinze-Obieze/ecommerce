export const initialStoreForm = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  status: 'pending',
  kyc_status: 'pending',
  payout_ready: false,
  owner_user_id: '',
};

export function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function tierColor(tier) {
  switch (tier) {
    case 'gold':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'silver':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    case 'platinum':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-primary-soft text-primary border-[#E8E4DC]';
  }
}
