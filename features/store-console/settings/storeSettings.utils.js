export const initialStoreSettingsForm = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  low_stock_threshold: '5',
};

export function makeStoreUrl(slug) {
  if (!slug) return '';
  return `/store/${slug}`;
}
