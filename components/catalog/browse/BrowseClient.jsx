"use client";
import { Suspense } from "react";
import FilterSidebar from "./FilterSidebar";
import ActiveFilters from "./ActiveFilters";
import BrowseHeader from "./BrowseHeader";
import ProductGrid from "./ProductGrid";
import MobileFilterDrawer from "./MobileFilterDrawer";
import useBrowseCatalog from '@/components/catalog/browse/useBrowseCatalog';

// ============================================================
// 🎨 THEME
// ============================================================


// ── Loading skeleton ──────────────────────────────────────────
function BrowseLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <main className="w-full px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="hidden lg:block shrink-0" style={{ width: '272px' }}>
            <div className="space-y-3">
              <div className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
              {[180, 200, 160, 120, 120].map((h, i) => (
                <div key={i} className="rounded-xl animate-pulse" style={{ height: h, backgroundColor: 'var(--zova-surface-alt)' }} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="lg:hidden h-11 rounded-xl mb-5 animate-pulse" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
            <div className="h-12 rounded-xl mb-4 animate-pulse" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
            <div className="h-8 w-48 rounded-full mb-6 animate-pulse" style={{ backgroundColor: 'var(--zova-surface-alt)' }} />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse" style={{ aspectRatio: '3/4', backgroundColor: 'var(--zova-surface-alt)', borderRadius: '12px', animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────
function BrowseContent({ initialCategory }) {
  const {
    products,
    loading,
    error,
    meta,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    searchInput,
    setSearchInput,
    infiniteTriggerRef,
  } = useBrowseCatalog({ initialCategory });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      />

      <main className="w-full px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block shrink-0" style={{ width: '272px' }}>
            <div
              className="sticky top-24 overflow-hidden pb-6 pr-2"
              style={{ width: '272px', height: 'calc(100vh - 6rem)' }}
            >
              <FilterSidebar />
            </div>
          </aside>

          {/* ── Main area ── */}
          <div className="flex-1 min-w-0">
            <BrowseHeader
              productsLength={products.length}
              totalItems={meta?.totalItems || 0}
              onMobileFiltersOpen={() => setMobileFiltersOpen(true)}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />

            <div className="mt-3 mb-5 lg:hidden">
              <ActiveFilters />
            </div>

            <div className="mb-6 h-px" style={{ backgroundColor: 'var(--zova-border)' }} />

            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              meta={meta}
              surface="browse_grid"
              trackingMeta={meta?.scoring || null}
            />

            {/* Infinite-scroll trigger */}
            <div ref={infiniteTriggerRef} style={{ height: 1 }} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BrowseClient(props) {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowseContent {...props} />
    </Suspense>
  );
}
