import { MOOD_PRICE_PRESETS } from '@/features/storefront/mood/mood.constants';

export function formatMoodPrice(value) {
  return `₦${Number(value).toLocaleString('en-NG')}`;
}

export function getMoodDiscountPercent(price, discountPrice) {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function sortMoodProducts(products, sort) {
  const list = [...products];

  switch (sort) {
    case 'newest':
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'price_asc':
      list.sort((a, b) => Number(a.discount_price || a.price) - Number(b.discount_price || b.price));
      break;
    case 'price_desc':
      list.sort((a, b) => Number(b.discount_price || b.price) - Number(a.discount_price || a.price));
      break;
    case 'rating_desc':
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      break;
    default:
      list.sort((a, b) => Number(b.mood_fit_score) - Number(a.mood_fit_score));
      break;
  }

  return list;
}

export function filterMoodProducts({
  products,
  pricePreset,
  selectedSizes,
  selectedColors,
  selectedCategories,
}) {
  let list = [...products];

  if (pricePreset !== null) {
    const { min, max } = MOOD_PRICE_PRESETS[pricePreset];
    list = list.filter((product) => {
      const effectivePrice = product.discount_price ? Number(product.discount_price) : Number(product.price);
      return effectivePrice >= min && effectivePrice <= max;
    });
  }

  if (selectedSizes.length) {
    list = list.filter((product) => selectedSizes.some((size) => (product.sizes || []).includes(size)));
  }

  if (selectedColors.length) {
    list = list.filter((product) => selectedColors.some((color) => (product.colors || []).includes(color)));
  }

  if (selectedCategories.length) {
    list = list.filter((product) => selectedCategories.includes(product.category_slug));
  }

  return list;
}
