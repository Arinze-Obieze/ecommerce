"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiTrendingUp, FiAward, FiCheck, FiX, FiZoomIn, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { logProductEvent } from '@/utils/logProductEvent';

// ============================================================
// THEME
// ============================================================
const THEME = {
  cardBg:           "#FFFFFF",
  cardBorder:       "#EFEFEF",
  cardShadow:       "0 1px 3px rgba(0,0,0,0.06)",
  cardHoverShadow:  "0 4px 16px rgba(0,0,0,0.08)",
  categoryText:     "#AAAAAA",
  nameText:         "#111111",
  priceText:        "#111111",
  originalPrice:    "#CCCCCC",
  storeText:        "#888888",
  storeHover:       "#444444",
  metaText:         "#999999",
  newBg:            "#111111",
  newText:          "#FFFFFF",
  saleBg:           "#E53935",
  saleText:         "#FFFFFF",
  trendingBg:       "#FFF7ED",
  trendingText:     "#EA580C",
  trendingBorder:   "#FED7AA",
  statsBg:          "#F8F8F8",
  statsIcon:        "#00B86B",
  rankBg:           "#EDFAF3",
  rankText:         "#0A3D2E",
  rankBorder:       "#A8DFC4",
  cartBg:           "#00B86B",
  cartHoverBg:      "#0F7A4F",
  cartText:         "#FFFFFF",
  cartSuccessBg:    "#0A3D2E",
  quickViewBg:      "#FFFFFF",
  quickViewText:    "#111111",
  quickViewHover:   "#F5F5F5",
  skeletonBg:       "#F4F4F4",
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

/**
 * Compute the savings label for a promotion.
 * Exported so it can be reused in cart/checkout.
 */
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
// Renders the promo badge row on card and in Quick View.
// promo     — the promotion object (owner_type, display_name, etc.)
// price     — the original product price (for savings calc)
// compact   — true = tighter spacing (card body), false = looser (quick view)
// ============================================================

function PromotionTags({ promo, price, compact = false }) {
  if (!promo) return null;

  const savingsLabel = computeSavingsLabel(promo, price);

  // Subtle left border accent to visually separate from product data
  return (
    <div
      className={`flex flex-wrap items-center gap-1 ${compact ? 'mt-0' : 'mt-2'}`}
      style={{
        borderLeft: `2px solid ${promo.badge_bg_color || '#111111'}`,
        paddingLeft: 6,
      }}
    >
      {/* ── Main promo badge ── */}
      <span
        className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-[4px] tracking-wide leading-none"
        style={{
          backgroundColor: promo.badge_bg_color  || '#111111',
          color:           promo.badge_text_color || '#FFFFFF',
        }}
      >
        {/* Owner indicator — small dot for seller promos */}
        {promo.owner_type === 'seller' && (
          <span
            className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0"
            style={{ backgroundColor: promo.badge_text_color || '#FFFFFF', opacity: 0.5 }}
          />
        )}
        {promo.display_name}
      </span>

      {/* ── Secondary context tag (e.g. "Baby & Kids", "Owambe") ── */}
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

      {/* ── Savings amount pill ── */}
      {savingsLabel && (
        <span
          className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full leading-none"
          style={{
            backgroundColor: '#EDFAF3',
            color:           '#0A3D2E',
            border:          '1px solid #A8DFC4',
          }}
        >
          {savingsLabel}
        </span>
      )}
    </div>
  );
}

// ============================================================
// RANK + TRENDING BADGES (unchanged)
// ============================================================

function RankBadge({ rank }) {
  if (!rank) return null;
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ backgroundColor: THEME.rankBg, color: THEME.rankText, border: `1px solid ${THEME.rankBorder}` }}
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
      style={{ backgroundColor: THEME.trendingBg, color: THEME.trendingText, border: `1px solid ${THEME.trendingBorder}` }}
    >
      <FiTrendingUp className="w-3 h-3" />
      Trending {velocity ? `· ${velocity}` : ''}
    </span>
  );
}

// ============================================================
// PRODUCT CARD
//
// New props:
//   product.promotions  {array}  Active promotions returned by the API.
//                                Sorted by priority desc (highest first).
//                                Each entry has: owner_type, display_name,
//                                display_tag, discount_type, discount_value,
//                                max_discount_cap, show_savings_amount,
//                                badge_bg_color, badge_text_color,
//                                tag_bg_color, tag_text_color, buy_x_quantity,
//                                get_y_quantity.
//
//   Zova promo  → shown as primary badge
//   Seller promo → shown as secondary badge below (if no Zova promo occupies same slot)
// ============================================================

const ProductCard = ({ product, source = 'unknown', position = null }) => {
  const { addToCart } = useCart();
  const [cartState, setCartState] = useState('idle');
  const [showQuickView, setShowQuickView] = useState(false);
  const [isQuickViewDescriptionExpanded, setIsQuickViewDescriptionExpanded] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [isPanningImage, setIsPanningImage] = useState(false);
  const panStateRef = useRef({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 });

  // ── Promotion resolution ─────────────────────────────────────────────────
  const promotions  = Array.isArray(product.promotions) ? product.promotions : [];
  // Zova promotions take the primary badge slot
  const zovaPromo   = promotions.find(p => p.owner_type === 'zova')   || null;
  // Seller promotions show as a secondary badge (only if different from zova slot)
  const sellerPromo = promotions.find(p => p.owner_type === 'seller') || null;
  // If there is no zova promo, the seller promo becomes primary
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
        className="group h-full flex flex-col bg-white transition-shadow duration-200"
        style={{ border: `1px solid ${THEME.cardBorder}`, boxShadow: THEME.cardShadow, borderRadius: '12px', overflow: 'hidden' }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = THEME.cardHoverShadow)}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = THEME.cardShadow)}
      >
        {/* ── Image ── */}
        <Link href={`/products/${product.slug}`} className="relative block shrink-0" onClick={handleProductClick}>
          <div className="aspect-[3/4] overflow-hidden relative" style={{ backgroundColor: THEME.skeletonBg }}>
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
                style={{ backgroundColor: THEME.quickViewBg, color: THEME.quickViewText, border: '1px solid #E8E8E8' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.quickViewHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.quickViewBg)}
              >
                Quick View
              </button>
            </div>

            {/* ── Top-left badge stack ── */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              {product.is_featured && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide" style={{ backgroundColor: THEME.newBg, color: THEME.newText }}>
                  NEW
                </span>
              )}
              {discountPercent && !primaryPromo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm" style={{ backgroundColor: THEME.saleBg, color: THEME.saleText }}>
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Trending flame */}
            {product.is_trending && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="text-sm w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }} title="Trending">
                  🔥
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* ── Body ── */}
        <div className="px-3 pt-3 pb-3.5 sm:px-3.5 sm:pt-3.5 sm:pb-4 flex-1 flex flex-col gap-2">

          <p className="text-[10px] uppercase tracking-widest line-clamp-1" style={{ color: THEME.categoryText }}>
            {product.categories?.[0]?.name || 'Collection'}
          </p>

          <Link href={`/products/${product.slug}`} onClick={handleProductClick}>
            <h3 className="text-sm font-medium leading-snug line-clamp-2 hover:underline" style={{ color: THEME.nameText }}>
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
            <span className="text-base sm:text-sm font-bold" style={{ color: THEME.priceText }}>
              ₦{(product.discount_price || product.price).toLocaleString()}
            </span>
            {product.discount_price && (
              <span className="text-xs line-through" style={{ color: THEME.originalPrice }}>
                ₦{product.price.toLocaleString()}
              </span>
            )}
            {discountPercent && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: THEME.saleBg, color: THEME.saleText }}>
                -{discountPercent}%
              </span>
            )}
            {primaryPromo && computeSavingsLabel(primaryPromo, product.price) && (
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
                style={{ backgroundColor: '#EDFAF3', color: '#0A3D2E', border: '1px solid #A8DFC4' }}
              >
                {computeSavingsLabel(primaryPromo, product.price)}
              </span>
            )}
          </div>

          {/* ── Promo name slot — fixed height so all cards stay uniform ── */}
          <div className="h-[20px] flex items-center gap-1">
            {primaryPromo && (
              <>
                <span
                  className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-[4px] tracking-wide leading-none"
                  style={{
                    backgroundColor: primaryPromo.badge_bg_color  || '#111111',
                    color:           primaryPromo.badge_text_color || '#FFFFFF',
                  }}
                >
                  {primaryPromo.owner_type === 'seller' && (
                    <span className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: primaryPromo.badge_text_color || '#FFFFFF', opacity: 0.5 }} />
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

          {salesFormatted && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: THEME.statsBg }}>
              <FiTrendingUp className="w-3 h-3 flex-shrink-0" style={{ color: THEME.statsIcon }} />
              <span className="text-[11px]" style={{ color: THEME.metaText }}>
                <span className="font-semibold" style={{ color: THEME.priceText }}>{salesFormatted}</span> sold
              </span>
              {product.store_is_trending && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-[11px]" style={{ color: THEME.trendingText }}>🔥 Hot store</span>
                </>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-1.5">
            {product.stores ? (
              <Link href={`/store/${product.stores.slug || product.stores.id}`} onClick={(e) => e.stopPropagation()} className="min-w-0 flex-1">
                <span
                  className="text-[11px] sm:text-[10px] truncate block transition-colors"
                  style={{ color: THEME.storeText }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = THEME.storeHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = THEME.storeText)}
                >
                  {product.store_is_trending && <span className="mr-1" style={{ color: THEME.trendingText }}>●</span>}
                  {product.stores.name}
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold flex-shrink-0 transition-all duration-150"
              style={{ backgroundColor: cartState === 'added' ? THEME.cartSuccessBg : THEME.cartBg, color: THEME.cartText }}
              onMouseEnter={(e) => { if (cartState !== 'added') e.currentTarget.style.backgroundColor = THEME.cartHoverBg; }}
              onMouseLeave={(e) => { if (cartState !== 'added') e.currentTarget.style.backgroundColor = THEME.cartBg; }}
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
                style={{ backgroundColor: '#F7F7F7', aspectRatio: '3/4', maxHeight: '38vh' }}
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
                  style={{ color: THEME.nameText }}
                >
                  <FiZoomIn className="h-3.5 w-3.5" /> Zoom
                </button>
              </div>

              {/* Info panel */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="overflow-y-auto px-5 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-4 flex flex-col gap-3">

                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-1.5 w-12 rounded-full bg-[#E9E9E9] sm:hidden" />
                    <button
                      type="button"
                      onClick={() => setShowQuickView(false)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ color: '#666' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FiX className="w-4 h-4" /> Close
                    </button>
                  </div>

                  <p className="text-[10px] uppercase tracking-widest" style={{ color: THEME.categoryText }}>
                    {product.categories?.[0]?.name || 'Collection'}
                  </p>

                  <h2 className="text-[15px] sm:text-lg font-bold leading-snug" style={{ color: THEME.nameText }}>
                    {product.name}
                  </h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl font-black" style={{ color: THEME.priceText }}>
                      ₦{(product.discount_price || product.price).toLocaleString()}
                    </span>
                    {product.discount_price && (
                      <span className="text-sm line-through" style={{ color: THEME.originalPrice }}>
                        ₦{product.price.toLocaleString()}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-sm" style={{ backgroundColor: THEME.saleBg, color: THEME.saleText }}>
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* ── PROMOTION TAGS in Quick View ── */}
                  {primaryPromo && (
                    <div className="space-y-1.5">
                      <PromotionTags promo={primaryPromo} price={product.price} compact={false} />
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
                    <p className="text-xs" style={{ color: THEME.metaText }}>
                      <span className="font-semibold" style={{ color: THEME.priceText }}>{salesFormatted}</span> units sold
                    </p>
                  )}

                  {product.stores && (
                    <p className="text-xs" style={{ color: THEME.storeText }}>
                      Sold by <span className="font-semibold" style={{ color: THEME.nameText }}>{product.stores.name}</span>
                    </p>
                  )}

                  {description && (
                    <div className="rounded-xl border border-[#EFEFEF] bg-[#FAFAFA] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: THEME.categoryText }}>Description</p>
                      <p className="mt-2 text-sm leading-6" style={{ color: THEME.metaText }}>{quickViewDescription}</p>
                      {hasLongDescription && (
                        <button type="button" onClick={() => setIsQuickViewDescriptionExpanded(c => !c)} className="mt-2 text-sm font-semibold" style={{ color: THEME.nameText }}>
                          {isQuickViewDescriptionExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex-1" />

                  {/* CTAs */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleQuickViewAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors"
                      style={{ backgroundColor: THEME.cartBg, color: THEME.cartText }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.cartHoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.cartBg)}
                    >
                      <FiShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setShowQuickView(false)}
                      className="px-4 py-3 rounded-xl text-sm font-semibold border transition-colors flex items-center whitespace-nowrap"
                      style={{ borderColor: '#E8E8E8', color: THEME.nameText }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
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
        <div className="fixed inset-0 z-[130] bg-[rgba(17,17,17,0.94)]" onClick={closeImageViewer}>
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

            <div className="flex items-center justify-center gap-3 px-4 pb-5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setImageZoom(c => Math.max(1, Number((c - 0.25).toFixed(2))))}
                disabled={imageZoom <= 1}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <FiMinus className="h-4 w-4" /> Zoom Out
              </button>
              <span className="min-w-[68px] text-center text-sm font-semibold text-white">{Math.round(imageZoom * 100)}%</span>
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