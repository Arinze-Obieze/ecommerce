"use client";
import { useState } from 'react';
import ProductCard from "../ProductCard";
import { useFilters } from "@/contexts/FilterContext";
import { FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const THEME = {
  green:       '#00B86B',
  greenDark:   '#0F7A4F',
  greenTint:   '#EDFAF3',
  greenBorder: '#A8DFC4',
  white:       '#FFFFFF',
  pageBg:      '#F9FAFB',
  charcoal:    '#111111',
  medGray:     '#666666',
  mutedText:   '#999999',
  border:      '#E8E8E8',
  softGray:    '#F5F5F5',
};

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="animate-pulse"
    style={{
      background: THEME.white,
      border: `1px solid ${THEME.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      animationDelay: `${delay}ms`,
    }}
  >
    <div style={{ aspectRatio: '3/4', background: THEME.softGray }} />
    <div style={{ padding: '10px 12px 14px' }}>
      <div style={{ height: 8,  background: THEME.softGray, borderRadius: 4, width: '55%', marginBottom: 8 }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, width: '80%', marginBottom: 8 }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, width: '40%', marginBottom: 12 }} />
      <div style={{ height: 32, background: THEME.softGray, borderRadius: 8 }} />
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProductGrid({ products, loading, error, meta, onLoadMore }) {
  const { setSearch, clearAllFilters, hasActiveFilters } = useFilters();
  const [loadMoreHov, setLoadMoreHov] = useState(false);

  // ── Loading ──
  if (loading && products.length === 0) {
    return (
      <div
        style={{ display: 'grid', gap: 10 }}
        className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
      >
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} delay={i * 50} />)}
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px 24px',
          textAlign: 'center',
          background: THEME.white,
          border: `1.5px dashed ${THEME.border}`,
          borderRadius: 18,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <FiAlertCircle size={22} style={{ color: '#DC2626' }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.charcoal, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Something went wrong
        </h3>
        <p style={{ fontSize: 13, color: THEME.mutedText, margin: '0 0 22px', maxWidth: 280, lineHeight: 1.6 }}>
          {error}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 22px',
            borderRadius: 10,
            border: 'none',
            background: THEME.charcoal,
            color: THEME.white,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <FiRefreshCw size={13} /> Try Again
        </button>
      </div>
    );
  }

  // ── Empty ──
  if (!loading && products.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          textAlign: 'center',
          background: THEME.white,
          border: `1.5px dashed ${THEME.border}`,
          borderRadius: 18,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: THEME.greenTint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <FiSearch size={22} style={{ color: THEME.green }} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.charcoal, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          No products found
        </h3>
        <p style={{ fontSize: 13, color: THEME.mutedText, margin: '0 0 24px', maxWidth: 300, lineHeight: 1.6 }}>
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 22px',
              borderRadius: 10,
              border: 'none',
              background: THEME.charcoal,
              color: THEME.white,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#333333')}
            onMouseLeave={(e) => (e.currentTarget.style.background = THEME.charcoal)}
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  // ── Products + pagination ──
  return (
    <div>
      {/* Grid */}
      <div
        style={{ display: 'grid', gap: 10 }}
        className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {/* Append skeleton cards while loading next page */}
        {loading && [...Array(4)].map((_, i) => <SkeletonCard key={`sk-${i}`} delay={i * 50} />)}
      </div>

      {/* Load more */}
      {meta?.hasNextPage && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 44 }}>
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            onMouseEnter={() => setLoadMoreHov(true)}
            onMouseLeave={() => setLoadMoreHov(false)}
            style={{
              padding: '12px 40px',
              borderRadius: 10,
              border: `2px solid ${THEME.charcoal}`,
              background: loadMoreHov ? THEME.charcoal : THEME.white,
              color: loadMoreHov ? THEME.white : THEME.charcoal,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 200,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Load More Products
          </button>
        </div>
      )}

      {/* End of list */}
      {!meta?.hasNextPage && products.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 44,
          }}
        >
          <div style={{ height: 1, width: 60, background: THEME.border }} />
          <span style={{ fontSize: 12, color: THEME.mutedText, fontWeight: 500 }}>
            You've seen all {products.length} products
          </span>
          <div style={{ height: 1, width: 60, background: THEME.border }} />
        </div>
      )}
    </div>
  );
}