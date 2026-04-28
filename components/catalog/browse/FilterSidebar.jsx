'use client';

import { useState, useEffect, Suspense } from 'react';
import { FiChevronDown, FiX, FiSliders, FiTrash2 } from 'react-icons/fi';
import { useFilters } from '@/contexts/filter/FilterContext';

// Brand tokens — sourced from app/globals.css


const ALWAYS_OPEN = new Set(['category', 'price']);

// ── Loading skeleton ──────────────────────────────────────────
function FilterSidebarLoading() {
  return (
    <aside
      className="rounded-2xl p-5 space-y-5"
      style={{ backgroundColor: '#ffffff', border: `1px solid ${'var(--color-border)'}` }}
    >
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-3 w-20 rounded" style={{ backgroundColor: 'var(--color-background-alt)' }} />
          <div className="h-8 rounded-lg"  style={{ backgroundColor: 'var(--color-background-alt)' }} />
        </div>
      ))}
    </aside>
  );
}

// ── Flat section — no inner card, just divider + heading ──────
function FilterSection({ title, section, isExpanded, onToggle, children }) {
  const pinned = ALWAYS_OPEN.has(section);
  const open   = pinned || isExpanded;

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
      {/* Heading row */}
      <button
        type="button"
        onClick={() => !pinned && onToggle(section)}
        className="flex items-center justify-between w-full py-3"
        style={{ cursor: pinned ? 'default' : 'pointer' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-[3px] h-4 rounded-full flex-shrink-0 transition-colors"
            style={{ backgroundColor: open ? THEME.colors.gold : 'transparent' }}
          />
          <span
            className="text-[11px] font-black uppercase tracking-[0.14em] transition-colors"
            style={{ color: open ? THEME.colors.primary : 'var(--color-text)' }}
          >
            {title}
          </span>
        </div>
        {!pinned && (
          <FiChevronDown
            className="w-3.5 h-3.5 transition-transform duration-300 flex-shrink-0"
            style={{
              color:     open ? THEME.colors.primary : 'var(--color-text-light)',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        )}
      </button>

      {/* Collapsible body */}
      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 pb-4">{children}</div>
      </div>
    </div>
  );
}

// ── Radio item ────────────────────────────────────────────────
function RadioItem({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-sm transition-all text-left"
      style={{
        backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
        color:           isActive ? THEME.colors.primary   : 'var(--color-text-light)',
        fontWeight:      isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span
        className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          borderColor:     isActive ? THEME.colors.primary : 'var(--color-border)',
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
        padding:         depth === 0 ? '7px 8px' : '6px 8px 6px 16px',
        backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
        color:           isActive ? THEME.colors.primary : depth === 0 ? 'var(--color-text)' : 'var(--color-text-light)',
        fontWeight:      depth === 0 ? 700 : isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {depth > 0 && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: isActive ? THEME.colors.primary : 'var(--color-border)' }} />
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
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
      style={{
        backgroundColor: 'var(--color-primary-soft)',
        color:           THEME.colors.primary,
        border:          `1px solid ${'rgba(46,100,23,0.18)'}`,
      }}
    >
      <span className="truncate">{label}</span>
      <FiX className="h-3 w-3 flex-shrink-0" />
    </button>
  );
}

function AppliedFiltersSummary({
  filters, categories, collections, activeFilterCount, hasActiveFilters,
  setSearch, setCategory, setCollection, setPriceRange, toggleSize, toggleColor,
}) {
  if (!hasActiveFilters) return null;

  const categoryName   = categories.find(c => c.slug === filters.category)?.name   || filters.category;
  const collectionName = collections.find(c => c.slug === filters.collection)?.name || filters.collection;
  const priceLabel     = [
    filters.minPrice != null ? `From ₦${filters.minPrice.toLocaleString()}` : null,
    filters.maxPrice != null ? `To ₦${filters.maxPrice.toLocaleString()}`   : null,
  ].filter(Boolean).join(' ');

  return (
    <div className="shrink-0 px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: THEME.colors.pageBg }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: THEME.colors.mutedText }}>Applied</p>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
          style={{ backgroundColor: 'var(--color-primary-soft)', color: THEME.colors.primary }}>
          {activeFilterCount}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {filters.search     && <FilterPill label={`Search: ${filters.search}`}       onRemove={() => setSearch('')} />}
        {filters.category   && <FilterPill label={`Category: ${categoryName}`}       onRemove={() => setCategory('')} />}
        {filters.collection && <FilterPill label={`Collection: ${collectionName}`}   onRemove={() => setCollection('')} />}
        {(filters.minPrice != null || filters.maxPrice != null) && (
          <FilterPill label={`Price: ${priceLabel}`} onRemove={() => setPriceRange(null, null)} />
        )}
        {filters.sizes.map(s  => <FilterPill key={s} label={`Size: ${s}`}   onRemove={() => toggleSize(s)} />)}
        {filters.colors.map(c => <FilterPill key={c} label={`Color: ${c}`}  onRemove={() => toggleColor(c)} />)}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
function FilterSidebarContent({ onMobileClose }) {
  const {
    filters, categories, hierarchicalCategories, collections,
    categoriesLoading, setSearch, setCategory, setCollection,
    setPriceRange, toggleSize, toggleColor, clearAllFilters,
    hasActiveFilters, activeFilterCount,
  } = useFilters();

  const [expandedSections, setExpandedSections] = useState({
    collection: true, category: true, price: true, sizes: false, colors: false,
  });

  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.minPrice ? filters.minPrice.toLocaleString() : '',
    max: filters.maxPrice ? filters.maxPrice.toLocaleString() : '',
  });

  useEffect(() => {
    setLocalPriceRange({
      min: filters.minPrice ? filters.minPrice.toLocaleString() : '',
      max: filters.maxPrice ? filters.maxPrice.toLocaleString() : '',
    });
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => { if (filters.sizes?.length  > 0) setExpandedSections(p => ({ ...p, sizes:  true })); }, [filters.sizes?.length]);
  useEffect(() => { if (filters.colors?.length > 0) setExpandedSections(p => ({ ...p, colors: true })); }, [filters.colors?.length]);

  const sizeOptions  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = [
    { name: 'Black',  hex: '#000000' }, { name: 'White',  hex: '#FFFFFF' },
    { name: 'Red',    hex: '#EF4444' }, { name: 'Blue',   hex: '#3B82F6' },
    { name: 'Green',  hex: '#22C55E' }, { name: 'Yellow', hex: '#FBBF24' },
    { name: 'Gray',   hex: '#9CA3AF' }, { name: 'Brown',  hex: '#8B4513' },
    { name: 'Pink',   hex: '#FF69B4' },
  ];

  const selectedCategoryPath = findCategoryPath(hierarchicalCategories, filters.category) || [];
  const activeDepartment     = selectedCategoryPath[0] || null;
  const fallbackCategoryList = categories.filter(cat => !cat.parent_id);

  const toggleSection = (section) => {
    if (ALWAYS_OPEN.has(section)) return;
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (field, value) =>
    setLocalPriceRange(prev => ({ ...prev, [field]: value.replace(/[^0-9,]/g, '') }));

  const handlePriceBlur = (field) => {
    const val = localPriceRange[field].replace(/,/g, '');
    if (val && !isNaN(val))
      setLocalPriceRange(prev => ({ ...prev, [field]: Number(val).toLocaleString() }));
  };

  const handlePriceApply = () => {
    const min = localPriceRange.min ? parseFloat(localPriceRange.min.replace(/,/g, '')) : 0;
    const max = localPriceRange.max ? parseFloat(localPriceRange.max.replace(/,/g, '')) : 10000;
    setPriceRange(min, max);
  };

  return (
    <aside
      className="h-full rounded-2xl flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#ffffff',
        border:          `1px solid ${'var(--color-border)'}`,
        boxShadow:       THEME.shadows.sidebar,
        minWidth:        260,
        width:           '100%',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${'var(--color-border)'}` }}
      >
        <div className="flex items-center gap-2">
          <FiSliders className="w-3.5 h-3.5" style={{ color: THEME.colors.primary }} />
          <h2 className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: 'var(--color-text)' }}>
            Filters
          </h2>
          {hasActiveFilters && (
            <span
              className="text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: THEME.colors.gold, color: '#ffffff' }}
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
              style={{ backgroundColor: 'var(--color-background-alt)', color: 'var(--color-text-light)', border: `1px solid ${'var(--color-border)'}` }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFE4E6'; e.currentTarget.style.color = '#C0392B'; e.currentTarget.style.borderColor = '#FECDD3'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'; e.currentTarget.style.color = 'var(--color-text-light)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <FiTrash2 className="w-3 h-3" /> Clear all
            </button>
          )}
          {onMobileClose && (
            <button type="button" onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--color-background-alt)', color: 'var(--color-text-light)' }}>
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Applied filters */}
      <AppliedFiltersSummary
        filters={filters} categories={categories} collections={collections}
        activeFilterCount={activeFilterCount} hasActiveFilters={hasActiveFilters}
        setSearch={setSearch} setCategory={setCategory} setCollection={setCollection}
        setPriceRange={setPriceRange} toggleSize={toggleSize} toggleColor={toggleColor}
      />

      {/* ── Scrollable sections ── */}
      <div className="flex-1 overflow-y-auto px-5 py-2">

        {/* Collections */}
        <FilterSection title="Collections" section="collection" isExpanded={expandedSections.collection} onToggle={toggleSection}>
          {categoriesLoading
            ? <div className="text-xs py-1" style={{ color: THEME.colors.mutedText }}>Loading...</div>
            : <div className="space-y-0.5">
                <RadioItem label="All Collections" isActive={filters.collection === ''} onClick={() => setCollection('')} />
                {collections.map(col => (
                  <RadioItem key={col.id} label={col.name}
                    isActive={filters.collection === col.slug}
                    onClick={() => setCollection(filters.collection === col.slug ? '' : col.slug)}
                  />
                ))}
              </div>
          }
        </FilterSection>

        {/* Categories */}
        <FilterSection title="Categories" section="category" isExpanded={expandedSections.category} onToggle={toggleSection}>
          {categoriesLoading
            ? <div className="text-xs py-1" style={{ color: THEME.colors.mutedText }}>Loading...</div>
            : <div className="space-y-2">
                <RadioItem label="All Categories" isActive={filters.category === ''} onClick={() => setCategory('')} />
                <div className="space-y-0.5">
                  <p className="px-1 pt-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: THEME.colors.mutedText }}>
                    Departments
                  </p>
                  {(hierarchicalCategories.length ? hierarchicalCategories : fallbackCategoryList).map(cat => (
                    <RadioItem key={cat.id} label={cat.name}
                      isActive={filters.category === cat.slug || activeDepartment?.slug === cat.slug}
                      onClick={() => setCategory(filters.category === cat.slug ? '' : cat.slug)}
                    />
                  ))}
                </div>
                {activeDepartment?.children?.length > 0 && (
                  <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="px-1 pt-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: THEME.colors.mutedText }}>
                      Refine {activeDepartment.name}
                    </p>
                    {activeDepartment.children.map(group => (
                      <div key={group.id} className="space-y-0.5">
                        <CategoryTreeItem category={group} activeSlug={filters.category} onSelect={setCategory} />
                        {group.children?.map(child => (
                          <CategoryTreeItem key={child.id} category={child} depth={1} activeSlug={filters.category} onSelect={setCategory} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
          }
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price Range (₦)" section="price" isExpanded={expandedSections.price} onToggle={toggleSection}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {['min', 'max'].map((field, i) => (
                <div key={field} className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-light)' }}>₦</span>
                  <input
                    type="text" inputMode="numeric"
                    value={localPriceRange[field]}
                    onChange={e => handlePriceChange(field, e.target.value)}
                    onBlur={() => handlePriceBlur(field)}
                    placeholder={field === 'min' ? 'Min' : 'Max'}
                    className="w-full pl-6 pr-2 py-2 rounded-lg text-xs border outline-none transition-all"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: THEME.colors.pageBg }}
                    onFocus={(e) => (e.target.style.borderColor = THEME.colors.primary)}
                  />
                </div>
              ))}
            </div>
            <button
              type="button" onClick={handlePriceApply}
              className="w-full py-2.5 rounded-xl text-xs font-black transition-colors"
              style={{ backgroundColor: THEME.colors.primary, color: '#ffffff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.colors.primary)}
            >
              Apply Range
            </button>
          </div>
        </FilterSection>

        {/* Size */}
        <FilterSection title="Size" section="sizes" isExpanded={expandedSections.sizes} onToggle={toggleSection}>
          <div className="grid grid-cols-3 gap-1.5">
            {sizeOptions.map(size => {
              const isActive = filters.sizes.includes(size);
              return (
                <button key={size} type="button" onClick={() => toggleSize(size)}
                  className="py-2 rounded-lg text-xs font-bold border transition-all"
                  style={{
                    borderColor:     isActive ? THEME.colors.primary : 'var(--color-border)',
                    backgroundColor: isActive ? THEME.colors.primary : 'transparent',
                    color:           isActive ? '#ffffff'   : 'var(--color-text-light)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = THEME.colors.primary; e.currentTarget.style.color = THEME.colors.primary; }}}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--color-border)';  e.currentTarget.style.color = 'var(--color-text-light)'; }}}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Color */}
        <FilterSection title="Color" section="colors" isExpanded={expandedSections.colors} onToggle={toggleSection}>
          <div className="grid grid-cols-3 gap-2">
            {colorOptions.map(color => {
              const isActive = filters.colors.includes(color.name);
              return (
                <button key={color.name} type="button" onClick={() => toggleColor(color.name)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                    outline:         isActive ? `1px solid ${THEME.colors.primary}` : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className="w-6 h-6 rounded-full border shadow-sm"
                    style={{ backgroundColor: color.hex, borderColor: color.hex === '#FFFFFF' ? 'var(--color-border)' : 'transparent' }} />
                  <span className="text-[10px] font-medium truncate w-full text-center"
                    style={{ color: isActive ? THEME.colors.primary : 'var(--color-text-light)' }}>
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