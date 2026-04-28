"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiTrendingUp, FiAward, FiCheck, FiX, FiZoomIn, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '@/contexts/cart/CartContext';
import { trackAnalyticsEvent } from '@/utils/telemetry/analytics';
import { logProductEvent } from '@/utils/telemetry/product-events';

// ============================================================
// Brand tokens — sourced from app/globals.css
// ============================================================


// Savings pill colours as a style object (reused in multiple places)
const SAVINGS_STYLE = {
  backgroundColor: 'var(--zova-accent-soft)',
  color:           '#b87800',
  border:          `1px solid ${'#f5d06e'}`,
};

const QUICK_VIEW_DESCRIPTION_LIMIT = 180;

// ============================================================
// HELPERS
// ============================================================

function formatSales(count) {
  if (!count && count !== 0) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

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

// ============================================================
// PROMOTION TAGS
// ============================================================

function PromotionTags({ promo, price, compact = false }) {
  if (!promo) return null;
  const savingsLabel = computeSavingsLabel(promo, price);

  return (
    <div
      className={`flex flex-wrap items-center gap-1 ${compact ? 'mt-0' : 'mt-2'}`}
      style={{
        borderLeft: `2px solid ${promo.badge_bg_color || 'var(--zova-ink)'}`,
        paddingLeft: 6,
      }}
    >
      {/* Main promo badge */}
      <span
        className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-[4px] tracking-wide leading-none"
        style={{
          backgroundColor: promo.badge_bg_color  || 'var(--zova-ink)',
          color:           promo.badge_text_color || 'var(--zova-linen)',
        }}
      >
        {promo.owner_type === 'seller' && (
          <span
            className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0"
            style={{ backgroundColor: promo.badge_text_color || 'var(--zova-linen)', opacity: 0.5 }}
          />
        )}
        {promo.display_name}
      </span>

      {/* Secondary context tag */}
      {promo.display_tag && (
        <span
          className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none"
          style={{
            backgroundColor: promo.tag_bg_color  || '#F472B6',
            color:           promo.tag_text_color || '#FFFFFF',
          }}
        >
          {promo.display_tag}
        </span>
      )}

      {/* Savings pill — Gold Harvest */}
      {savingsLabel && (
        <span
          className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full leading-none"
          style={SAVINGS_STYLE}
        >
          {savingsLabel}
        </span>
      )}
    </div>
  );
}

// ============================================================
// RANK + TRENDING BADGES
// ============================================================

function RankBadge({ rank }) {
  if (!rank) return null;
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ backgroundColor: 'var(--zova-green-soft)', color: 'var(--zova-primary-action)', border: `1px solid ${'#c2d9b4'}` }}
    >
      {medals[rank] || <FiAward className="w-2.5 h-2.5" />}
      #{rank} in category
    </span>
  );
}

function TrendingBadge({ velocity }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'var(--zova-accent-soft)', color: '#b87800', border: `1px solid ${'#f5d06e'}` }}
    >
      <FiTrendingUp className="w-3 h-3" />
      Trending {velocity ? `· ${velocity}` : ''}
    </span>
  );
}

// ============================================================
// PRODUCT CARD
// ============================================================

const ProductCard = ({ product, source = 'unknown', position = null }) => {
  const { addToCart } = useCart();
  const [cartState, setCartState]                                   = useState('idle');
  const [showQuickView, setShowQuickView]                           = useState(false);
  const [isQuickViewDescriptionExpanded, setIsQuickViewDescriptionExpanded] = useState(false);
  const [showImageViewer, setShowImageViewer]                       = useState(false);
  const [imageZoom, setImageZoom]                                   = useState(1);
  const [imageOffset, setImageOffset]                               = useState({ x: 0, y: 0 });
  const [isPanningImage, setIsPanningImage]                         = useState(false);
  const panStateRef = useRef({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 });

  // ── Promotion resolution ────────────────────────────────────────────────
  const promotions     = Array.isArray(product.promotions) ? product.promotions : [];
  const zovaPromo      = promotions.find(p => p.owner_type === 'zova')   || null;
  const sellerPromo    = promotions.find(p => p.owner_type === 'seller') || null;
  const primaryPromo   = zovaPromo || sellerPromo;
  const secondaryPromo = zovaPromo && sellerPromo ? sellerPromo : null;

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  const salesFormatted = formatSales(product.total_sales);
  const description    = String(product.description || '').trim();
  const hasLongDescription = description.length > QUICK_VIEW_DESCRIPTION_LIMIT;
  const quickViewDescription = hasLongDescription && !isQuickViewDescriptionExpanded
    ? `${description.slice(0, QUICK_VIEW_DESCRIPTION_LIMIT).trimEnd()}...`
    : description;

  const sharedMeta = {
    ...(position !== null && { position }),
    category:     product.categories?.[0]?.slug || product.categories?.[0]?.name || null,
    price:        Number(product.discount_price || product.price || 0),
    has_discount: !!product.discount_price,
    is_trending:  !!product.is_trending,
    store_id:     product.stores?.id || product.store_id || null,
  };

  const handleProductClick = () => {
    trackAnalyticsEvent('product_card_click', {
      product_id: product.id, product_name: product.name,
      store_id: sharedMeta.store_id, price: sharedMeta.price, category: sharedMeta.category,
    });
    logProductEvent({ productId: product.id, eventType: 'click', source, metadata: sharedMeta });
  };

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    setCartState('added');
    setTimeout(() => setCartState('idle'), 2000);
    logProductEvent({ productId: product.id, eventType: 'cart_add', source, metadata: { ...sharedMeta, quantity: 1, via: 'card_button' } });
  };

  const handleQuickViewAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    setCartState('added');
    setShowQuickView(false);
    setTimeout(() => setCartState('idle'), 2000);
    logProductEvent({ productId: product.id, eventType: 'cart_add', source, metadata: { ...sharedMeta, quantity: 1, via: 'quick_view' } });
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsQuickViewDescriptionExpanded(false);
    setShowQuickView(true);
    logProductEvent({ productId: product.id, eventType: 'view', source: 'quick_view', metadata: sharedMeta });
  };

  useEffect(() => {
    if (!showQuickView && !showImageViewer) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showImageViewer) { setShowImageViewer(false); setImageZoom(1); }
        else setShowQuickView(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [showQuickView, showImageViewer]);

  useEffect(() => {
    if (imageZoom <= 1) { setImageOffset({ x: 0, y: 0 }); setIsPanningImage(false); }
  }, [imageZoom]);

  const closeImageViewer = () => {
    setShowImageViewer(false); setImageZoom(1);
    setImageOffset({ x: 0, y: 0 }); setIsPanningImage(false);
  };

  const handleImagePointerDown = (e) => {
    if (imageZoom <= 1) return;
    e.preventDefault();
    panStateRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, originX: imageOffset.x, originY: imageOffset.y };
    setIsPanningImage(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleImagePointerMove = (e) => {
    if (!isPanningImage || panStateRef.current.pointerId !== e.pointerId) return;
    setImageOffset({ x: panStateRef.current.originX + (e.clientX - panStateRef.current.startX), y: panStateRef.current.originY + (e.clientY - panStateRef.current.startY) });
  };

  const handleImagePointerUp = (e) => {
    if (panStateRef.current.pointerId !== e.pointerId) return;
    setIsPanningImage(false);
    panStateRef.current.pointerId = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <>
      {/* ── Card ── */}
      <div
        className="zova-panel group h-full flex flex-col bg-white transition-shadow duration-200"
        style={{ border: `1px solid ${'var(--zova-border)'}`, boxShadow: '0 1px 3px rgba(25,27,25,0.06)', borderRadius: '18px', overflow: 'hidden' }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(25,27,25,0.10)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(25,27,25,0.06)')}
      >
        {/* ── Image ── */}
        <Link href={`/products/${product.slug}`} className="relative block shrink-0" onClick={handleProductClick}>
          <div className="aspect-[3/4] overflow-hidden relative" style={{ backgroundColor: 'var(--zova-linen)' }}>
            <img
              src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />

            {/* Quick View */}
            <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button
                type="button"
                onClick={handleOpenQuickView}
                className="text-xs font-semibold px-5 py-2 rounded-full shadow-lg transition-colors"
                style={{ backgroundColor: '#FFFFFF', color: 'var(--zova-ink)', border: `1px solid ${'var(--zova-border)'}` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-linen)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                Quick View
              </button>
            </div>

            {/* Top-left badge stack */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              {product.is_featured && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide"
                  style={{ backgroundColor: 'var(--zova-ink)', color: 'var(--zova-linen)' }}
                >
                  NEW
                </span>
              )}
              {discountPercent && !primaryPromo && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: '#C0392B', color: '#FFFFFF' }}
                >
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Trending flame */}
            {product.is_trending && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <span
                  className="text-sm w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                  title="Trending"
                >
                  🔥
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* ── Body ── */}
        <div className="px-3 pt-3 pb-3.5 sm:px-3.5 sm:pt-3.5 sm:pb-4 flex-1 flex flex-col gap-2">

          <p className="text-[10px] uppercase tracking-widest line-clamp-1" style={{ color: 'var(--zova-text-muted)' }}>
            {product.categories?.[0]?.name || 'Collection'}
          </p>

          <Link href={`/products/${product.slug}`} onClick={handleProductClick}>
            <h3 className="text-sm font-medium leading-snug line-clamp-2 hover:underline" style={{ color: 'var(--zova-ink)' }}>
              {product.name}
            </h3>
          </Link>

          {/* Price row */}
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
            <span className="text-base sm:text-sm font-bold" style={{ color: 'var(--zova-ink)' }}>
              ₦{(product.discount_price || product.price).toLocaleString()}
            </span>
            {product.discount_price && (
              <span className="text-xs line-through" style={{ color: '#BBBBBB' }}>
                ₦{product.price.toLocaleString()}
              </span>
            )}
            {discountPercent && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                style={{ backgroundColor: '#C0392B', color: '#FFFFFF' }}
              >
                -{discountPercent}%
              </span>
            )}
            {/* Inline savings pill — Gold Harvest */}
            {primaryPromo && computeSavingsLabel(primaryPromo, product.price) && (
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
                style={SAVINGS_STYLE}
              >
                {computeSavingsLabel(primaryPromo, product.price)}
              </span>
            )}
          </div>

          {/* Promo name slot — fixed height keeps grid rows aligned */}
          <div className="h-[20px] flex items-center gap-1">
            {primaryPromo && (
              <>
                <span
                  className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-[4px] tracking-wide leading-none"
                  style={{
                    backgroundColor: primaryPromo.badge_bg_color  || 'var(--zova-ink)',
                    color:           primaryPromo.badge_text_color || 'var(--zova-linen)',
                  }}
                >
                  {primaryPromo.owner_type === 'seller' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0"
                      style={{ backgroundColor: primaryPromo.badge_text_color || 'var(--zova-linen)', opacity: 0.5 }}
                    />
                  )}
                  {primaryPromo.display_name}
                </span>
                {primaryPromo.display_tag && (
                  <span
                    className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none"
                    style={{
                      backgroundColor: primaryPromo.tag_bg_color  || '#F472B6',
                      color:           primaryPromo.tag_text_color || '#FFFFFF',
                    }}
                  >
                    {primaryPromo.display_tag}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Trending / rank badges */}
          {(product.is_trending || product.category_rank) && (
            <div className="flex flex-wrap gap-1">
              {product.is_trending   && <TrendingBadge velocity={product.trending_velocity} />}
              {product.category_rank && <RankBadge rank={product.category_rank} />}
            </div>
          )}

          {/* Sales stats strip — Soft Linen background */}
          {salesFormatted && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-md"
              style={{ backgroundColor: 'var(--zova-linen)' }}
            >
              <FiTrendingUp className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--zova-primary-action)' }} />
              <span className="text-[11px]" style={{ color: 'var(--zova-text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--zova-ink)' }}>{salesFormatted}</span> sold
              </span>
              {product.store_is_trending && (
                <>
                  <span style={{ color: 'var(--zova-border)' }}>·</span>
                  <span className="text-[11px]" style={{ color: '#b87800' }}>🔥 Hot store</span>
                </>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-1.5">
            {product.stores ? (
              <Link
                href={`/store/${product.stores.slug || product.stores.id}`}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1"
              >
                <span
                  className="text-[11px] sm:text-[10px] truncate block transition-colors"
                  style={{ color: 'var(--zova-text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--zova-ink)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--zova-text-muted)')}
                >
                  {product.store_is_trending && (
                    <span className="mr-1" style={{ color: '#b87800' }}>●</span>
                  )}
                  {product.stores.name}
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {/* Cart button — Zova Forest */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="zova-btn zova-btn-primary flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold flex-shrink-0 transition-all duration-150"
              style={{
                backgroundColor: cartState === 'added' ? 'var(--zova-primary-action-hover)' : 'var(--zova-primary-action)',
                color: '#FFFFFF',
                padding: '0.68rem 0.9rem',
                boxShadow: '0 10px 24px rgba(46,100,23,0.16)',
              }}
              onMouseEnter={(e) => { if (cartState !== 'added') e.currentTarget.style.backgroundColor = 'var(--zova-primary-action-hover)'; }}
              onMouseLeave={(e) => { if (cartState !== 'added') e.currentTarget.style.backgroundColor = 'var(--zova-primary-action)'; }}
            >
              {cartState === 'added'
                ? <><FiCheck className="w-3.5 h-3.5" /><span className="hidden sm:inline">Added</span></>
                : <><FiShoppingCart className="w-3.5 h-3.5" /><span className="hidden sm:inline">Add</span></>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick View Modal ── */}
      {showQuickView && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-3 pt-[116px] sm:items-center sm:p-4"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl rounded-t-[28px] rounded-b-[22px] sm:rounded-2xl"
            style={{ maxHeight: 'calc(100vh - 128px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row">

              {/* Image panel */}
              <div
                className="w-full sm:w-[42%] flex-shrink-0 relative"
                style={{ backgroundColor: 'var(--zova-linen)', aspectRatio: '3/4', maxHeight: '38vh' }}
              >
                <button
                  type="button"
                  onClick={() => { setShowImageViewer(true); setImageZoom(1); setImageOffset({ x: 0, y: 0 }); }}
                  className="block h-full w-full cursor-zoom-in"
                >
                  <img
                    src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-contain sm:object-cover"
                    style={{ padding: '14px 14px 0' }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowImageViewer(true); setImageZoom(1); setImageOffset({ x: 0, y: 0 }); }}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur"
                  style={{ color: 'var(--zova-ink)' }}
                >
                  <FiZoomIn className="h-3.5 w-3.5" /> Zoom
                </button>
              </div>

              {/* Info panel */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="overflow-y-auto px-5 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-4 flex flex-col gap-3">

                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-1.5 w-12 rounded-full sm:hidden" style={{ backgroundColor: 'var(--zova-border)' }} />
                    <button
                      type="button"
                      onClick={() => setShowQuickView(false)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ color: 'var(--zova-text-muted)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-linen)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FiX className="w-4 h-4" /> Close
                    </button>
                  </div>

                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--zova-text-muted)' }}>
                    {product.categories?.[0]?.name || 'Collection'}
                  </p>

                  <h2 className="text-[15px] sm:text-lg font-bold leading-snug" style={{ color: 'var(--zova-ink)' }}>
                    {product.name}
                  </h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl font-black" style={{ color: 'var(--zova-ink)' }}>
                      ₦{(product.discount_price || product.price).toLocaleString()}
                    </span>
                    {product.discount_price && (
                      <span className="text-sm line-through" style={{ color: '#BBBBBB' }}>
                        ₦{product.price.toLocaleString()}
                      </span>
                    )}
                    {discountPercent && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: '#C0392B', color: '#FFFFFF' }}
                      >
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Promotion tags */}
                  {primaryPromo && (
                    <div className="space-y-1.5">
                      <PromotionTags promo={primaryPromo}   price={product.price} compact={false} />
                      {secondaryPromo && (
                        <PromotionTags promo={secondaryPromo} price={product.price} compact={false} />
                      )}
                    </div>
                  )}

                  {/* Trending / rank */}
                  {(product.is_trending || product.category_rank) && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.is_trending   && <TrendingBadge velocity={product.trending_velocity} />}
                      {product.category_rank && <RankBadge rank={product.category_rank} />}
                    </div>
                  )}

                  {salesFormatted && (
                    <p className="text-xs" style={{ color: 'var(--zova-text-muted)' }}>
                      <span className="font-semibold" style={{ color: 'var(--zova-ink)' }}>{salesFormatted}</span> units sold
                    </p>
                  )}

                  {product.stores && (
                    <p className="text-xs" style={{ color: 'var(--zova-text-muted)' }}>
                      Sold by{' '}
                      <span className="font-semibold" style={{ color: 'var(--zova-ink)' }}>
                        {product.stores.name}
                      </span>
                    </p>
                  )}

                  {description && (
                    <div
                      className="rounded-xl p-3"
                      style={{ border: `1px solid ${'var(--zova-border)'}`, backgroundColor: 'var(--zova-linen)' }}
                    >
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: 'var(--zova-text-muted)' }}
                      >
                        Description
                      </p>
                      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--zova-text-muted)' }}>
                        {quickViewDescription}
                      </p>
                      {hasLongDescription && (
                        <button
                          type="button"
                          onClick={() => setIsQuickViewDescriptionExpanded(c => !c)}
                          className="mt-2 text-sm font-semibold"
                          style={{ color: 'var(--zova-ink)' }}
                        >
                          {isQuickViewDescriptionExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex-1" />

                  {/* CTAs */}
                  <div className="flex gap-2 pt-1">
                    {/* Primary — Zova Forest */}
                    <button
                      type="button"
                      onClick={handleQuickViewAddToCart}
                      className="zova-btn zova-btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors"
                      style={{ backgroundColor: 'var(--zova-primary-action)', color: '#FFFFFF' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-primary-action-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-primary-action)')}
                    >
                      <FiShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>

                    {/* Secondary — Soft Linen border */}
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setShowQuickView(false)}
                      className="px-4 py-3 rounded-xl text-sm font-semibold border transition-colors flex items-center whitespace-nowrap"
                      style={{ borderColor: 'var(--zova-border)', color: 'var(--zova-ink)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-linen)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Viewer ── */}
      {showImageViewer && (
        <div
          className="fixed inset-0 z-[130]"
          style={{ backgroundColor: 'rgba(25,27,25,0.95)' }}   // Onyx Black tint
          onClick={closeImageViewer}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-4 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-white/70">
                  {imageZoom > 1 ? 'Drag the image to inspect details.' : 'Use the zoom controls below for a closer look.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeImageViewer}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold"
              >
                <FiX className="h-4 w-4" /> Close
              </button>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex min-h-full items-center justify-center">
                <img
                  src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'}
                  alt={product.name}
                  className="max-h-[82vh] w-auto max-w-full object-contain transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageZoom})`,
                    transformOrigin: 'center center',
                    cursor: imageZoom > 1 ? (isPanningImage ? 'grabbing' : 'grab') : 'zoom-in',
                    touchAction: imageZoom > 1 ? 'none' : 'auto',
                  }}
                  onPointerDown={handleImagePointerDown}
                  onPointerMove={handleImagePointerMove}
                  onPointerUp={handleImagePointerUp}
                  onPointerCancel={handleImagePointerUp}
                />
              </div>
            </div>

            <div
              className="flex items-center justify-center gap-3 px-4 pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setImageZoom(c => Math.max(1, Number((c - 0.25).toFixed(2))))}
                disabled={imageZoom <= 1}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <FiMinus className="h-4 w-4" /> Zoom Out
              </button>
              <span className="min-w-[68px] text-center text-sm font-semibold text-white">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setImageZoom(c => Math.min(3, Number((c + 0.25).toFixed(2))))}
                disabled={imageZoom >= 3}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <FiPlus className="h-4 w-4" /> Zoom In
              </button>
              {(imageZoom > 1 || imageOffset.x !== 0 || imageOffset.y !== 0) && (
                <button
                  type="button"
                  onClick={() => { setImageZoom(1); setImageOffset({ x: 0, y: 0 }); }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
