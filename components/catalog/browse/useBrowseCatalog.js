'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getBrowseProducts } from '@/features/catalog/api/client';
import { useFilters } from '@/contexts/filter/FilterContext';

export default function useBrowseCatalog({ initialCategory }) {
  const { filters, filtersReady, setSearch, setPage, setCategory } = useFilters();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const infiniteTriggerRef = useRef(null);
  const isAutoPagingRef = useRef(false);
  const didSeedCategory = useRef(false);
  const previousFiltersKey = useRef('');

  useEffect(() => {
    if (didSeedCategory.current || !filtersReady) return;

    if (initialCategory && filters.category !== initialCategory) {
      setCategory(initialCategory);
    } else {
      didSeedCategory.current = true;
    }
  }, [filtersReady, initialCategory, setCategory, filters.category]);

  useEffect(() => {
    if (!filtersReady) return;
    setSearchInput(filters.search || '');
  }, [filtersReady, filters.search]);

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (!filtersReady || !didSeedCategory.current) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', filters.page.toString());
      params.set('limit', '12');
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.collection) params.set('collection', filters.collection);
      if (filters.minPrice != null) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice != null) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sizes.length) params.set('sizes', filters.sizes.join(','));
      if (filters.colors.length) params.set('colors', filters.colors.join(','));
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.inStock) params.set('inStock', 'true');
      if (filters.onSale) params.set('onSale', 'true');

      const json = await getBrowseProducts(Object.fromEntries(params));

      if (!json.success) {
        setError(json.error || 'Failed to load products');
        return;
      }

      setProducts((current) => (isLoadMore ? [...current, ...json.data] : json.data));
      setMeta(json.meta?.pagination || null);
    } catch (fetchError) {
      console.error('fetchProducts error:', fetchError);
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
    filters.sizes,
    filters.colors,
    filters.sortBy,
    filters.inStock,
    filters.onSale,
  ]);

  useEffect(() => {
    if (!filtersReady || !didSeedCategory.current) return;

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

    const isLoadMore = key === previousFiltersKey.current && filters.page > 1;

    if (key !== previousFiltersKey.current) {
      setProducts([]);
      previousFiltersKey.current = key;
    }

    fetchProducts(isLoadMore);
  }, [fetchProducts, filtersReady, filters.page, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setSearch(searchInput);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.search, searchInput, setSearch]);

  const handleAutoLoadMore = useCallback(() => {
    if (!meta?.hasNextPage || loading || isAutoPagingRef.current) return;
    isAutoPagingRef.current = true;
    setPage(filters.page + 1);
  }, [filters.page, loading, meta?.hasNextPage, setPage]);

  useEffect(() => {
    if (!loading) {
      isAutoPagingRef.current = false;
    }
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
        rootMargin: '320px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [handleAutoLoadMore, meta?.hasNextPage]);

  return {
    products,
    loading,
    error,
    meta,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    searchInput,
    setSearchInput,
    infiniteTriggerRef,
  };
}
