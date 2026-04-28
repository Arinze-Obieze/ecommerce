export const MOOD_META = {
  owambe: { emoji: '🎉' },
  casual_chill: { emoji: '😎' },
  office_ready: { emoji: '💼' },
  date_night: { emoji: '🌙' },
  sunday_best: { emoji: '⛪' },
  street_trendy: { emoji: '🛹' },
  soft_luxury: { emoji: '✨' },
  travel_weekend: { emoji: '✈️' },
};

export const MOOD_SORT_OPTIONS = [
  { value: 'fit_desc', label: 'Best Match' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating_desc', label: 'Top Rated' },
];

export const MOOD_PRICE_PRESETS = [
  { label: 'Under ₦5k', min: 0, max: 5000 },
  { label: '₦5k – ₦15k', min: 5000, max: 15000 },
  { label: '₦15k – ₦30k', min: 15000, max: 30000 },
  { label: '₦30k – ₦50k', min: 30000, max: 50000 },
  { label: 'Above ₦50k', min: 50000, max: Infinity },
];
