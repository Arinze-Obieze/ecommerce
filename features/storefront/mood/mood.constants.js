export const MOOD_META = {
  owambe:         { emoji: '🎉', color: '#8B2E00', gradient: 'linear-gradient(135deg,#8B2E00,#C84B00)' },
  casual_chill:   { emoji: '😎', color: '#1B5E20', gradient: 'linear-gradient(135deg,#1B5E20,#2E7D32)' },
  office_ready:   { emoji: '💼', color: '#1A237E', gradient: 'linear-gradient(135deg,#1A237E,#283593)' },
  date_night:     { emoji: '🌙', color: '#4A148C', gradient: 'linear-gradient(135deg,#4A148C,#6A1B9A)' },
  sunday_best:    { emoji: '⛪', color: '#880E4F', gradient: 'linear-gradient(135deg,#880E4F,#AD1457)' },
  street_trendy:  { emoji: '🛹', color: '#212121', gradient: 'linear-gradient(135deg,#212121,#424242)' },
  soft_luxury:    { emoji: '✨', color: '#BF8500', gradient: 'linear-gradient(135deg,#BF8500,#E6A817)' },
  travel_weekend: { emoji: '✈️', color: '#004D40', gradient: 'linear-gradient(135deg,#004D40,#00695C)' },
};

export const MOOD_IMAGES = {
  owambe:         '/images/mood/ankara_owambe.jpeg',
  casual_chill:   '/images/mood/casual_mood.jpeg',
  office_ready:   '/images/mood/office_wear.jpeg',
  date_night:     '/images/mood/date_nghts.jpeg',
  sunday_best:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&auto=format&fit=crop&q=80',
  street_trendy:  '/images/mood/street_wear.jpeg',
  soft_luxury:    '/images/mood/soft_luxary.jpeg',
  travel_weekend: '/images/mood/travel_weekend_mood.jpeg',
};

export const GENDER_OPTIONS = [
  { value: null,    label: 'All' },
  { value: 'women', label: 'Women' },
  { value: 'men',   label: 'Men' },
  { value: 'kids',  label: 'Kids' },
];

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
