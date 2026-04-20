function toUpperAlphaNum(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');
}

function buildCode(value, fallback) {
  const cleaned = toUpperAlphaNum(value);
  const base = cleaned || fallback;
  return `${base}XXXX`.slice(0, 4);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeSpecifications(value) {
  if (Array.isArray(value)) {
    const rows = value
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const key = String(entry.key || '').trim();
        const rowValue = String(entry.value || '').trim();
        if (!key && !rowValue) return null;
        if (!key || !rowValue) return { error: 'Each specification must include both a name and a value' };
        return {
          key: key.slice(0, 80),
          value: rowValue.slice(0, 240),
        };
      })
      .filter(Boolean);

    if (rows.some((row) => row?.error)) {
      return { error: 'Each specification must include both a name and a value' };
    }

    return { value: rows.length ? rows : null };
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .map(([key, rowValue]) => [String(key || '').trim(), String(rowValue || '').trim()])
      .filter(([key, rowValue]) => key && rowValue)
      .map(([key, rowValue]) => ({
        key: key.slice(0, 80),
        value: rowValue.slice(0, 240),
      }));

    return { value: entries.length ? entries : null };
  }

  return { value: null };
}

export async function generateProductSku(adminClient, { storeId, storeSlug, storeName, productSlug, productName }) {
  const storeCode = buildCode(storeSlug || storeName, 'STORE');
  const productCode = buildCode(productSlug || productName, 'ITEM');
  const prefix = `ZVA-${storeCode}-${productCode}`;

  const { data, error } = await adminClient
    .from('products')
    .select('sku')
    .eq('store_id', storeId)
    .ilike('sku', `${prefix}-%`);

  if (error) {
    throw new Error(error.message || 'Failed to generate product SKU');
  }

  const maxSequence = (data || []).reduce((max, row) => {
    const sku = String(row?.sku || '');
    const match = sku.match(new RegExp(`^${prefix}-(\\d{4})$`));
    if (!match) return max;
    return Math.max(max, Number.parseInt(match[1], 10) || 0);
  }, 0);

  return `${prefix}-${String(maxSequence + 1).padStart(4, '0')}`;
}
