'use client';

import { computeSavingsLabel } from './ProductCardPricing';

const SAVINGS_STYLE = 'bg-(--zova-accent-soft) text-[#b87800] border border-[#f5d06e]';
const DEFAULT_PROMO_THEME = {
  '--promo-badge-bg': 'var(--zova-ink)',
  '--promo-badge-text': 'var(--zova-linen)',
  '--promo-tag-bg': '#F472B6',
  '--promo-tag-text': '#FFFFFF',
};

export default function PromotionTags({ promo, price, compact = false }) {
  if (!promo) return null;

  const savingsLabel = computeSavingsLabel(promo, price);
  const promoTheme = {
    ...DEFAULT_PROMO_THEME,
    '--promo-border': promo.badge_bg_color || 'var(--zova-ink)',
    '--promo-badge-bg': promo.badge_bg_color || 'var(--zova-ink)',
    '--promo-badge-text': promo.badge_text_color || 'var(--zova-linen)',
    '--promo-tag-bg': promo.tag_bg_color || '#F472B6',
    '--promo-tag-text': promo.tag_text_color || '#FFFFFF',
  };

  return (
    <div
      className={`mt-2 flex flex-wrap items-center gap-1 border-l-2 pl-1.5 ${compact ? 'mt-0' : ''}`}
      style={promoTheme}
    >
      <span
        className="inline-flex items-center rounded-sm border-l-2 border-[var(--promo-border)] bg-[var(--promo-badge-bg)] px-2 py-0.5 text-[10px] font-black leading-none tracking-wide text-[var(--promo-badge-text)]"
      >
        {promo.owner_type === 'seller' ? (
          <span className="mr-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--promo-badge-text)] opacity-50" />
        ) : null}
        {promo.display_name}
      </span>

      {promo.display_tag ? (
        <span className="inline-flex items-center rounded-full bg-[var(--promo-tag-bg)] px-2 py-0.5 text-[10px] font-semibold leading-none text-[var(--promo-tag-text)]">
          {promo.display_tag}
        </span>
      ) : null}

      {savingsLabel ? (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black leading-none ${SAVINGS_STYLE}`}>
          {savingsLabel}
        </span>
      ) : null}
    </div>
  );
}
