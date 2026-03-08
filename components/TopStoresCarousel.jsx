"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiStar, FiUsers, FiCheckCircle, FiTrendingUp, FiPackage, FiArrowRight } from 'react-icons/fi';
import SectionCarousel from './SectionCarousel';

// ============================================================
// 🎨 THEME
// ============================================================
const THEME = {
  // Card
  cardBg:           "#FFFFFF",
  cardBorder:       "#F0F0F0",
  cardShadow:       "0 1px 4px rgba(0,0,0,0.05)",
  cardHoverShadow:  "0 8px 24px rgba(0,0,0,0.09)",
  cardHoverBorder:  "#E0E0E0",

  // Logo placeholder
  logoBg:           "#F5F5F5",
  logoBorder:       "#EFEFEF",
  logoText:         "#AAAAAA",

  // Text
  nameText:         "#111111",
  nameHover:        "#00B86B",
  descText:         "#888888",
  metaText:         "#999999",

  // Verified badge
  verifiedColor:    "#00B86B",

  // Stats
  statsBorder:      "#F5F5F5",
  ratingBg:         "#FFFBEB",
  ratingIcon:       "#F59E0B",
  ratingText:       "#111111",
  followerIcon:     "#AAAAAA",
  followerText:     "#111111",
  productsBg:       "#EDFAF3",
  productsText:     "#0A3D2E",
  productsIcon:     "#00B86B",

  // Visit button
  btnBg:            "#00B86B",
  btnHover:         "#0F7A4F",
  btnText:          "#FFFFFF",

  // Trending store
  trendingBg:       "#FFF7ED",
  trendingText:     "#EA580C",
  trendingBorder:   "#FED7AA",

  // Skeleton
  skeletonBg:       "#F5F5F5",
  skeletonShine:    "#FAFAFA",
};
// ============================================================

function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ── Skeleton card ─────────────────────────────────────────────
function StoreCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse w-full"
      style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.cardBorder}` }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ backgroundColor: THEME.skeletonBg }} />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 rounded w-3/4" style={{ backgroundColor: THEME.skeletonBg }} />
          <div className="h-3 rounded w-full" style={{ backgroundColor: THEME.skeletonBg }} />
          <div className="h-3 rounded w-2/3" style={{ backgroundColor: THEME.skeletonBg }} />
        </div>
      </div>
      <div className="h-px mb-4" style={{ backgroundColor: THEME.statsBorder }} />
      <div className="flex gap-2">
        <div className="h-7 rounded-full flex-1" style={{ backgroundColor: THEME.skeletonBg }} />
        <div className="h-7 rounded-full flex-1" style={{ backgroundColor: THEME.skeletonBg }} />
        <div className="h-7 rounded-full flex-1" style={{ backgroundColor: THEME.skeletonBg }} />
      </div>
    </div>
  );
}

// ── Store card ────────────────────────────────────────────────
function StoreCard({ store }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="h-full" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link
        href={`/store/${store.slug}`}
        className="flex flex-col h-full rounded-2xl p-5 transition-all duration-200"
        style={{
          backgroundColor: THEME.cardBg,
          border: `1px solid ${hovered ? THEME.cardHoverBorder : THEME.cardBorder}`,
          boxShadow: hovered ? THEME.cardHoverShadow : THEME.cardShadow,
        }}
      >
        {/* ── Top row: logo + info ── */}
        <div className="flex items-start gap-3 mb-4">

          {/* Logo */}
          <div
            className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: THEME.logoBg, border: `1px solid ${THEME.logoBorder}` }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black" style={{ color: THEME.logoText }}>
                {store.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name + description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3
                className="text-sm font-bold truncate transition-colors"
                style={{ color: hovered ? THEME.nameHover : THEME.nameText }}
              >
                {store.name}
              </h3>
              {store.kyc_status === 'verified' && (
                <FiCheckCircle
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: THEME.verifiedColor }}
                  title="Verified Store"
                />
              )}
            </div>

            {/* Trending badge — shown if store is trending */}
            {store.is_trending && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1"
                style={{
                  backgroundColor: THEME.trendingBg,
                  color: THEME.trendingText,
                  border: `1px solid ${THEME.trendingBorder}`,
                }}
              >
                <FiTrendingUp className="w-2.5 h-2.5" /> Trending
              </span>
            )}

            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: THEME.descText }}>
              {store.description || 'High quality products, delivered to your door.'}
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          className="flex items-center gap-2 pt-3 mt-auto"
          style={{ borderTop: `1px solid ${THEME.statsBorder}` }}
        >
          {/* Rating */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-1 justify-center"
            style={{ backgroundColor: THEME.ratingBg }}
          >
            <FiStar className="w-3 h-3 fill-current" style={{ color: THEME.ratingIcon }} />
            <span style={{ color: THEME.ratingText }}>
              {store.rating ? Number(store.rating).toFixed(1) : 'New'}
            </span>
          </div>

          {/* Followers */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-1 justify-center"
            style={{ backgroundColor: THEME.statsBorder }}
          >
            <FiUsers className="w-3 h-3" style={{ color: THEME.followerIcon }} />
            <span style={{ color: THEME.followerText }}>{formatCount(store.followers)}</span>
          </div>

          {/* Product count — new field, backend to wire up */}
          {store.product_count != null && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-1 justify-center"
              style={{ backgroundColor: THEME.productsBg }}
            >
              <FiPackage className="w-3 h-3" style={{ color: THEME.productsIcon }} />
              <span style={{ color: THEME.productsText }}>{formatCount(store.product_count)}</span>
            </div>
          )}
        </div>

        {/* ── Visit CTA ── */}
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: `1px solid ${THEME.statsBorder}` }}
        >
          <span className="text-xs" style={{ color: THEME.metaText }}>
            {store.location || 'Nigeria'}
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: hovered ? THEME.btnBg : 'transparent',
              color: hovered ? THEME.btnText : THEME.nameHover,
              border: `1px solid ${hovered ? THEME.btnBg : THEME.nameHover}`,
            }}
          >
            Visit <FiArrowRight className="w-3 h-3" />
          </span>
        </div>

      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
const TopStoresCarousel = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStores = async () => {
      try {
        const res = await fetch('/api/stores/top?limit=8');
        const json = await res.json();
        if (json.success) setStores(json.data);
      } catch (error) {
        console.error('Failed to fetch top stores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopStores();
  }, []);

  if (loading) {
    return (
      <SectionCarousel title="Top Rated Stores">
        {[...Array(4)].map((_, i) => <StoreCardSkeleton key={i} />)}
      </SectionCarousel>
    );
  }

  if (stores.length === 0) return null;

  return (
    <SectionCarousel title="Top Rated Stores" linkText="View All Stores" linkHref="/stores">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </SectionCarousel>
  );
};

export default TopStoresCarousel;