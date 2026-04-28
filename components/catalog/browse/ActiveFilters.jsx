'use client';

import { FiX } from 'react-icons/fi';
import { useFilters } from '@/contexts/filter/FilterContext';

// Brand tokens — sourced from app/globals.css


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
        <span className="text-sm mr-2" style={{ color: 'var(--color-text-light)' }}>
          Active filters:
        </span>
        
        {/* Search filter */}
        {filters.search && (
          <div 
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ 
              backgroundColor: 'var(--color-primary-soft)',
              borderColor: 'rgba(46,100,23,0.18)',
              borderWidth: '1px',
              color: 'var(--color-primary)'
            }}
          >
            <span>Search: "{filters.search}"</span>
            <button
              onClick={() => setSearch('')}
              type="button"
              className="ml-1"
              style={{ color: 'var(--color-text-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Category filter */}
        {filters.category && (
          <div 
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ 
              backgroundColor: 'var(--color-primary-soft)',
              borderColor: 'rgba(46,100,23,0.18)',
              borderWidth: '1px',
              color: 'var(--color-primary)'
            }}
          >
            <span>Category: {filters.category}</span>
            <button
              onClick={() => setCategory('')}
              type="button"
              className="ml-1"
              style={{ color: 'var(--color-text-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Price range filter */}
        {(filters.minPrice || filters.maxPrice) && (
          <div 
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ 
              backgroundColor: 'var(--color-primary-soft)',
              borderColor: 'rgba(46,100,23,0.18)',
              borderWidth: '1px',
              color: 'var(--color-primary)'
            }}
          >
            <span>
              Price: {filters.minPrice ? `₦${filters.minPrice.toLocaleString()}` : 'Any'} - {filters.maxPrice ? `₦${filters.maxPrice.toLocaleString()}` : 'Any'}
            </span>
            <button
              onClick={() => setPriceRange(null, null)}
              type="button"
              className="ml-1"
              style={{ color: 'var(--color-text-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Size filters */}
        {filters.sizes.map(size => (
          <div 
            key={size} 
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ 
              backgroundColor: 'var(--color-primary-soft)',
              borderColor: 'rgba(46,100,23,0.18)',
              borderWidth: '1px',
              color: 'var(--color-primary)'
            }}
          >
            <span>Size: {size}</span>
            <button
              onClick={() => toggleSize(size)}
              type="button"
              className="ml-1"
              style={{ color: 'var(--color-text-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Color filters */}
        {filters.colors.map(color => (
          <div 
            key={color} 
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ 
              backgroundColor: 'var(--color-primary-soft)',
              borderColor: 'rgba(46,100,23,0.18)',
              borderWidth: '1px',
              color: 'var(--color-primary)'
            }}
          >
            <span>Color: {color}</span>
            <button
              onClick={() => toggleColor(color)}
              type="button"
              className="ml-1"
              style={{ color: 'var(--color-text-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Clear all button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            type="button"
            className="ml-2 px-3 py-1.5 text-sm font-medium transition-colors"
            style={{ color: THEME.colors.primary }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.primary}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}