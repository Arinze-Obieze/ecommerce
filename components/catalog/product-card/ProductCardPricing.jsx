'use client';

const SAVINGS_STYLE = 'bg-(--zova-accent-soft) text-[#b87800] border border-[#f5d06e]';
const DISCOUNT_PILL_STYLE = 'rounded-sm bg-[#C0392B] px-1.5 py-0.5 text-[10px] font-bold text-white';

export function computeSavingsLabel(promo, productPrice) {
  if (!promo?.show_savings_amount) return null;

  const price = Number(productPrice || 0);

  if (promo.discount_type === 'percentage') {
    let saved = price * (Number(promo.discount_value) / 100);
    if (promo.max_discount_cap) saved = Math.min(saved, Number(promo.max_discount_cap));
    if (saved <= 0) return null;
    return `Save ₦${Math.round(saved).toLocaleString('en-NG')}`;
  }

  if (promo.discount_type === 'fixed_amount') {
    const saved = Number(promo.discount_value);
    if (saved <= 0) return null;
    return `Save ₦${saved.toLocaleString('en-NG')}`;
  }

  if (promo.discount_type === 'free_shipping') return 'Free Shipping';

  if (promo.discount_type === 'buy_x_get_y') {
    return `Buy ${promo.buy_x_quantity} Get ${promo.get_y_quantity} Free`;
  }

  return null;
}

export default function ProductCardPricing({
  price,
  discountPrice = null,
  discountPercent = null,
  promo = null,
}) {
  const savingsLabel = promo ? computeSavingsLabel(promo, price) : null;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-base font-bold text-(--zova-ink) sm:text-sm">
        ₦{(discountPrice || price).toLocaleString()}
      </span>

      {discountPrice ? (
        <span className="text-xs text-[#BBBBBB] line-through">
          ₦{price.toLocaleString()}
        </span>
      ) : null}

      {discountPercent ? (
        <span className={DISCOUNT_PILL_STYLE}>
          -{discountPercent}%
        </span>
      ) : null}

      {savingsLabel ? (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-black ${SAVINGS_STYLE}`}>
          {savingsLabel}
        </span>
      ) : null}
    </div>
  );
}
