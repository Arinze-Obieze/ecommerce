'use client';

import { useState, Suspense } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';

// Loading fallback for FilterSidebar
function FilterSidebarLoading() {
  return (
    <aside className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-5 w-24 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// Actual content component
function FilterSidebarContent({ onMobileClose }) {
  const {
    filters,
    categories,
    categoriesLoading,
    setCategory,
    setPriceRange,
    toggleSize,
    toggleColor,
    clearAllFilters,
    hasActiveFilters,
  } = useFilters();

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    sizes: true,
    colors: true,
  });

  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 10000,
  });

  // Available options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#22C55E' },
    { name: 'Yellow', hex: '#FBBF24' },
    { name: 'Gray', hex: '#9CA3AF' },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceApply = () => {
    setPriceRange(localPriceRange.min, localPriceRange.max);
  };

  const FilterSection = ({ title, section, children }) => {
    const isExpanded = expandedSections[section];

    return (
      <div className="border-b border-gray-200 pb-4 last:border-b-0">
        <button
          onClick={() => toggleSection(section)}
          className="flex items-center justify-between w-full py-3 font-medium text-gray-900 hover:text-blue-600"
        >
          <span className="text-sm font-semibold">{title}</span>
          <FiChevronDown
            className={`w-4 h-4 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isExpanded && <div className="space-y-3 mt-3">{children}</div>}
      </div>
    );
  };

  return (
    <aside className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full mb-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium"
        >
          Clear All Filters
        </button>
      )}

      {/* Category Filter */}
      <FilterSection title="Category" section="category">
        {categoriesLoading ? (
          <div className="text-sm text-gray-500">Loading categories...</div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === 'all'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.category === cat.slug
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{cat.name}</span>
                  <span className="text-xs text-gray-500">({cat.productCount || 0})</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection title="Price Range" section="price">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="10000"
              value={localPriceRange.min}
              onChange={e => setLocalPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min="0"
              max="10000"
              value={localPriceRange.max}
              onChange={e => setLocalPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </FilterSection>

      {/* Size Filter */}
      <FilterSection title="Size" section="sizes">
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                filters.sizes.includes(size)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color Filter */}
      <FilterSection title="Color" section="colors">
        <div className="space-y-2">
          {colorOptions.map(color => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.colors.includes(color.name)
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}

// Main FilterSidebar component with Suspense
export default function FilterSidebar({ onMobileClose }) {
  return (
    <Suspense fallback={<FilterSidebarLoading />}>
      <FilterSidebarContent onMobileClose={onMobileClose} />
    </Suspense>
  );
}