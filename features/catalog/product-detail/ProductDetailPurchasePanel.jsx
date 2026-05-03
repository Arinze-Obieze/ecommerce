'use client';

import Link from 'next/link';
import { FiCheck, FiHeart, FiShare2, FiShoppingCart } from 'react-icons/fi';
import PromotionBanner from '@/features/catalog/product-detail/PromotionBanner';
import { OptionPills, QuantityStepper, ColorSwatchSelector } from '@/features/catalog/product-detail/ProductDetailControls';
import { StarRow, TrustStrip } from '@/features/catalog/product-detail/ProductDetailSections';

export function ProductDetailPurchasePanel({
  product,
  inWishlist,
  toggleWishlist,
  handleShare,
  storeName,
  promotions,
  currentPrice,
  compareAtPrice,
  activeDiscPct,
  bulkPricing,
  quantity,
  sizeOptions,
  selectedSize,
  setSelectedSize,
  colorOptions,
  selectedColor,
  setSelectedColor,
  variants,
  effectiveStock,
  selectedVariantLabel,
  requiresVariant,
  selectedVariant,
  canAddToCart,
  addedAnim,
  cartLabel,
  handleAddToCart,
  bulkTiers,
  calculateTierPricing,
  setQuantity,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="lg:sticky lg:top-8 pdp-purchase-panel">
      {/* HEADER WITH CATEGORY & RATING */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--zova-primary-action)', background: 'var(--zova-green-soft)', border: '1px solid #B8D4A0', padding: '4px 12px', borderRadius: 100 }}>
            {product.category?.name || 'Collection'}
          </span>
          <StarRow rating={product.rating} count={product.reviews_count || 0} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--zova-text-muted)', fontWeight: 600 }}>
          Sold by <Link href={`/store/${product.stores?.slug || product.stores?.id}`} style={{ color: 'var(--zova-primary-action)', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>{storeName}</Link>
        </span>
      </div>

      {/* PRODUCT TITLE */}
      <div>
        <h1 className="pdp-heading" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', fontWeight: 900, color: 'var(--zova-ink)', margin: '0 0 6px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          {product.name}
        </h1>
        {product.sku ? <p style={{ margin: 0, fontSize: 11, color: 'var(--zova-text-muted)', fontWeight: 500 }}>SKU: {product.sku}</p> : null}
      </div>

      {/* PROMOTIONS */}
      {promotions.length > 0 ? <PromotionBanner promotions={promotions} productPrice={Number(product.price)} /> : null}

      {/* PRICING CARD */}
      <div style={{ padding: '20px', borderRadius: 18, background: 'var(--zova-linen)', border: '1px solid var(--zova-border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          <span className="pdp-heading" style={{ fontSize: 36, fontWeight: 900, color: 'var(--zova-ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            ₦{currentPrice?.toLocaleString('en-NG')}
          </span>
          {compareAtPrice ? (
            <>
              <span style={{ fontSize: 20, color: 'var(--zova-text-muted)', textDecoration: 'line-through', fontWeight: 400 }}>
                ₦{compareAtPrice?.toLocaleString('en-NG')}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#C0392B', background: '#FEF2F2', padding: '3px 9px', borderRadius: 6 }}>
                -{activeDiscPct}%
              </span>
            </>
          ) : null}
        </div>

        {bulkPricing.hasBulkDiscount ? (
          <div style={{ padding: '9px 12px', borderRadius: 10, background: 'var(--zova-green-soft)', border: '1px solid #B8D4A0', marginBottom: 10 }}>
            <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 800, color: 'var(--zova-ink)' }}>
              {bulkPricing.appliedTier.discount_percent}% bulk discount — {bulkPricing.appliedTier.minimum_quantity}+ units
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--zova-ink)' }}>You save ₦{bulkPricing.totalSavings.toLocaleString()} at qty {quantity}</p>
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#5a5d5a' }}>
          <span>Line total ({quantity} item{quantity > 1 ? 's' : ''})</span>
          <span style={{ fontWeight: 800, color: 'var(--zova-ink)' }}>₦{bulkPricing.lineTotal.toLocaleString('en-NG')}</span>
        </div>
      </div>

      {/* VARIANTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {sizeOptions.length > 0 && (
          <OptionPills
            label="Size"
            options={sizeOptions}
            selected={selectedSize}
            onSelect={setSelectedSize}
            getAvailable={(size) => !variants.length || variants.some((variant) => variant.size === size && (!selectedColor || variant.color === selectedColor) && Number(variant.stock_quantity) > 0)}
          />
        )}
        {colorOptions.length > 0 && (
          <ColorSwatchSelector
            options={colorOptions}
            selected={selectedColor}
            onSelect={setSelectedColor}
            getAvailable={(color) => !variants.length || variants.some((variant) => variant.color === color && (!selectedSize || variant.size === selectedSize) && Number(variant.stock_quantity) > 0)}
            variantMap={Object.fromEntries(
              variants.map((v) => [v.color, v])
            )}
          />
        )}
      </div>

      {/* STOCK INDICATOR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: effectiveStock > 10 ? 'var(--zova-primary-action)' : effectiveStock > 0 ? 'var(--zova-accent-emphasis)' : '#C0392B' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: effectiveStock > 10 ? 'var(--zova-primary-action)' : effectiveStock > 0 ? '#b87800' : '#C0392B' }}>
          {effectiveStock > 10 ? 'In Stock' : effectiveStock > 0 ? `Only ${effectiveStock} left` : 'Out of Stock'}
        </span>
        {selectedVariantLabel ? <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--zova-text-muted)', background: 'var(--zova-surface-alt)', padding: '3px 10px', borderRadius: 100 }}>{selectedVariantLabel}</span> : null}
      </div>

      {requiresVariant && !selectedVariant ? (
        <div style={{ padding: '10px 14px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#C0392B', fontWeight: 700 }}>Please choose your size and color to continue</p>
        </div>
      ) : null}

      {/* CTA BUTTONS */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        <QuantityStepper quantity={quantity} setQuantity={setQuantity} max={effectiveStock || 1} />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="pdp-add-btn"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 20px', height: 50, borderRadius: 12, border: 'none', background: !canAddToCart ? 'var(--zova-surface-alt)' : addedAnim ? 'var(--zova-primary-action-hover)' : 'var(--zova-primary-action)', color: !canAddToCart ? 'var(--zova-text-muted)' : '#FFFFFF', fontSize: 14, fontWeight: 800, cursor: canAddToCart ? 'pointer' : 'not-allowed', letterSpacing: '-0.01em' }}
        >
          {addedAnim ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
          {cartLabel}
        </button>
      </div>

      {/* BULK PRICING TIERS */}
      {bulkTiers.length > 0 ? (
        <div style={{ border: '1px solid var(--zova-border)', borderRadius: 16, padding: 16, background: 'var(--zova-linen)' }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, color: 'var(--zova-ink)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bulk pricing</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {bulkTiers.map((tier) => {
              const isActive = bulkPricing.appliedTier?.minimum_quantity === tier.minimum_quantity;
              const tierPrice = calculateTierPricing(tier.minimum_quantity);
              return (
                <div key={tier.minimum_quantity} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '9px 12px', borderRadius: 10, border: `1px solid ${isActive ? '#B8D4A0' : 'var(--zova-border)'}`, background: isActive ? 'var(--zova-green-soft)' : '#FFFFFF' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--zova-ink)' }}>Buy {tier.minimum_quantity}+ units</span>
                  <span style={{ fontSize: 13, color: isActive ? 'var(--zova-ink)' : '#5a5d5a', fontWeight: 700 }}>{tier.discount_percent}% off · ₦{tierPrice.toLocaleString()} each</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* TRUST SIGNALS */}
      <TrustStrip />
    </div>
  );
}

export function ProductDetailStickyCta({
  isDesktop,
  promotions,
  currentPrice,
  selectedVariantLabel,
  handleAddToCart,
  canAddToCart,
  addedAnim,
  cartLabel,
}) {
  if (isDesktop) return null;

  return (
    <div style={{ position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 50, borderRadius: 20, background: 'rgba(255,255,255,0.96)', border: '1px solid var(--zova-border)', boxShadow: '0 24px 56px rgba(25,27,25,0.14)', backdropFilter: 'blur(16px)', padding: '12px 14px' }} className="pdp-sticky-cta">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          {promotions.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#FFFFFF', background: promotions[0].badge_bg_color || 'var(--zova-ink)', padding: '2px 7px', borderRadius: 100 }}>
                {promotions[0].display_name}
              </span>
            </div>
          ) : null}
          <p className="pdp-heading" style={{ margin: 0, fontSize: 20, color: 'var(--zova-ink)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            ₦{currentPrice?.toLocaleString('en-NG')}
          </p>
          {selectedVariantLabel ? <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--zova-text-muted)' }}>{selectedVariantLabel}</p> : null}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          style={{ flex: '0 0 auto', minWidth: 154, height: 46, border: 'none', borderRadius: 14, padding: '0 18px', fontSize: 13, fontWeight: 800, color: !canAddToCart ? 'var(--zova-text-muted)' : '#FFFFFF', background: !canAddToCart ? 'var(--zova-surface-alt)' : addedAnim ? 'var(--zova-primary-action-hover)' : 'var(--zova-primary-action)', cursor: canAddToCart ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease' }}
        >
          {cartLabel}
        </button>
      </div>
    </div>
  );
}
