"use client";
import { useFilters } from "@/contexts/filter/FilterContext";
import { FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import LazyProductTile from "./LazyProductTile";
import EmptyState from "@/components/ui/EmptyState";

// Brand tokens — sourced from app/globals.css


// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="animate-pulse"
    style={{
      background: '#FFFFFF',
      border: `1px solid ${'var(--zova-border)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      animationDelay: `${delay}ms`,
    }}
  >
    <div style={{ aspectRatio: '3/4', background: 'var(--zova-surface-alt)' }} />
    <div style={{ padding: '10px 12px 14px' }}>
      <div style={{ height: 8,  background: 'var(--zova-surface-alt)', borderRadius: 4, width: '55%', marginBottom: 8 }} />
      <div style={{ height: 11, background: 'var(--zova-surface-alt)', borderRadius: 4, width: '80%', marginBottom: 8 }} />
      <div style={{ height: 11, background: 'var(--zova-surface-alt)', borderRadius: 4, width: '40%', marginBottom: 12 }} />
      <div style={{ height: 32, background: 'var(--zova-surface-alt)', borderRadius: 8 }} />
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProductGrid({ products, loading, error, meta, surface = null, trackingMeta = null, gridClassName = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4" }) {
  const { clearAllFilters, hasActiveFilters } = useFilters();
  const primaryActionButton = "inline-flex items-center gap-2 rounded-[10px] bg-(--zova-ink) px-[22px] py-[10px] text-[13px] font-bold text-white transition-colors hover:bg-[#333333]";

  // ── Loading ──
  if (loading && products.length === 0) {
    return (
      <div
        style={{ display: 'grid', gap: 10 }}
        className={gridClassName}
      >
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} delay={i * 50} />)}
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <EmptyState
        tone="error"
        icon={<FiAlertCircle size={22} />}
        title="Something went wrong"
        description={error}
        action={(
          <button type="button" onClick={() => window.location.reload()} className={primaryActionButton}>
            <FiRefreshCw size={13} /> Try Again
          </button>
        )}
      />
    );
  }

  // ── Empty ──
  if (!loading && products.length === 0) {
    return (
      <EmptyState
        icon={<FiSearch size={22} />}
        title="No products found"
        description="Try adjusting your filters or search terms to find what you're looking for."
        action={hasActiveFilters ? (
          <button type="button" onClick={clearAllFilters} className={primaryActionButton}>
            Clear All Filters
          </button>
        ) : null}
      />
    );
  }

  // ── Products + pagination ──
  return (
    <div>
      {/* Grid */}
      <div
        style={{ display: 'grid', gap: 10 }}
        className={gridClassName}
      >
        {products.map((product, index) => (
          <LazyProductTile
            key={product.id}
            product={product}
            index={index}
            eager={index < 8}
            surface={surface || meta?.scoring?.surface || 'browse_grid'}
            trackingMeta={{
              sortStrategy: trackingMeta?.sortStrategy || meta?.scoring?.strategy || null,
              persona: trackingMeta?.persona || meta?.scoring?.persona || null,
            }}
          />
        ))}
        {/* Append skeleton cards while loading next page */}
        {loading && [...Array(4)].map((_, i) => <SkeletonCard key={`sk-${i}`} delay={i * 50} />)}
      </div>

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
          <div style={{ height: 1, width: 60, background: 'var(--zova-border)' }} />
          <span style={{ fontSize: 12, color: 'var(--zova-text-muted)', fontWeight: 500 }}>
            You've seen all {products.length} products
          </span>
          <div style={{ height: 1, width: 60, background: 'var(--zova-border)' }} />
        </div>
      )}
    </div>
  );
}
