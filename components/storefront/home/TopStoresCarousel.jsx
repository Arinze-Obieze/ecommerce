"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiStar, FiUsers, FiCheckCircle, FiTrendingUp, FiPackage, FiArrowRight } from 'react-icons/fi';
import SectionCarousel from '@/components/shared/SectionCarousel';
import { getTopStores } from '@/features/storefront/home/api/client';

// Brand tokens — sourced from app/globals.css


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
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${'var(--zova-border)'}` }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
          <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
          <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
        </div>
      </div>
      <div className="h-px mb-4" style={{ backgroundColor: 'var(--zova-border)' }} />
      <div className="flex gap-2">
        <div className="h-7 rounded-full flex-1" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
        <div className="h-7 rounded-full flex-1" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
        <div className="h-7 rounded-full flex-1" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
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
          backgroundColor: '#FFFFFF',
          border: `1px solid ${hovered ? '#B8D4A0' : 'var(--zova-border)'}`,
          boxShadow: hovered ? '0 8px 24px rgba(46,100,23,0.10)' : '0 1px 4px rgba(46,100,23,0.05)',
        }}
      >
        {/* ── Top row: logo + info ── */}
        <div className="flex items-start gap-3 mb-4">

          {/* Logo */}
          <div
            className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: 'var(--zova-green-soft)', border: `1px solid ${'#B8D4A0'}` }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black" style={{ color: 'var(--zova-primary-action)' }}>
                {store.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name + description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3
                className="text-sm font-bold truncate transition-colors"
                style={{ color: hovered ? 'var(--zova-primary-action)' : 'var(--zova-ink)' }}
              >
                {store.name}
              </h3>
              {store.kyc_status === 'verified' && (
                <FiCheckCircle
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: 'var(--zova-primary-action)' }}
                  title="Verified Store"
                />
              )}
            </div>

            {store.is_trending && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1"
                style={{
                  backgroundColor: 'var(--zova-accent-soft)',
                  color: 'var(--zova-warning)',
                  border: `1px solid ${'#F5D88A'}`,
                }}
              >
                <FiTrendingUp className="w-2.5 h-2.5" /> Trending
              </span>
            )}

            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--zova-text-body)' }}>
              {store.description || 'High quality products, delivered to your door.'}
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          className="flex items-center gap-2 pt-3 mt-auto"
          style={{ borderTop: `1px solid ${'var(--zova-border)'}` }}
        >
          {/* Rating */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-1 justify-center"
            style={{ backgroundColor: 'var(--zova-accent-soft)' }}
          >
            <FiStar className="w-3 h-3 fill-current" style={{ color: 'var(--zova-accent-emphasis)' }} />
            <span style={{ color: 'var(--zova-ink)' }}>
              {store.rating ? Number(store.rating).toFixed(1) : 'New'}
            </span>
          </div>

          {/* Followers */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-1 justify-center"
            style={{ backgroundColor: 'var(--zova-linen)' }}
          >
            <FiUsers className="w-3 h-3" style={{ color: 'var(--zova-text-muted)' }} />
            <span style={{ color: 'var(--zova-ink)' }}>{formatCount(store.followers)}</span>
          </div>

          {/* Product count */}
          {store.product_count != null && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-1 justify-center"
              style={{ backgroundColor: 'var(--zova-green-soft)' }}
            >
              <FiPackage className="w-3 h-3" style={{ color: 'var(--zova-primary-action)' }} />
              <span style={{ color: 'var(--zova-primary-action)' }}>{formatCount(store.product_count)}</span>
            </div>
          )}
        </div>

        {/* ── Visit CTA ── */}
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: `1px solid ${'var(--zova-border)'}` }}
        >
          <span className="text-xs" style={{ color: 'var(--zova-text-muted)' }}>
            {store.location || 'Nigeria'}
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              backgroundColor: hovered ? 'var(--zova-primary-action)' : 'transparent',
              color: hovered ? '#FFFFFF' : 'var(--zova-primary-action)',
              border: `1px solid ${hovered ? 'var(--zova-primary-action)' : 'var(--zova-primary-action)'}`,
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
const TopStoresCarousel = ({ initialStores = null }) => {
  const [stores, setStores]   = useState(() => (Array.isArray(initialStores) ? initialStores : []));
  const [loading, setLoading] = useState(() => !Array.isArray(initialStores));

  useEffect(() => {
    if (Array.isArray(initialStores)) return undefined;

    let active = true;

    (async () => {
      try {
        const json = await getTopStores(8);
        if (active && json.success) setStores(json.data);
      } catch (error) {
        console.error('Failed to fetch top stores:', error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialStores]);

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
