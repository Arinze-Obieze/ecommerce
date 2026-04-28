'use client';

import { FiTag } from 'react-icons/fi';
import { computeSavingsLabel } from '@/utils/catalog/promotions';

function PromoBannerRow({ promo, price, secondary = false }) {
  const savings = computeSavingsLabel(promo, price);
  const background = promo.badge_bg_color || (secondary ? '#2a3a28' : 'var(--zova-ink)');
  const foreground = promo.badge_text_color || '#FFFFFF';
  const tagBackground = promo.tag_bg_color || 'var(--zova-accent-emphasis)';
  const tagForeground = promo.tag_text_color || 'var(--zova-ink)';

  return (
    <div
      className="pdp-promo-shine"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 14,
        background,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
        <FiTag size={13} style={{ color: foreground, opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: foreground, letterSpacing: '0.02em' }}>
          {promo.display_name}
        </span>
        {promo.display_tag ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: tagForeground,
              background: tagBackground,
              padding: '3px 10px',
              borderRadius: 100,
            }}
          >
            {promo.display_tag}
          </span>
        ) : null}
        {promo.owner_type === 'seller' ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: foreground,
              opacity: 0.6,
              background: 'rgba(255,255,255,0.12)',
              padding: '2px 7px',
              borderRadius: 100,
            }}
          >
            Store offer
          </span>
        ) : null}
      </div>

      {savings ? (
        <span
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: '#b87800',
            background: '#fef6e0',
            border: '1px solid #f5d06e',
            padding: '5px 12px',
            borderRadius: 100,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {savings}
        </span>
      ) : null}
    </div>
  );
}

export default function PromotionBanner({ promotions, productPrice }) {
  if (!promotions?.length) return null;

  const zovaPromotion = promotions.find((promotion) => promotion.owner_type === 'zova') || null;
  const sellerPromotion = promotions.find((promotion) => promotion.owner_type === 'seller') || null;
  const primaryPromotion = zovaPromotion || sellerPromotion;
  const secondaryPromotion = zovaPromotion && sellerPromotion ? sellerPromotion : null;

  if (!primaryPromotion) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <PromoBannerRow promo={primaryPromotion} price={productPrice} />
      {secondaryPromotion ? (
        <PromoBannerRow promo={secondaryPromotion} price={productPrice} secondary />
      ) : null}
    </div>
  );
}
