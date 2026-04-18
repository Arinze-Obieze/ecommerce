import { DEFAULT_LOW_STOCK_THRESHOLD } from './constants';

export function createAdjustmentState(row = null) {
  const firstVariant = row?.has_variants ? row.variants?.[0] : null;
  return {
    scope: row?.has_variants ? 'variant' : 'product',
    productId: row ? String(row.id) : '',
    variantId: firstVariant ? String(firstVariant.id) : '',
    mode: 'add',
    quantity: '1',
    reason: 'restock',
    note: '',
  };
}

export function formatTimestamp(value) {
  if (!value) return 'Just now';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

export function inventoryTone(stock, lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD) {
  if (stock <= 0) return 'border-red-200 bg-red-50 text-red-700';
  if (stock <= lowStockThreshold) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}
