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

function getShopPathCategory(pathname) {
  const match = pathname?.match(/^\/shop\/([^/]+)\/?$/);
  if (!match) return '';

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function isShopPath(pathname) {
  return pathname === '/shop' || pathname?.startsWith('/shop/');
}

// ─── Parse URL → filter state ────────────────────────────────────────────────
function parseParams(searchParams, pathname = '') {
  const categoryParam = searchParams.get('category');
  const pathCategory = getShopPathCategory(pathname);
  const resolvedCategory = categoryParam ?? pathCategory;

  return {
    search:     searchParams.get('search')     || '',
    category:   resolvedCategory === 'all' ? '' : resolvedCategory || '',
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
function buildParams(f, { includeCategory = true } = {}) {
  const p = new URLSearchParams();
  if (f.search)           p.set('search',     f.search);
  if (includeCategory && f.category) p.set('category', f.category);
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

function buildFilterUrl(filters, pathname) {
  if (!isShopPath(pathname)) {
    return {
      pathname,
      queryString: buildParams(filters),
    };
  }

  return {
    pathname: filters.category ? `/shop/${encodeURIComponent(filters.category)}` : '/shop',
    queryString: buildParams(filters, { includeCategory: false }),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Inner provider — uses useSearchParams (must be inside Suspense)
// ────────────────────────────────────────────────────────────────────────────
function FilterProviderContent({ children }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const queryString  = searchParams.toString();
  const currentUrl   = `${pathname}${queryString ? `?${queryString}` : ''}`;

  // ── Filter state — initialised from URL immediately ──────────────────────
  const [filters, setFilters]           = useState(() => parseParams(searchParams, pathname));
  const [filtersReady, setFiltersReady] = useState(false);

  // ── Metadata ──────────────────────────────────────────────────────────────
  const [categories,            setCategories]            = useState([]);
  const [hierarchicalCategories,setHierarchicalCategories]= useState([]);
  const [collections,           setCollections]           = useState([]);
  const [categoriesLoading,     setCategoriesLoading]     = useState(true);
  const [availableFilters,      setAvailableFilters]      = useState({
    sizes: [], colors: [], brands: [], priceRange: { min: 0, max: 1000000 },
  });

  // ── Refs ──────────────────────────────────────────────────────────────────
  // filtersRef: always holds the latest committed filters so mutation
  // callbacks can read current state without stale closures.
  const filtersRef      = useRef(filters);
  const currentUrlRef   = useRef(currentUrl);
  const prevUrl         = useRef(currentUrl);

  // Keep ref in sync — safe to set during render for refs
  filtersRef.current = filters;
  currentUrlRef.current = currentUrl;

  // ── URL → State (external navigation: back/forward, direct links) ────────
  useEffect(() => {
    if (currentUrl === prevUrl.current) return; // we pushed this ourselves

    prevUrl.current = currentUrl;
    const parsed = parseParams(searchParams, pathname);
    filtersRef.current = parsed;
    setFilters(parsed);
    setFiltersReady(true);
  }, [currentUrl, pathname, searchParams]);

  // Mark ready on first mount
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

  // ── Helper: commit a fully-computed next state + push URL ─────────────────
  // Called from event handlers (onClick, onChange), NEVER from inside a
  // setState updater.  React 18 batches both setFilters + router.replace
  // into a single render — no flash, no "setState during render" error.
  const commitFilters = useCallback((next) => {
    filtersRef.current = next;
    setFilters(next);

    const target = buildFilterUrl(next, pathname);
    const targetUrl = `${target.pathname}${target.queryString ? `?${target.queryString}` : ''}`;

    if (targetUrl !== currentUrlRef.current) {
      prevUrl.current = targetUrl;
      router.replace(targetUrl, { scroll: false });
    }
  }, [pathname, router]);

  // ── Public mutation helpers ───────────────────────────────────────────────
  // Each one reads the LATEST state from filtersRef, computes the full next
  // object, then hands it to commitFilters.  No functional updaters needed.

  const updateFilters = useCallback((partial) => {
    commitFilters({ ...filtersRef.current, ...partial });
  }, [commitFilters]);

  const setSearch = useCallback((search) => {
    commitFilters({ ...filtersRef.current, search, page: 1 });
  }, [commitFilters]);

  const setCategory = useCallback((category) => {
    commitFilters({ ...filtersRef.current, category, page: 1 });
  }, [commitFilters]);

  const setCollection = useCallback((collection) => {
    commitFilters({ ...filtersRef.current, collection, page: 1 });
  }, [commitFilters]);

  const setSortBy = useCallback((sortBy) => {
    commitFilters({ ...filtersRef.current, sortBy });
  }, [commitFilters]);

  const setPage = useCallback((page) => {
    commitFilters({ ...filtersRef.current, page });
  }, [commitFilters]);

  const setPriceRange = useCallback((minPrice, maxPrice) => {
    commitFilters({ ...filtersRef.current, minPrice, maxPrice, page: 1 });
  }, [commitFilters]);

  const toggleSize = useCallback((size) => {
    const prev  = filtersRef.current;
    const sizes = prev.sizes.includes(size)
      ? prev.sizes.filter((s) => s !== size)
      : [...prev.sizes, size];
    commitFilters({ ...prev, sizes, page: 1 });
  }, [commitFilters]);

  const toggleColor = useCallback((color) => {
    const prev   = filtersRef.current;
    const colors = prev.colors.includes(color)
      ? prev.colors.filter((c) => c !== color)
      : [...prev.colors, color];
    commitFilters({ ...prev, colors, page: 1 });
  }, [commitFilters]);

  const toggleInStock = useCallback(() => {
    const prev = filtersRef.current;
    commitFilters({ ...prev, inStock: !prev.inStock, page: 1 });
  }, [commitFilters]);

  const toggleOnSale = useCallback(() => {
    const prev = filtersRef.current;
    commitFilters({ ...prev, onSale: !prev.onSale, page: 1 });
  }, [commitFilters]);

  const clearAllFilters = useCallback(() => {
    commitFilters({ ...INITIAL_FILTERS });
  }, [commitFilters]);

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
