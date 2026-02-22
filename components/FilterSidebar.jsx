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

// Helper component for filter sections
function FilterSection({ title, section, isExpanded, onToggle, children }) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <button
        onClick={() => onToggle(section)}
        className="flex items-center justify-between w-full py-3 group"
      >
        <span className="text-sm font-bold text-gray-900 group-hover:text-[#2E5C45] transition-colors">{title}</span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-400 group-hover:text-[#2E5C45] transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
           isExpanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
          <div className="min-h-0">
             {children}
          </div>
      </div>
    </div>
  );
}

// Actual content component
function FilterSidebarContent({ onMobileClose }) {
  const {
    filters,
    categories,
    collections, // Access collections from context
    categoriesLoading,
    setCategory,
    setCollection, // Access setCollection
    setPriceRange,
    toggleSize,
    toggleColor,
    clearAllFilters,
    hasActiveFilters,
  } = useFilters();

  const [expandedSections, setExpandedSections] = useState({
    collection: true,
    category: true,
    price: true,
    sizes: true,
    colors: true,
  });

  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.minPrice ? filters.minPrice.toLocaleString() : '',
    max: filters.maxPrice ? filters.maxPrice.toLocaleString() : '',
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

  const handlePriceChange = (field, value) => {
    // Allow digits and commas
    const smoothValue = value.replace(/[^0-9,]/g, '');
    setLocalPriceRange(prev => ({ ...prev, [field]: smoothValue }));
  };

  const handlePriceBlur = (field) => {
    // Format on blur
    const val = localPriceRange[field].replace(/,/g, '');
    if (val && !isNaN(val)) {
      setLocalPriceRange(prev => ({
        ...prev,
        [field]: Number(val).toLocaleString()
      }));
    }
  };

  const handlePriceApply = () => {
    const min = localPriceRange.min ? parseFloat(localPriceRange.min.replace(/,/g, '')) : 0;
    const max = localPriceRange.max ? parseFloat(localPriceRange.max.replace(/,/g, '')) : 10000; // Default max?
    setPriceRange(min, max);
  };

  return (
    <aside className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full mb-6 py-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 font-medium transition-colors"
        >
          Clear All Filters
        </button>
      )}

      <div className="space-y-2">
      
         {/* Collections Filter */}
         <FilterSection 
           title="Collections" 
           section="collection"
           isExpanded={expandedSections.collection}
           onToggle={toggleSection}
         >
          {categoriesLoading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : (
             <div className="space-y-1">
                 <button
                    onClick={() => setCollection(filters.collection === '' ? '' : '')} // Always allow setting to all
                    className={`flex items-center gap-3 w-full px-2 py-1.5 rounded-md transition-colors ${
                       filters.collection === '' 
                       ? 'bg-[#2E5C45] text-white font-medium' 
                       : 'text-gray-600 hover:bg-gray-50'
                    }`}
                 >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        filters.collection === '' ? 'border-white' : 'border-gray-300'
                    }`}>
                        {filters.collection === '' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm">All Collections</span>
                 </button>
                 {collections.map(col => (
                     <button
                        key={col.id}
                        onClick={() => setCollection(filters.collection === col.slug ? '' : col.slug)}
                        className={`flex items-center gap-3 w-full px-2 py-1.5 rounded-md transition-colors ${
                           filters.collection === col.slug 
                           ? 'bg-[#2E5C45] text-white font-medium' 
                           : 'text-gray-600 hover:bg-gray-50'
                        }`}
                     >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            filters.collection === col.slug ? 'border-white' : 'border-gray-300'
                        }`}>
                            {filters.collection === col.slug && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm">{col.name}</span>
                     </button>
                 ))}
             </div>
          )}
        </FilterSection>

        {/* Category Filter */}
        <FilterSection 
           title="Category" 
           section="category"
           isExpanded={expandedSections.category}
           onToggle={toggleSection}
         >
          {categoriesLoading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  filters.category === ''
                    ? 'bg-[#2E5C45] text-white font-medium shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${
                    filters.category === cat.slug
                      ? 'bg-[#2E5C45] text-white font-medium shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  {/* Optional: Add count if available */}
                </button>
              ))}
            </div>
          )}
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection 
           title="Price Range" 
           section="price"
           isExpanded={expandedSections.price}
           onToggle={toggleSection}
         >
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                 <input
                  type="text"
                  inputMode="numeric"
                  value={localPriceRange.min}
                  onChange={e => handlePriceChange('min', e.target.value)}
                  onBlur={() => handlePriceBlur('min')}
                  placeholder="0"
                  className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2E5C45] focus:border-[#2E5C45] outline-none transition-all"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                 <input
                  type="text"
                  inputMode="numeric"
                  value={localPriceRange.max}
                  onChange={e => handlePriceChange('max', e.target.value)}
                  onBlur={() => handlePriceBlur('max')}
                  placeholder="Max"
                  className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2E5C45] focus:border-[#2E5C45] outline-none transition-all"
                />
              </div>
            </div>
            <button
              onClick={handlePriceApply}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm hover:shadow-md"
            >
              Apply Range
            </button>
          </div>
        </FilterSection>

        {/* Size Filter */}
        <FilterSection 
           title="Size" 
           section="sizes"
           isExpanded={expandedSections.sizes}
           onToggle={toggleSection}
         >
          <div className="grid grid-cols-3 gap-2 pt-1">
            {sizeOptions.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`py-2 px-1 rounded-md text-sm font-medium border transition-all ${
                  filters.sizes.includes(size)
                    ? 'bg-[#2E5C45] text-white border-[#2E5C45] shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-[#2E5C45] hover:text-[#2E5C45]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Color Filter */}
        <FilterSection 
           title="Color" 
           section="colors"
           isExpanded={expandedSections.colors}
           onToggle={toggleSection}
         >
          <div className="space-y-1 pt-1">
            {colorOptions.map(color => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-sm transition-all group ${
                  filters.colors.includes(color.name)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border shadow-sm ${filters.colors.includes(color.name) ? 'ring-2 ring-[#2E5C45] ring-offset-1' : 'border-gray-200'}`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="group-hover:text-gray-900">{color.name}</span>
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
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