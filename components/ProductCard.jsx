"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiTrendingUp, FiAward, FiCheck, FiX } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { trackAnalyticsEvent } from '@/utils/analytics';

// ============================================================
// 🎨 THEME
// ============================================================
const THEME = {
  // Card
  cardBg:           "#FFFFFF",
  cardBorder:       "#EFEFEF",
  cardShadow:       "0 1px 3px rgba(0,0,0,0.06)",
  cardHoverShadow:  "0 4px 16px rgba(0,0,0,0.08)",

  // Text
  categoryText:     "#AAAAAA",
  nameText:         "#111111",
  priceText:        "#111111",
  originalPrice:    "#CCCCCC",
  storeText:        "#888888",
  storeHover:       "#444444",
  metaText:         "#999999",

  // Badges
  newBg:            "#111111",
  newText:          "#FFFFFF",
  saleBg:           "#E53935",
  saleText:         "#FFFFFF",
  trendingBg:       "#FFF7ED",
  trendingText:     "#EA580C",
  trendingBorder:   "#FED7AA",

  // Stats
  statsBg:          "#F8F8F8",
  statsIcon:        "#00B86B",
  rankBg:           "#EDFAF3",
  rankText:         "#0A3D2E",
  rankBorder:       "#A8DFC4",

  // Cart button — ZOVA Green
  cartBg:           "#00B86B",
  cartHoverBg:      "#0F7A4F",
  cartText:         "#FFFFFF",
  cartSuccessBg:    "#0A3D2E",

  // Quick view button (on image)
  quickViewBg:      "#FFFFFF",
  quickViewText:    "#111111",
  quickViewHover:   "#F5F5F5",

  // Skeleton
  skeletonBg:       "#F4F4F4",
};
// ============================================================

const QUICK_VIEW_DESCRIPTION_LIMIT = 180;

function formatSales(count) {
  if (!count && count !== 0) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

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

/**
 * ProductCard
 *
 * Props — existing:
 *   product.name, product.slug, product.price, product.discount_price,
 *   product.image_urls[], product.is_featured, product.categories[],
 *   product.stores { name, slug, id }
 *
 * Props — NEW (backend to wire up):
 *   product.is_trending       {boolean}  — is this product trending?
 *   product.trending_velocity {string}   — e.g. "+42% this week"
 *   product.total_sales       {number}   — total units sold
 *   product.category_rank     {number}   — rank within selected category
 *   product.store_is_trending {boolean}  — whether the store is trending
 */
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [cartState, setCartState] = useState('idle');
  const [showQuickView, setShowQuickView] = useState(false);
  const [isQuickViewDescriptionExpanded, setIsQuickViewDescriptionExpanded] = useState(false);

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  const salesFormatted = formatSales(product.total_sales);
  const description = String(product.description || '').trim();
  const hasLongDescription = description.length > QUICK_VIEW_DESCRIPTION_LIMIT;
  const quickViewDescription = hasLongDescription && !isQuickViewDescriptionExpanded
    ? `${description.slice(0, QUICK_VIEW_DESCRIPTION_LIMIT).trimEnd()}...`
    : description;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setCartState('added');
    setTimeout(() => setCartState('idle'), 2000);
  };

  const handleProductClick = () => {
    trackAnalyticsEvent('product_card_click', {
      product_id: product.id,
      product_name: product.name,
      store_id: product.store_id || null,
      price: Number(product.discount_price || product.price || 0),
      category: product.categories?.[0]?.slug || product.categories?.[0]?.name || null,
    });
  };

  return (
    <>
      {/* ── Card ── */}
      <div
        className="group h-full flex flex-col bg-white transition-shadow duration-200"
        style={{
          border: `1px solid ${THEME.cardBorder}`,
          boxShadow: THEME.cardShadow,
          borderRadius: '12px',
          overflow: 'hidden',
        }}
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

            {/* Quick View — slides up on hover */}
            <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickViewDescriptionExpanded(false);
                  setShowQuickView(true);
                }}
                className="text-xs font-semibold px-5 py-2 rounded-full shadow-lg transition-colors"
                style={{ backgroundColor: THEME.quickViewBg, color: THEME.quickViewText, border: '1px solid #E8E8E8' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.quickViewHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.quickViewBg)}
              >
                Quick View
              </button>
            </div>

            {/* Top-left badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              {product.is_featured && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide"
                  style={{ backgroundColor: THEME.newBg, color: THEME.newText }}
                >
                  NEW
                </span>
              )}
              {discountPercent && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: THEME.saleBg, color: THEME.saleText }}
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
        <div className="px-3 pt-2.5 pb-3 flex-1 flex flex-col gap-1.5">

          <p className="text-[10px] uppercase tracking-widest line-clamp-1" style={{ color: THEME.categoryText }}>
            {product.categories?.[0]?.name || 'Collection'}
          </p>

          <Link href={`/products/${product.slug}`} onClick={handleProductClick}>
            <h3 className="text-sm font-medium leading-snug line-clamp-2 hover:underline" style={{ color: THEME.nameText }}>
              {product.name}
            </h3>
          </Link>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold" style={{ color: THEME.priceText }}>
              ₦{(product.discount_price || product.price).toLocaleString()}
            </span>
            {product.discount_price && (
              <span className="text-xs line-through" style={{ color: THEME.originalPrice }}>
                ₦{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {(product.is_trending || product.category_rank) && (
            <div className="flex flex-wrap gap-1">
              {product.is_trending && <TrendingBadge velocity={product.trending_velocity} />}
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
          <div className="flex items-center justify-between gap-2 pt-1">
            {product.stores ? (
              <Link
                href={`/store/${product.stores.slug || product.stores.id}`}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1"
              >
                <span
                  className="text-[11px] truncate block transition-colors"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all duration-150"
              style={{
                backgroundColor: cartState === 'added' ? THEME.cartSuccessBg : THEME.cartBg,
                color: THEME.cartText,
              }}
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row">

              {/* Image panel */}
              <div
                className="w-full sm:w-[42%] flex-shrink-0 relative"
                style={{ backgroundColor: THEME.skeletonBg, aspectRatio: '3/4' }}
              >
                <img
                  src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info panel */}
              <div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '80vh' }}>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setShowQuickView(false)}
                  className="self-end p-1.5 rounded-full transition-colors"
                  style={{ color: '#999' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FiX className="w-4 h-4" />
                </button>

                <p className="text-[10px] uppercase tracking-widest" style={{ color: THEME.categoryText }}>
                  {product.categories?.[0]?.name || 'Collection'}
                </p>

                <h2 className="text-lg font-bold leading-snug" style={{ color: THEME.nameText }}>
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-2">
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

                {(product.is_trending || product.category_rank) && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.is_trending && <TrendingBadge velocity={product.trending_velocity} />}
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: THEME.categoryText }}>
                      Description
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: THEME.metaText }}>
                      {quickViewDescription}
                    </p>
                    {hasLongDescription && (
                      <button
                        type="button"
                        onClick={() => setIsQuickViewDescriptionExpanded((current) => !current)}
                        className="mt-2 text-sm font-semibold"
                        style={{ color: THEME.nameText }}
                      >
                        {isQuickViewDescriptionExpanded ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex-1" />

                {/* CTA buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={(e) => { handleAddToCart(e); setShowQuickView(false); }}
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
      )}
    </>
  );
};

export default ProductCard;
