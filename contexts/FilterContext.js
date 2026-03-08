'use client';

import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef, Suspense,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const FilterContext = createContext();

const INITIAL_FILTERS = {
  search:     '',
  category:   '',
  collection: '',
  minPrice:   null,
  maxPrice:   null,
  sizes:      [],
  colors:     [],
  sortBy:     'newest',
  page:       1,
  inStock:    false,
  onSale:     false,
};

// ─── Parse URL → filter state ────────────────────────────────────────────────
function parseParams(searchParams) {
  const categoryParam = searchParams.get('category') || '';
  return {
    search:     searchParams.get('search')     || '',
    category:   categoryParam === 'all' ? '' : categoryParam,
    collection: searchParams.get('collection') || '',
    minPrice:   searchParams.get('minPrice')   ? parseFloat(searchParams.get('minPrice'))  : null,
    maxPrice:   searchParams.get('maxPrice')   ? parseFloat(searchParams.get('maxPrice'))  : null,
    sizes:      searchParams.get('sizes')      ? searchParams.get('sizes').split(',')      : [],
    colors:     searchParams.get('colors')     ? searchParams.get('colors').split(',')     : [],
    sortBy:     searchParams.get('sortBy')     || 'newest',
    page:       parseInt(searchParams.get('page') || '1', 10),
    inStock:    searchParams.get('inStock')    === 'true',
    onSale:     searchParams.get('onSale')     === 'true',
  };
}

// ─── Build URL params from filter state ──────────────────────────────────────
function buildParams(f) {
  const p = new URLSearchParams();
  if (f.search)           p.set('search',     f.search);
  if (f.category)         p.set('category',   f.category);
  if (f.collection)       p.set('collection', f.collection);
  if (f.minPrice != null) p.set('minPrice',   String(f.minPrice));
  if (f.maxPrice != null) p.set('maxPrice',   String(f.maxPrice));
  if (f.sizes.length)     p.set('sizes',      f.sizes.join(','));
  if (f.colors.length)    p.set('colors',     f.colors.join(','));
  if (f.sortBy !== 'newest') p.set('sortBy',  f.sortBy);
  if (f.page > 1)         p.set('page',       String(f.page));
  if (f.inStock)          p.set('inStock',    'true');
  if (f.onSale)           p.set('onSale',     'true');
  return p.toString();
}

// ────────────────────────────────────────────────────────────────────────────
// Inner provider — uses useSearchParams (must be inside Suspense)
// ────────────────────────────────────────────────────────────────────────────
function FilterProviderContent({ children }) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  // ── Filter state — initialised from URL immediately ──────────────────────
  const [filters, setFilters]             = useState(() => parseParams(searchParams));
  const [filtersReady, setFiltersReady]   = useState(false);

  // ── Metadata ──────────────────────────────────────────────────────────────
  const [categories,            setCategories]            = useState([]);
  const [hierarchicalCategories,setHierarchicalCategories]= useState([]);
  const [collections,           setCollections]           = useState([]);
  const [categoriesLoading,     setCategoriesLoading]     = useState(true);
  const [availableFilters,      setAvailableFilters]      = useState({
    sizes: [], colors: [], brands: [], priceRange: { min: 0, max: 1000000 },
  });

  // ── Ref to skip URL push when URL caused the state change ─────────────────
  const isUpdatingFromUrl = useRef(false);
  const prevQueryString   = useRef(searchParams.toString());

  // ── KEY FIX: Sync URL → state in useEffect, NOT during render ────────────
  useEffect(() => {
    const qs = searchParams.toString();
    if (qs === prevQueryString.current) return; // nothing changed
    prevQueryString.current = qs;
    isUpdatingFromUrl.current = true;
    setFilters(parseParams(searchParams));
    setFiltersReady(true);
  }, [searchParams]);

  // Mark ready on first mount (URL already parsed in useState initialiser)
  useEffect(() => {
    setFiltersReady(true);
  }, []);

  // ── Fetch categories & collections once ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setCategoriesLoading(true);
        const [catRes, colRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/collections'),
        ]);
        const [catData, colData] = await Promise.all([catRes.json(), colRes.json()]);
        if (catData.success) {
          setCategories(catData.data || []);
          if (catData.hierarchical) setHierarchicalCategories(catData.hierarchical);
        }
        if (colData.success) setCollections(colData.data || []);
      } catch (err) {
        console.error('Failed to fetch filter metadata:', err);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  // ── Fetch available sizes/colors when category changes ────────────────────
  useEffect(() => {
    if (!filtersReady) return;
    (async () => {
      try {
        const p = new URLSearchParams();
        if (filters.category) p.set('category', filters.category);
        const res  = await fetch(`/api/products/filters?${p.toString()}`);
        const data = await res.json();
        if (data.success) setAvailableFilters(data.data);
      } catch (err) {
        console.error('Failed to fetch available filters:', err);
      }
    })();
  }, [filters.category, filtersReady]);

  // ── Core update function — updates state AND URL atomically ───────────────
  const updateFilters = useCallback((partial) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial };

      // Push to URL (skip if we're already processing a URL change)
      if (!isUpdatingFromUrl.current) {
        const qs      = buildParams(next);
        const newUrl  = `${pathname}${qs ? `?${qs}` : ''}`;
        const currUrl = `${pathname}${prev ? `?${buildParams(prev)}` : ''}`;
        if (newUrl !== currUrl) {
          prevQueryString.current = qs; // pre-set so the URL effect skips it
          router.replace(newUrl, { scroll: false });
        }
      }

      isUpdatingFromUrl.current = false;
      return next;
    });
  }, [pathname, router]);

  // ── Named helpers ─────────────────────────────────────────────────────────
  const setSearch     = useCallback((search)     => updateFilters({ search,     page: 1 }), [updateFilters]);
  const setCategory   = useCallback((category)   => updateFilters({ category,   page: 1 }), [updateFilters]);
  const setCollection = useCallback((collection) => updateFilters({ collection, page: 1 }), [updateFilters]);
  const setSortBy     = useCallback((sortBy)     => updateFilters({ sortBy }), [updateFilters]);
  const setPage       = useCallback((page)       => updateFilters({ page }), [updateFilters]);

  const setPriceRange = useCallback((minPrice, maxPrice) =>
    updateFilters({ minPrice, maxPrice, page: 1 }), [updateFilters]);

  const toggleSize = useCallback((size) => {
    setFilters((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      const next = { ...prev, sizes, page: 1 };
      const qs = buildParams(next);
      prevQueryString.current = qs;
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      return next;
    });
  }, [pathname, router]);

  const toggleColor = useCallback((color) => {
    setFilters((prev) => {
      const colors = prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];
      const next = { ...prev, colors, page: 1 };
      const qs = buildParams(next);
      prevQueryString.current = qs;
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      return next;
    });
  }, [pathname, router]);

  const toggleInStock = useCallback(() =>
    updateFilters({ inStock: !filters.inStock, page: 1 }), [filters.inStock, updateFilters]);

  const toggleOnSale = useCallback(() =>
    updateFilters({ onSale: !filters.onSale, page: 1 }), [filters.onSale, updateFilters]);

  const clearAllFilters = useCallback(() =>
    updateFilters({ ...INITIAL_FILTERS }), [updateFilters]);

  // ── Derived values ────────────────────────────────────────────────────────
  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.collection ||
    filters.minPrice != null || filters.maxPrice != null ||
    filters.sizes.length || filters.colors.length ||
    filters.inStock || filters.onSale
  );

  const activeFilterCount = [
    filters.search     ? 1 : 0,
    filters.category   ? 1 : 0,
    filters.collection ? 1 : 0,
    filters.minPrice   != null ? 1 : 0,
    filters.maxPrice   != null ? 1 : 0,
    filters.sizes.length,
    filters.colors.length,
    filters.inStock    ? 1 : 0,
    filters.onSale     ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const filterSummary = (() => {
    const s = [];
    if (filters.search)     s.push(`Search: "${filters.search}"`);
    if (filters.category)   s.push(`Category: ${categories.find(c => c.slug === filters.category)?.name || filters.category}`);
    if (filters.collection) s.push(`Collection: ${collections.find(c => c.slug === filters.collection)?.name || filters.collection}`);
    if (filters.minPrice != null || filters.maxPrice != null) {
      const parts = [];
      if (filters.minPrice != null) parts.push(`From ₦${filters.minPrice}`);
      if (filters.maxPrice != null) parts.push(`To ₦${filters.maxPrice}`);
      s.push(`Price: ${parts.join(' ')}`);
    }
    if (filters.sizes.length)  s.push(`Sizes: ${filters.sizes.join(', ')}`);
    if (filters.colors.length) s.push(`Colors: ${filters.colors.join(', ')}`);
    if (filters.inStock)       s.push('In Stock Only');
    if (filters.onSale)        s.push('On Sale');
    return s;
  })();

  const value = {
    // State
    filters, filtersReady,
    categories, hierarchicalCategories, collections,
    categoriesLoading, availableFilters,
    // Mutations
    updateFilters,
    setSearch, setCategory, setCollection,
    setPriceRange,
    toggleSize, toggleColor, toggleInStock, toggleOnSale,
    setSortBy, setPage, clearAllFilters,
    // Derived
    hasActiveFilters, activeFilterCount,
    filterSummary,
    isFiltered: hasActiveFilters,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

// ── Skeleton for Suspense fallback ───────────────────────────────────────────
function FilterLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-100 rounded mb-2" />
                ))}
              </div>
            ))}
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Public exports ────────────────────────────────────────────────────────────
export function FilterProvider({ children }) {
  return (
    <Suspense fallback={<FilterLoadingFallback />}>
      <FilterProviderContent>{children}</FilterProviderContent>
    </Suspense>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}