export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export const PAGE_SIZE_OPTIONS = [25, 50, 100];

export const REASON_OPTIONS = [
  { value: 'correction', label: 'Count correction' },
  { value: 'restock', label: 'Restock received' },
  { value: 'damage', label: 'Damage / shrinkage' },
  { value: 'return', label: 'Customer return' },
  { value: 'count', label: 'Cycle count' },
];

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All inventory' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'variant_managed', label: 'Variant managed' },
];
