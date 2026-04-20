"use client";
import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import FilterSidebar from "./FilterSidebar";
import ActiveFilters from "./ActiveFilters";
import { useFilters } from "@/contexts/filter/FilterContext";
import BrowseHeader from "./BrowseHeader";
import ProductGrid from "./ProductGrid";
import MobileFilterDrawer from "./MobileFilterDrawer";
import { getBrowseProducts } from "@/features/catalog/api/client";

// ============================================================
// 🎨 THEME
// ============================================================
const THEME = {
  pageBg:         "#FFFFFF",
  sidebarWidth:   "272px",
  skeletonBg:     "#F0F0F0",
  skeletonRadius: "12px",
  divider:        "#F0F0F0",
};

// ── Loading skeleton ──────────────────────────────────────────
function BrowseLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.pageBg }}>
      <main className="w-full px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="hidden lg:block shrink-0" style={{ width: THEME.sidebarWidth }}>
            <div className="space-y-3">
              <div className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: THEME.skeletonBg }} />
              {[180, 200, 160, 120, 120].map((h, i) => (
                <div key={i} className="rounded-xl animate-pulse" style={{ height: h, backgroundColor: THEME.skeletonBg }} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="lg:hidden h-11 rounded-xl mb-5 animate-pulse" style={{ backgroundColor: THEME.skeletonBg }} />
            <div className="h-12 rounded-xl mb-4 animate-pulse" style={{ backgroundColor: THEME.skeletonBg }} />
            <div className="h-8 w-48 rounded-full mb-6 animate-pulse" style={{ backgroundColor: THEME.skeletonBg }} />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse" style={{ aspectRatio: '3/4', backgroundColor: THEME.skeletonBg, borderRadius: THEME.skeletonRadius, animationDelay: `${i * 60}ms` }} />
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
    filters,
    filtersReady,
    setSearch,
    setPage,
    setCategory,
  } = useFilters();

  const [products, setProducts]                   = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [meta, setMeta]                           = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput]             = useState('');
  const infiniteTriggerRef                        = useRef(null);
  const isAutoPagingRef                           = useRef(false);

  // ── Track whether the initial category has been seeded ─────
  // Once we've applied the initialCategory once, we're done.
  // After that the sidebar/context own the category — we never
  // re-check initialCategory again.
  const didSeedCategory = useRef(false);

  useEffect(() => {
    if (didSeedCategory.current) return;
    if (!filtersReady) return;

    if (initialCategory && filters.category !== initialCategory) {
      setCategory(initialCategory);
      // DO NOT set didSeedCategory.current = true here.
      // We must wait for the next render when filters.category === initialCategory
    } else {
      // Either we have no initialCategory, or it has successfully propagated into filters.category
      didSeedCategory.current = true;
    }
  }, [filtersReady, initialCategory, setCategory, filters.category]);

  // ── Keep local search input in sync with context ────────────
  useEffect(() => {
    if (!filtersReady) return;
    setSearchInput(filters.search || '');
  }, [filtersReady, filters.search]);

  // ── Fetch products ──────────────────────────────────────────
  const fetchProducts = useCallback(async (isLoadMore = false) => {
    // Block until context is ready AND initial seed is done
    if (!filtersReady || !didSeedCategory.current) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page',  filters.page.toString());
      params.set('limit', '12');
      if (filters.search)         params.set('search',   filters.search);
      if (filters.category)       params.set('category', filters.category);
      if (filters.collection)     params.set('collection', filters.collection);
      if (filters.minPrice != null) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice != null) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sizes.length)   params.set('sizes',   filters.sizes.join(','));
      if (filters.colors.length)  params.set('colors',  filters.colors.join(','));
      if (filters.sortBy)         params.set('sortBy',  filters.sortBy);
      if (filters.inStock)        params.set('inStock', 'true');
      if (filters.onSale)         params.set('onSale',  'true');

      const json = await getBrowseProducts(Object.fromEntries(params));

      if (!json.success) { setError(json.error || 'Failed to load products'); return; }

      setProducts(prev => isLoadMore ? [...prev, ...json.data] : json.data);
      setMeta(json.meta?.pagination || null);
    } catch (err) {
      console.error('fetchProducts error:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    filtersReady,
    filters.page,
    filters.category,
    filters.collection,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    // Use serialized forms of arrays to avoid stale reference issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filters.sizes.join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filters.colors.join(','),
    filters.sortBy,
    filters.inStock,
    filters.onSale,
  ]);

  // ── Re-fetch whenever filters change ────────────────────────
  // Reset products list when anything other than page changes
  const prevFiltersKey = useRef('');

  useEffect(() => {
    if (!filtersReady || !didSeedCategory.current) return;

    // Build a key from everything except page
    const key = [
      filters.category,
      filters.collection,
      filters.search,
      filters.minPrice,
      filters.maxPrice,
      filters.sizes.join(','),
      filters.colors.join(','),
      filters.sortBy,
      filters.inStock,
      filters.onSale,
    ].join('|');

    const isLoadMore = key === prevFiltersKey.current && filters.page > 1;

    if (key !== prevFiltersKey.current) {
      // Filter changed — reset list
      setProducts([]);
      prevFiltersKey.current = key;
    }

    fetchProducts(isLoadMore);
  }, [fetchProducts, filtersReady, filters.page]);
  // NOTE: fetchProducts already captures all filter values via useCallback deps

  // ── Debounced search input → context ────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setSearch(searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // intentionally omit setSearch / filters.search to avoid loop

  const handleAutoLoadMore = useCallback(() => {
    if (!meta?.hasNextPage || loading || isAutoPagingRef.current) return;
    isAutoPagingRef.current = true;
    setPage(filters.page + 1);
  }, [meta?.hasNextPage, loading, filters.page, setPage]);

  useEffect(() => {
    if (!loading) isAutoPagingRef.current = false;
  }, [loading]);

  useEffect(() => {
    const target = infiniteTriggerRef.current;
    if (!target || !meta?.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) handleAutoLoadMore();
      },
      {
        root: null,
        // Start loading before the user reaches the absolute bottom.
        rootMargin: '320px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [handleAutoLoadMore, meta?.hasNextPage]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.pageBg }}>
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      />

      <main className="w-full px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block shrink-0" style={{ width: THEME.sidebarWidth }}>
            <div
              className="sticky top-24 overflow-hidden pb-6 pr-2"
              style={{ width: THEME.sidebarWidth, height: 'calc(100vh - 6rem)' }}
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

            <div className="mb-6 h-px" style={{ backgroundColor: THEME.divider }} />

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
