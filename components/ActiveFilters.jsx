'use client';

import { FiX } from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';

export default function ActiveFilters() {
  const {
    filters,
    categories,
    setCategory,
    setPriceRange,
    toggleSize,
    toggleColor,
    setSearch,
    clearAllFilters,
    hasActiveFilters,
  } = useFilters();

  if (!hasActiveFilters()) return null;

  const getCategoryName = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat?.name || slug;
  };

  const removeFilter = (type, value) => {
    switch (type) {
      case 'search':
        setSearch('');
        break;
      case 'category':
        setCategory('all');
        break;
      case 'price':
        setPriceRange(null, null);
        break;
      case 'size':
        toggleSize(value);
        break;
      case 'color':
        toggleColor(value);
        break;
      default:
        break;
    }
  };

  const FilterChip = ({ label, type, value, onRemove }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
      <span>{label}</span>
      <button
        onClick={() => onRemove(type, value)}
        className="ml-1 p-1 hover:bg-blue-200 rounded-full transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Active Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Search Filter */}
        {filters.search && (
          <FilterChip
            label={`Search: "${filters.search}"`}
            type="search"
            value={filters.search}
            onRemove={removeFilter}
          />
        )}

        {/* Category Filter */}
        {filters.category && filters.category !== 'all' && (
          <FilterChip
            label={`Category: ${getCategoryName(filters.category)}`}
            type="category"
            value={filters.category}
            onRemove={removeFilter}
          />
        )}

        {/* Price Range Filter */}
        {(filters.minPrice || filters.maxPrice) && (
          <FilterChip
            label={`Price: $${filters.minPrice || '0'} - $${filters.maxPrice || 'Any'}`}
            type="price"
            value={null}
            onRemove={removeFilter}
          />
        )}

        {/* Size Filters */}
        {filters.sizes.map(size => (
          <FilterChip
            key={`size-${size}`}
            label={`Size: ${size}`}
            type="size"
            value={size}
            onRemove={removeFilter}
          />
        ))}

        {/* Color Filters */}
        {filters.colors.map(color => (
          <FilterChip
            key={`color-${color}`}
            label={`Color: ${color}`}
            type="color"
            value={color}
            onRemove={removeFilter}
          />
        ))}
      </div>
    </div>
  );
}
