'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Create the context
const FilterContext = createContext();

// Initial filter state
const initialFilters = {
  search: '',
  category: 'all',
  minPrice: null,
  maxPrice: null,
  sizes: [],
  colors: [],
  sortBy: 'newest',
  page: 1,
};

export function FilterProvider({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState(initialFilters);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [availableFilters, setAvailableFilters] = useState({
    sizes: [],
    colors: [],
    brands: [],
  });

  // Initialize filters from URL params on mount
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null;
    const sizes = searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [];
    const colors = searchParams.get('colors') ? searchParams.get('colors').split(',') : [];
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');

    setFilters({
      search,
      category,
      minPrice,
      maxPrice,
      sizes,
      colors,
      sortBy,
      page,
    });
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Sync filters to URL params
  const updateFilters = useCallback((newFilters) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, ...newFilters };

      // Build query params
      const params = new URLSearchParams();
      if (updatedFilters.search) params.set('search', updatedFilters.search);
      if (updatedFilters.category && updatedFilters.category !== 'all') params.set('category', updatedFilters.category);
      if (updatedFilters.minPrice) params.set('minPrice', updatedFilters.minPrice);
      if (updatedFilters.maxPrice) params.set('maxPrice', updatedFilters.maxPrice);
      if (updatedFilters.sizes.length) params.set('sizes', updatedFilters.sizes.join(','));
      if (updatedFilters.colors.length) params.set('colors', updatedFilters.colors.join(','));
      if (updatedFilters.sortBy !== 'newest') params.set('sortBy', updatedFilters.sortBy);
      if (updatedFilters.page > 1) params.set('page', updatedFilters.page);

      // Update URL without page reload
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : '/');

      return updatedFilters;
    });
  }, [router]);

  // Helper functions
  const setSearch = useCallback((search) => {
    updateFilters({ search, page: 1 });
  }, [updateFilters]);

  const setCategory = useCallback((category) => {
    updateFilters({ category, page: 1 });
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

  const setSortBy = useCallback((sortBy) => {
    updateFilters({ sortBy });
  }, [updateFilters]);

  const setPage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
    router.push('/');
  }, [router]);

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.category !== 'all' ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.sizes.length > 0 ||
      filters.colors.length > 0
    );
  };

  const value = {
    // State
    filters,
    categories,
    categoriesLoading,
    availableFilters,
    
    // Mutations
    updateFilters,
    setSearch,
    setCategory,
    setPriceRange,
    toggleSize,
    toggleColor,
    setSortBy,
    setPage,
    clearAllFilters,
    
    // Helpers
    hasActiveFilters,
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
