function normalizeVariantId(variantId) {
  return variantId === undefined ? null : variantId;
}

export function isSameCartItem(item, productId, variantId = null) {
  return item?.id === productId && normalizeVariantId(item?.variant_id) === normalizeVariantId(variantId);
}

export function findCartItem(cart, productId, variantId = null) {
  return cart.find((item) => isSameCartItem(item, productId, variantId));
}

export function migrateStorageKey(nextKey, legacyKey) {
  if (typeof window === 'undefined') return null;

  const currentValue = localStorage.getItem(nextKey);
  if (currentValue !== null) return currentValue;

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue === null) return null;

  localStorage.setItem(nextKey, legacyValue);
  localStorage.removeItem(legacyKey);
  return legacyValue;
}
