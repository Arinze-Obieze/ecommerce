function toNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeTier(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const minimumQuantity = Math.max(
    2,
    Math.floor(
      toNumber(
        entry.minimum_quantity ??
        entry.minimumQuantity ??
        entry.min_quantity ??
        entry.minQuantity ??
        entry.quantity ??
        entry.threshold
      ) || 0
    )
  );
  const discountPercent = toNumber(
    entry.discount_percent ??
    entry.discountPercent ??
    entry.percent ??
    entry.discount
  );

  if (!minimumQuantity || !discountPercent) return null;
  if (discountPercent <= 0 || discountPercent >= 100) return null;

  return {
    minimum_quantity: minimumQuantity,
    discount_percent: roundCurrency(discountPercent),
  };
}

export function normalizeBulkDiscountTiers(value) {
  if (value === null || value === undefined || value === '') {
    return { value: null };
  }

  if (!Array.isArray(value)) {
    return { error: 'Bulk discounts must be provided as a list of tiers.' };
  }

  const cleaned = [];
  for (const rawTier of value) {
    const isCompletelyEmpty =
      !rawTier ||
      (String(
        rawTier.minimum_quantity ??
        rawTier.minimumQuantity ??
        rawTier.min_quantity ??
        rawTier.minQuantity ??
        rawTier.quantity ??
        rawTier.threshold ??
        ''
      ).trim() === '' &&
      String(
        rawTier.discount_percent ??
        rawTier.discountPercent ??
        rawTier.percent ??
        rawTier.discount ??
        ''
      ).trim() === '');

    if (isCompletelyEmpty) continue;

    const normalized = normalizeTier(rawTier);
    if (!normalized) {
      return {
        error: 'Each bulk discount tier must include a minimum quantity of 2 or more and a discount percent between 0 and 100.',
      };
    }
    cleaned.push(normalized);
  }

  if (!cleaned.length) {
    return { value: null };
  }

  const deduped = new Map();
  for (const tier of cleaned) {
    deduped.set(tier.minimum_quantity, tier);
  }

  const tiers = [...deduped.values()].sort((a, b) => a.minimum_quantity - b.minimum_quantity);

  for (let index = 1; index < tiers.length; index += 1) {
    if (tiers[index].discount_percent <= tiers[index - 1].discount_percent) {
      return {
        error: 'Bulk discount percentages should increase as the minimum quantity increases.',
      };
    }
  }

  return { value: tiers };
}

export function getBulkDiscountTiers(product) {
  if (!product) return [];
  const result = normalizeBulkDiscountTiers(product.bulk_discount_tiers);
  return result.value || [];
}

export function getBaseUnitPrice(product) {
  const discountPrice = toNumber(product?.discount_price);
  const price = toNumber(product?.price);

  if (
    discountPrice !== null &&
    discountPrice > 0 &&
    (price === null || discountPrice < price)
  ) {
    return discountPrice;
  }

  return price ?? 0;
}

export function getAppliedBulkDiscountTier(tiers, quantity) {
  const normalizedQuantity = Math.max(1, Math.floor(toNumber(quantity) || 1));
  const normalizedTiers = Array.isArray(tiers) ? tiers : [];

  return normalizedTiers.reduce((best, tier) => {
    if (normalizedQuantity >= tier.minimum_quantity) {
      return tier;
    }
    return best;
  }, null);
}

export function calculateBulkPricing(product, quantity = 1) {
  const normalizedQuantity = Math.max(1, Math.floor(toNumber(quantity) || 1));
  const baseUnitPrice = getBaseUnitPrice(product);
  const tiers = getBulkDiscountTiers(product);
  const appliedTier = getAppliedBulkDiscountTier(tiers, normalizedQuantity);
  const finalUnitPrice = appliedTier
    ? roundCurrency(baseUnitPrice * (1 - (appliedTier.discount_percent / 100)))
    : baseUnitPrice;
  const savingsPerUnit = roundCurrency(Math.max(0, baseUnitPrice - finalUnitPrice));
  const lineTotal = roundCurrency(finalUnitPrice * normalizedQuantity);
  const totalSavings = roundCurrency(savingsPerUnit * normalizedQuantity);

  return {
    tiers,
    appliedTier,
    quantity: normalizedQuantity,
    baseUnitPrice,
    finalUnitPrice,
    savingsPerUnit,
    lineTotal,
    totalSavings,
    hasBulkDiscount: Boolean(appliedTier),
  };
}
