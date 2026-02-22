'use client';

import { FiX } from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';

export default function ActiveFilters() {
  const {
    filters,
    setSearch,
    setCategory,
    setPriceRange,
    toggleSize,
    toggleColor,
    clearAllFilters,
    hasActiveFilters,
  } = useFilters();

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 mr-2">Active filters:</span>
        
        {/* Search filter */}
        {filters.search && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <span>Search: "{filters.search}"</span>
            <button
              onClick={() => setSearch('')}
              className="ml-1 hover:text-blue-900"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Category filter */}
        {filters.category && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <span>Category: {filters.category}</span>
            <button
              onClick={() => setCategory('')}
              className="ml-1 hover:text-blue-900"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Price range filter */}
        {(filters.minPrice || filters.maxPrice) && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <span>
              Price: {filters.minPrice ? `$${filters.minPrice}` : 'Any'} - {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
            </span>
            <button
              onClick={() => setPriceRange(null, null)}
              className="ml-1 hover:text-blue-900"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Size filters */}
        {filters.sizes.map(size => (
          <div key={size} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <span>Size: {size}</span>
            <button
              onClick={() => toggleSize(size)}
              className="ml-1 hover:text-blue-900"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Color filters */}
        {filters.colors.map(color => (
          <div key={color} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <span>Color: {color}</span>
            <button
              onClick={() => toggleColor(color)}
              className="ml-1 hover:text-blue-900"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Clear all button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="ml-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
