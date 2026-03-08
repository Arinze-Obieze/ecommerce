'use client';

import { FiX } from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';

const THEME = {
  colors: {
    primary: '#00B86B',
    primaryHover: '#0F7A4F',
    deepEmerald: '#0A3D2E',
    white: '#FFFFFF',
    pageBg: '#F9FAFB',
    softGray: '#F5F5F5',
    darkCharcoal: '#111111',
    mediumGray: '#666666',
    mutedText: '#888888',
    border: '#F0F0F0',
    cardBorder: '#EFEFEF',
    greenTint: '#EDFAF3',
    greenBorder: '#A8DFC4',
  },
  shadows: {
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  transitions: {
    default: 'all 0.2s ease',
  }
};

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
        <span className="text-sm mr-2" style={{ color: THEME.colors.mediumGray }}>
          Active filters:
        </span>
        
        {/* Search filter */}
        {filters.search && (
          <div 
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ 
              backgroundColor: THEME.colors.greenTint,
              borderColor: THEME.colors.greenBorder,
              borderWidth: '1px',
              color: THEME.colors.deepEmerald
            }}
          >
            <span>Search: "{filters.search}"</span>
            <button
              onClick={() => setSearch('')}
              type="button"
              className="ml-1"
              style={{ color: THEME.colors.mediumGray }}
              onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.deepEmerald}
              onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.mediumGray}
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
              backgroundColor: THEME.colors.greenTint,
              borderColor: THEME.colors.greenBorder,
              borderWidth: '1px',
              color: THEME.colors.deepEmerald
            }}
          >
            <span>Category: {filters.category}</span>
            <button
              onClick={() => setCategory('')}
              type="button"
              className="ml-1"
              style={{ color: THEME.colors.mediumGray }}
              onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.deepEmerald}
              onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.mediumGray}
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
              backgroundColor: THEME.colors.greenTint,
              borderColor: THEME.colors.greenBorder,
              borderWidth: '1px',
              color: THEME.colors.deepEmerald
            }}
          >
            <span>
              Price: {filters.minPrice ? `₦${filters.minPrice.toLocaleString()}` : 'Any'} - {filters.maxPrice ? `₦${filters.maxPrice.toLocaleString()}` : 'Any'}
            </span>
            <button
              onClick={() => setPriceRange(null, null)}
              type="button"
              className="ml-1"
              style={{ color: THEME.colors.mediumGray }}
              onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.deepEmerald}
              onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.mediumGray}
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
              backgroundColor: THEME.colors.greenTint,
              borderColor: THEME.colors.greenBorder,
              borderWidth: '1px',
              color: THEME.colors.deepEmerald
            }}
          >
            <span>Size: {size}</span>
            <button
              onClick={() => toggleSize(size)}
              type="button"
              className="ml-1"
              style={{ color: THEME.colors.mediumGray }}
              onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.deepEmerald}
              onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.mediumGray}
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
              backgroundColor: THEME.colors.greenTint,
              borderColor: THEME.colors.greenBorder,
              borderWidth: '1px',
              color: THEME.colors.deepEmerald
            }}
          >
            <span>Color: {color}</span>
            <button
              onClick={() => toggleColor(color)}
              type="button"
              className="ml-1"
              style={{ color: THEME.colors.mediumGray }}
              onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.deepEmerald}
              onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.mediumGray}
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
            onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.primary}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}