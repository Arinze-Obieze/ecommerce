'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Create the context
const FilterContext = createContext();

// Initial filter state
const initialFilters = {
  search: '',
  category: '',
  collection: '', // Added collection
  minPrice: null,
  maxPrice: null,
  sizes: [],
  colors: [],
  sortBy: 'newest',
  page: 1,
  inStock: false,
  onSale: false,
};

// Main FilterProvider that wraps in Suspense
export function FilterProvider({ children }) {
  return (
    <Suspense fallback={<FilterLoadingFallback />}>
      <FilterProviderContent>{children}</FilterProviderContent>
    </Suspense>
  );
}

// Loading fallback component
function FilterLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="h-5 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Products grid skeleton */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex justify-between items-center">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination skeleton */}
            <div className="mt-8 flex justify-center">
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content component that uses useSearchParams
function FilterProviderContent({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [filters, setFilters] = useState(initialFilters);
  const [filtersReady, setFiltersReady] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]); // Added hierarchical state
  const [collections, setCollections] = useState([]); // Added collections state
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [availableFilters, setAvailableFilters] = useState({
    sizes: [],
    colors: [],
    brands: [],
    priceRange: { min: 0, max: 1000 },
  });

  const [lastQueryString, setLastQueryString] = useState(null);

  const currentQueryString = searchParams.toString();
  
  // Initialize/sync filters from URL params synchronously during render
  if (currentQueryString !== lastQueryString) {
    setLastQueryString(currentQueryString);
    const search = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';
    const category = categoryParam === 'all' ? '' : categoryParam;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null;
    const sizes = searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [];
    const colors = searchParams.get('colors') ? searchParams.get('colors').split(',') : [];
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const inStock = searchParams.get('inStock') === 'true';
    const onSale = searchParams.get('onSale') === 'true';
    const collection = searchParams.get('collection') || '';

    setFilters({
      search,
      category,
      collection,
      minPrice,
      maxPrice,
      sizes,
      colors,
      sortBy,
      page,
      inStock,
      onSale,
    });
    
    if (!filtersReady) {
      setFiltersReady(true);
    }
  }

  // Fetch categories and collections on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCategoriesLoading(true);
        
        // Fetch Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
          // Assuming API returns 'hierarchical' key as well, or we build it here.
          // The current API route actually returns 'hierarchical' in the response!
          if (catData.hierarchical) {
            setHierarchicalCategories(catData.hierarchical);
          }
        }

        // Fetch Collections
        const colRes = await fetch('/api/collections');
        const colData = await colRes.json();
        if (colData.success) {
          setCollections(colData.data);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available filters (sizes, colors, brands) based on current filters
  useEffect(() => {
    const fetchAvailableFilters = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.category) {
          params.set('category', filters.category);
        }
        
        const res = await fetch(`/api/products/filters?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setAvailableFilters(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch available filters:', error);
      }
    };

    fetchAvailableFilters();
  }, [filters.category]);

  // Sync filters to URL params
  const updateFilters = useCallback((partialFilters) => {
    // Merge with current state
    const updatedFilters = { ...filters, ...partialFilters };
    
    // 1. Update State
    setFilters(updatedFilters);

    // 2. Update URL
    const params = new URLSearchParams();
    if (updatedFilters.search) params.set('search', updatedFilters.search);
    if (updatedFilters.category) params.set('category', updatedFilters.category);
    if (updatedFilters.collection) params.set('collection', updatedFilters.collection); // Add collection
    if (updatedFilters.minPrice) params.set('minPrice', updatedFilters.minPrice.toString());
    if (updatedFilters.maxPrice) params.set('maxPrice', updatedFilters.maxPrice.toString());
    if (updatedFilters.sizes.length) params.set('sizes', updatedFilters.sizes.join(','));
    if (updatedFilters.colors.length) params.set('colors', updatedFilters.colors.join(','));
    if (updatedFilters.sortBy !== 'newest') params.set('sortBy', updatedFilters.sortBy);
    if (updatedFilters.page > 1) params.set('page', updatedFilters.page.toString());
    if (updatedFilters.inStock) params.set('inStock', 'true');
    if (updatedFilters.onSale) params.set('onSale', 'true');

    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
    
    // Check if URL actually changed to prevent loops/redundant pushes
    const currentQuery = searchParams.toString();
    const currentUrl = `${pathname}${currentQuery ? `?${currentQuery}` : ''}`;

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, router, pathname, searchParams]);

  // Helper functions
  const setSearch = useCallback((search) => {
    updateFilters({ search, page: 1 });
  }, [updateFilters]);

  const setCategory = useCallback((category) => {
    updateFilters({ category, page: 1 });
  }, [updateFilters]);

  const setCollection = useCallback((collection) => {
    updateFilters({ collection, page: 1 });
  }, [updateFilters]);


  const setPriceRange = useCallback((minPrice, maxPrice) => {
    updateFilters({ minPrice, maxPrice, page: 1 });
  }, [updateFilters]);

  const toggleSize = useCallback((size) => {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    updateFilters({ sizes, page: 1 });
  }, [filters.sizes, updateFilters]);

  const toggleColor = useCallback((color) => {
    const colors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    updateFilters({ colors, page: 1 });
  }, [filters.colors, updateFilters]);

  const toggleInStock = useCallback(() => {
    updateFilters({ inStock: !filters.inStock, page: 1 });
  }, [filters.inStock, updateFilters]);

  const toggleOnSale = useCallback(() => {
    updateFilters({ onSale: !filters.onSale, page: 1 });
  }, [filters.onSale, updateFilters]);

  const setSortBy = useCallback((sortBy) => {
    updateFilters({ sortBy });
  }, [updateFilters]);

  const setPage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  const clearAllFilters = useCallback(() => {
    updateFilters({
      search: '',
      category: '',
      collection: '',
      minPrice: null,
      maxPrice: null,
      sizes: [],
      colors: [],
      sortBy: 'newest',
      page: 1,
      inStock: false,
      onSale: false,
    });
  }, [updateFilters]);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.search ||
      filters.category ||
      filters.collection ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.sizes.length > 0 ||
      filters.colors.length > 0 ||
      filters.inStock ||
      filters.onSale
    );
  }, [filters]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const summary = [];
    
    if (filters.search) {
      summary.push(`Search: "${filters.search}"`);
    }
    
    if (filters.category) {
      const categoryName = categories.find(c => c.slug === filters.category)?.name || filters.category;
      summary.push(`Category: ${categoryName}`);
    }

    if (filters.collection) {
      const collectionName = collections.find(c => c.slug === filters.collection)?.name || filters.collection;
      summary.push(`Collection: ${collectionName}`);
    }
    
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = [];
      if (filters.minPrice) priceRange.push(`From $${filters.minPrice}`);
      if (filters.maxPrice) priceRange.push(`To $${filters.maxPrice}`);
      summary.push(`Price: ${priceRange.join(' ')}`);
    }
    
    if (filters.sizes.length > 0) {
      summary.push(`Sizes: ${filters.sizes.join(', ')}`);
    }
    
    if (filters.colors.length > 0) {
      summary.push(`Colors: ${filters.colors.join(', ')}`);
    }
    
    if (filters.inStock) {
      summary.push('In Stock Only');
    }
    
    if (filters.onSale) {
      summary.push('On Sale');
    }
    
    return summary;
  }, [filters, categories, collections]);

  const value = {
    // State
    filters,
    filtersReady,
    categories,
    hierarchicalCategories, // Exposed
    collections, // Added
    categoriesLoading,
    availableFilters,
    
    // Filter mutations
    updateFilters,
    setSearch,
    setCategory,
    setCollection, // Added
    setPriceRange,
    toggleSize,
    toggleColor,
    toggleInStock,
    toggleOnSale,
    setSortBy,
    setPage,
    clearAllFilters,
    
    // Helpers
    hasActiveFilters: hasActiveFilters(),
    filterSummary: getFilterSummary(),
    
    // Computed values
    isFiltered: hasActiveFilters(),
    activeFilterCount: [
      filters.search ? 1 : 0,
      filters.category ? 1 : 0,
      filters.collection ? 1 : 0,
      filters.minPrice ? 1 : 0,
      filters.maxPrice ? 1 : 0,
      filters.sizes.length,
      filters.colors.length,
      filters.inStock ? 1 : 0,
      filters.onSale ? 1 : 0,
    ].reduce((a, b) => a + b, 0),
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

// Hook to use the context
export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}

// Hook for using search params directly (with Suspense)
export function useFilterSearchParams() {
  return useSearchParams();
}
