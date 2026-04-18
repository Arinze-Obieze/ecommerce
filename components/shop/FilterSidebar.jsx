'use client';

import { useState, useEffect, Suspense } from 'react';
import { FiChevronDown, FiX, FiSliders, FiTrash2 } from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';

// ============================================================
// 🎨 THEME — ZOVA brand colors
// ============================================================
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
    saleRed: '#E53935',
    trendingOrange: '#EA580C',
    starYellow: '#F59E0B',
    whatsappGreen: '#25D366',
  },
  shadows: {
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.08)',
    sidebar: '0 2px 12px rgba(10, 61, 46, 0.07)',
  },
  transitions: {
    default: 'all 0.2s ease',
  }
};

const ALWAYS_OPEN = new Set(['category', 'price']);

// ── Loading skeleton ──────────────────────────────────────────
function FilterSidebarLoading() {
  return (
    <aside
      className="rounded-2xl border p-5 space-y-4"
      style={{ backgroundColor: THEME.colors.white, borderColor: THEME.colors.border }}
    >
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 w-24 rounded" style={{ backgroundColor: THEME.colors.softGray }} />
          <div className="h-8 rounded-lg" style={{ backgroundColor: THEME.colors.softGray }} />
        </div>
      ))}
    </aside>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function FilterSection({ title, section, isExpanded, onToggle, children }) {
  const pinned = ALWAYS_OPEN.has(section);
  const open = pinned || isExpanded;

  return (
    <div
      className="rounded-xl overflow-hidden border transition-all duration-200"
      style={{
        borderColor: open ? `${THEME.colors.primary}30` : THEME.colors.border,
        backgroundColor: THEME.colors.white,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => !pinned && onToggle(section)}
        className="flex items-center justify-between w-full px-4 py-3 group"
        style={{ cursor: pinned ? 'default' : 'pointer' }}
      >
        <div className="flex items-center gap-2">
          {open && (
            <span
              className="w-[3px] h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: THEME.colors.primary }}
            />
          )}
          <span
            className="text-xs font-black uppercase tracking-[0.14em] transition-colors"
            style={{ color: open ? THEME.colors.primary : THEME.colors.darkCharcoal }}
          >
            {title}
          </span>
        </div>
        {!pinned && (
          <FiChevronDown
            className="w-4 h-4 transition-transform duration-300 flex-shrink-0"
            style={{
              color: open ? THEME.colors.primary : THEME.colors.mediumGray,
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        )}
      </button>

      {/* Body */}
      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="w-full h-px" style={{ backgroundColor: THEME.colors.border }} />
          <div className="px-4 py-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Radio-style list item — used for collections & categories ─
function RadioItem({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm transition-all text-left"
      style={{
        backgroundColor: isActive ? THEME.colors.greenTint : 'transparent',
        color: isActive ? THEME.colors.primary : THEME.colors.mediumGray,
        fontWeight: isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => { 
        if (!isActive) e.currentTarget.style.backgroundColor = THEME.colors.softGray; 
      }}
      onMouseLeave={(e) => { 
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; 
      }}
    >
      {/* Radio dot */}
      <span
        className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          borderColor: isActive ? THEME.colors.primary : THEME.colors.border,
          backgroundColor: isActive ? THEME.colors.primary : 'transparent',
        }}
      >
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function findCategoryPath(categories, slug, path = []) {
  for (const category of categories || []) {
    const nextPath = [...path, category];
    if (category.slug === slug) return nextPath;

    const childPath = findCategoryPath(category.children, slug, nextPath);
    if (childPath) return childPath;
  }

  return null;
}

function CategoryTreeItem({ category, depth = 0, activeSlug, onSelect }) {
  const isActive = activeSlug === category.slug;

  return (
    <button
      type="button"
      onClick={() => onSelect(isActive ? '' : category.slug)}
      className="flex items-center gap-2 w-full rounded-lg text-sm transition-all text-left"
      style={{
        padding: depth === 0 ? '8px 10px' : '7px 10px 7px 18px',
        backgroundColor: isActive ? THEME.colors.greenTint : 'transparent',
        color: isActive ? THEME.colors.primary : depth === 0 ? THEME.colors.darkCharcoal : THEME.colors.mediumGray,
        fontWeight: depth === 0 ? 700 : isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = THEME.colors.softGray;
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {depth > 0 && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: isActive ? THEME.colors.primary : THEME.colors.border }}
        />
      )}
      <span className="truncate">{category.name}</span>
    </button>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-[11px] font-semibold transition-colors"
      style={{
        backgroundColor: THEME.colors.greenTint,
        color: THEME.colors.deepEmerald,
        border: `1px solid ${THEME.colors.greenBorder}`,
      }}
    >
      <span className="truncate">{label}</span>
      <FiX className="h-3 w-3 flex-shrink-0" />
    </button>
  );
}

function AppliedFiltersSummary({
  filters,
  categories,
  collections,
  activeFilterCount,
  hasActiveFilters,
  setSearch,
  setCategory,
  setCollection,
  setPriceRange,
  toggleSize,
  toggleColor,
}) {
  if (!hasActiveFilters) return null;

  const categoryName = categories.find(cat => cat.slug === filters.category)?.name || filters.category;
  const collectionName = collections.find(col => col.slug === filters.collection)?.name || filters.collection;
  const priceLabel = [
    filters.minPrice != null ? `From ₦${filters.minPrice.toLocaleString()}` : null,
    filters.maxPrice != null ? `To ₦${filters.maxPrice.toLocaleString()}` : null,
  ].filter(Boolean).join(' ');

  return (
    <div className="shrink-0 border-b px-3 py-3" style={{ borderColor: THEME.colors.border }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p
          className="text-[10px] font-black uppercase tracking-[0.16em]"
          style={{ color: THEME.colors.mutedText }}
        >
          Applied
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-black"
          style={{ backgroundColor: THEME.colors.greenTint, color: THEME.colors.primary }}
        >
          {activeFilterCount}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.search && (
          <FilterPill label={`Search: ${filters.search}`} onRemove={() => setSearch('')} />
        )}
        {filters.category && (
          <FilterPill label={`Category: ${categoryName}`} onRemove={() => setCategory('')} />
        )}
        {filters.collection && (
          <FilterPill label={`Collection: ${collectionName}`} onRemove={() => setCollection('')} />
        )}
        {(filters.minPrice != null || filters.maxPrice != null) && (
          <FilterPill label={`Price: ${priceLabel}`} onRemove={() => setPriceRange(null, null)} />
        )}
        {filters.sizes.map(size => (
          <FilterPill key={size} label={`Size: ${size}`} onRemove={() => toggleSize(size)} />
        ))}
        {filters.colors.map(color => (
          <FilterPill key={color} label={`Color: ${color}`} onRemove={() => toggleColor(color)} />
        ))}
      </div>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────
function FilterSidebarContent({ onMobileClose }) {
  const {
    filters,
    categories,
    hierarchicalCategories,
    collections,
    categoriesLoading,
    setSearch,
    setCategory,
    setCollection,
    setPriceRange,
    toggleSize,
    toggleColor,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters();

  // ── State ──────────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState({
    collection: false,
    category:   true,
    price:      true,
    sizes:      false,
    colors:     false,
  });

  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.minPrice ? filters.minPrice.toLocaleString() : '',
    max: filters.maxPrice ? filters.maxPrice.toLocaleString() : '',
  });

  // Sync price inputs when clearAllFilters resets context
  useEffect(() => {
    setLocalPriceRange({
      min: filters.minPrice ? filters.minPrice.toLocaleString() : '',
      max: filters.maxPrice ? filters.maxPrice.toLocaleString() : '',
    });
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (filters.sizes?.length > 0) setExpandedSections(p => ({ ...p, sizes: true }));
  }, [filters.sizes?.length]);

  useEffect(() => {
    if (filters.colors?.length > 0) setExpandedSections(p => ({ ...p, colors: true }));
  }, [filters.colors?.length]);

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = [
    { name: 'Black',  hex: '#000000' },
    { name: 'White',  hex: '#FFFFFF' },
    { name: 'Red',    hex: '#EF4444' },
    { name: 'Blue',   hex: '#3B82F6' },
    { name: 'Green',  hex: '#22C55E' },
    { name: 'Yellow', hex: '#FBBF24' },
    { name: 'Gray',   hex: '#9CA3AF' },
    { name: 'Brown',  hex: '#8B4513' },
    { name: 'Pink',   hex: '#FF69B4' },
  ];

  const selectedCategoryPath = findCategoryPath(hierarchicalCategories, filters.category) || [];
  const activeDepartment = selectedCategoryPath[0] || null;
  const fallbackCategoryList = categories.filter(cat => !cat.parent_id);

  // ── Handlers ───────────────────────────────────────────────
  const toggleSection = (section) => {
    if (ALWAYS_OPEN.has(section)) return;
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (field, value) => {
    setLocalPriceRange(prev => ({ ...prev, [field]: value.replace(/[^0-9,]/g, '') }));
  };

  const handlePriceBlur = (field) => {
    const val = localPriceRange[field].replace(/,/g, '');
    if (val && !isNaN(val)) {
      setLocalPriceRange(prev => ({ ...prev, [field]: Number(val).toLocaleString() }));
    }
  };

  const handlePriceApply = () => {
    const min = localPriceRange.min ? parseFloat(localPriceRange.min.replace(/,/g, '')) : 0;
    const max = localPriceRange.max ? parseFloat(localPriceRange.max.replace(/,/g, '')) : 10000;
    setPriceRange(min, max);
  };

  return (
    <aside
      className="h-full rounded-2xl border overflow-hidden flex flex-col"
      style={{ 
        backgroundColor: THEME.colors.white, 
        borderColor: THEME.colors.border, 
        boxShadow: THEME.shadows.sidebar 
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: THEME.colors.border }}
      >
        <div className="flex items-center gap-2">
          <FiSliders className="w-3.5 h-3.5" style={{ color: THEME.colors.primary }} />
          <h2 className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: THEME.colors.darkCharcoal }}>
            Filters
          </h2>
          {hasActiveFilters && (
            <span
              className="text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: THEME.colors.primary, color: THEME.colors.white }}
            >
              ✓
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ 
                backgroundColor: THEME.colors.softGray, 
                color: THEME.colors.mediumGray, 
                border: `1px solid ${THEME.colors.border}` 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFE4E6';
                e.currentTarget.style.color = THEME.colors.saleRed;
                e.currentTarget.style.borderColor = '#FECDD3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = THEME.colors.softGray;
                e.currentTarget.style.color = THEME.colors.mediumGray;
                e.currentTarget.style.borderColor = THEME.colors.border;
              }}
            >
              <FiTrash2 className="w-3 h-3" /> Clear all
            </button>
          )}
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg"
              style={{ backgroundColor: THEME.colors.softGray, color: THEME.colors.mediumGray }}
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AppliedFiltersSummary
        filters={filters}
        categories={categories}
        collections={collections}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        setSearch={setSearch}
        setCategory={setCategory}
        setCollection={setCollection}
        setPriceRange={setPriceRange}
        toggleSize={toggleSize}
        toggleColor={toggleColor}
      />

      {/* ── Sections ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {/* Collections — pinned, scrollable */}
        <FilterSection
          title="Collections"
          section="collection"
          isExpanded={expandedSections.collection}
          onToggle={toggleSection}
        >
          {categoriesLoading ? (
            <div className="text-xs py-1" style={{ color: THEME.colors.mutedText }}>Loading...</div>
          ) : (
            <div
              className="space-y-0.5 pr-0.5"
            >
              <RadioItem
                label="All Collections"
                isActive={filters.collection === ''}
                onClick={() => setCollection('')}
              />
              {collections.map(col => (
                <RadioItem
                  key={col.id}
                  label={col.name}
                  isActive={filters.collection === col.slug}
                  onClick={() => setCollection(filters.collection === col.slug ? '' : col.slug)}
                />
              ))}
            </div>
          )}
        </FilterSection>

        {/* Category — pinned, scrollable */}
        <FilterSection
          title="Categories"
          section="category"
          isExpanded={expandedSections.category}
          onToggle={toggleSection}
        >
          {categoriesLoading ? (
            <div className="text-xs py-1" style={{ color: THEME.colors.mutedText }}>Loading...</div>
          ) : (
            <div
              className="space-y-3 pr-0.5"
            >
              <RadioItem
                label="All Categories"
                isActive={filters.category === ''}
                onClick={() => setCategory('')}
              />

              <div className="space-y-1">
                <p
                  className="px-1 text-[10px] font-black uppercase tracking-[0.16em]"
                  style={{ color: THEME.colors.mutedText }}
                >
                  Departments
                </p>
                {(hierarchicalCategories.length ? hierarchicalCategories : fallbackCategoryList).map(cat => (
                  <RadioItem
                    key={cat.id}
                    label={cat.name}
                    isActive={filters.category === cat.slug || activeDepartment?.slug === cat.slug}
                    onClick={() => setCategory(filters.category === cat.slug ? '' : cat.slug)}
                  />
                ))}
              </div>

              {activeDepartment?.children?.length > 0 && (
                <div className="space-y-2">
                  <div
                    className="h-px"
                    style={{ backgroundColor: THEME.colors.border }}
                  />
                  <p
                    className="px-1 text-[10px] font-black uppercase tracking-[0.16em]"
                    style={{ color: THEME.colors.mutedText }}
                  >
                    Refine {activeDepartment.name}
                  </p>
                  <div className="space-y-1">
                    {activeDepartment.children.map(group => (
                      <div key={group.id} className="space-y-0.5">
                        <CategoryTreeItem
                          category={group}
                          activeSlug={filters.category}
                          onSelect={setCategory}
                        />
                        {group.children?.map(child => (
                          <CategoryTreeItem
                            key={child.id}
                            category={child}
                            depth={1}
                            activeSlug={filters.category}
                            onSelect={setCategory}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </FilterSection>

        {/* Price Range — pinned */}
        <FilterSection
          title="Price Range (₦)"
          section="price"
          isExpanded={expandedSections.price}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: THEME.colors.mediumGray }}>₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={localPriceRange.min}
                  onChange={e => handlePriceChange('min', e.target.value)}
                  onBlur={() => handlePriceBlur('min')}
                  placeholder="Min"
                  className="w-full pl-6 pr-2 py-2 rounded-lg text-xs border outline-none transition-all"
                  style={{ borderColor: THEME.colors.border, color: THEME.colors.darkCharcoal }}
                  onFocus={(e) => (e.target.style.borderColor = THEME.colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = THEME.colors.border)}
                />
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: THEME.colors.mediumGray }}>–</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: THEME.colors.mediumGray }}>₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={localPriceRange.max}
                  onChange={e => handlePriceChange('max', e.target.value)}
                  onBlur={() => handlePriceBlur('max')}
                  placeholder="Max"
                  className="w-full pl-6 pr-2 py-2 rounded-lg text-xs border outline-none transition-all"
                  style={{ borderColor: THEME.colors.border, color: THEME.colors.darkCharcoal }}
                  onFocus={(e) => (e.target.style.borderColor = THEME.colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = THEME.colors.border)}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handlePriceApply}
              className="w-full py-2.5 rounded-xl text-xs font-black transition-colors"
              style={{ backgroundColor: THEME.colors.deepEmerald, color: THEME.colors.white }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.colors.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.colors.deepEmerald)}
            >
              Apply Range
            </button>
          </div>
        </FilterSection>

        {/* Size — collapsible */}
        <FilterSection
          title="Size"
          section="sizes"
          isExpanded={expandedSections.sizes}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-3 gap-1.5">
            {sizeOptions.map(size => {
              const isActive = filters.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className="py-2 rounded-lg text-xs font-bold border transition-all"
                  style={{
                    borderColor: isActive ? THEME.colors.primary : THEME.colors.border,
                    backgroundColor: isActive ? THEME.colors.primary : 'transparent',
                    color: isActive ? THEME.colors.white : THEME.colors.mediumGray,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = THEME.colors.primary;
                      e.currentTarget.style.color = THEME.colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = THEME.colors.border;
                      e.currentTarget.style.color = THEME.colors.mediumGray;
                    }
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Color — collapsible with 3 per row */}
        <FilterSection
          title="Color"
          section="colors"
          isExpanded={expandedSections.colors}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-3 gap-2">
            {colorOptions.map(color => {
              const isActive = filters.colors.includes(color.name);
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => toggleColor(color.name)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? THEME.colors.greenTint : 'transparent',
                    outline: isActive ? `1px solid ${THEME.colors.primary}` : 'none',
                  }}
                  onMouseEnter={(e) => { 
                    if (!isActive) e.currentTarget.style.backgroundColor = THEME.colors.softGray; 
                  }}
                  onMouseLeave={(e) => { 
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; 
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full border shadow-sm"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: color.hex === '#FFFFFF' ? THEME.colors.border : 'transparent',
                    }}
                  />
                  <span 
                    className="text-[10px] font-medium truncate w-full text-center"
                    style={{ color: isActive ? THEME.colors.primary : THEME.colors.mediumGray }}
                  >
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>

      </div>
    </aside>
  );
}

export default function FilterSidebar({ onMobileClose }) {
  return (
    <Suspense fallback={<FilterSidebarLoading />}>
      <FilterSidebarContent onMobileClose={onMobileClose} />
    </Suspense>
  );
}
