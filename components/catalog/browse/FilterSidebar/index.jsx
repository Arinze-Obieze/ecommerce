'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { FiSliders, FiTrash2, FiX } from 'react-icons/fi';
import { useFilters } from '@/contexts/filter/FilterContext';
import { COLOR_OPTIONS, SIZE_OPTIONS } from '@/constants/filter-options';
import CategoryChip from './CategoryChip';
import ColorSwatchButton from './ColorSwatchButton';
import FilterSection from './FilterSection';
import PriceBucketButton from './PriceBucketButton';
import SizeChip from './SizeChip';
import { findCategoryPath, handleArrowKeyNavigation, parsePriceInput } from './filterSidebar.utils';

function FilterSidebarLoading() {
  return (
    <aside className="space-y-5 rounded-2xl border border-border bg-white p-5">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="animate-pulse space-y-2">
          <div className="h-3 w-20 rounded bg-(--color-background-alt)" />
          <div className="h-8 rounded-lg bg-(--color-background-alt)" />
        </div>
      ))}
    </aside>
  );
}

function CategoryTreeItem({ category, depth = 0, activeSlug, onSelect }) {
  const isActive = activeSlug === category.slug;

  return (
    <button
      type="button"
      onClick={() => onSelect(isActive ? '' : category.slug)}
      onKeyDown={handleArrowKeyNavigation}
      data-nav-item="true"
      className={[
        'flex w-full items-center gap-2 rounded-lg text-left text-sm transition-colors',
        depth === 0 ? 'px-2 py-[7px] font-bold' : 'py-1.5 pl-4 pr-2',
        isActive
          ? 'bg-(--zova-green-soft) text-(--zova-primary-action)'
          : depth === 0
          ? 'text-(--zova-ink) hover:bg-(--zova-linen)'
          : 'text-(--zova-text-muted) hover:bg-(--zova-linen)',
        isActive && depth > 0 ? 'font-semibold' : '',
      ].filter(Boolean).join(' ')}
    >
      {depth > 0 ? (
        <span
          className={[
            'h-1.5 w-1.5 shrink-0 rounded-full',
            isActive ? 'bg-(--zova-primary-action)' : 'bg-(--zova-border)',
          ].join(' ')}
        />
      ) : null}
      <span className="truncate">{category.name}</span>
    </button>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-green-200/70 bg-(--zova-green-soft) px-2.5 py-1.5 text-[11px] font-semibold text-(--zova-primary-action) transition-colors"
    >
      <span className="truncate">{label}</span>
      <FiX className="h-3 w-3 shrink-0" />
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
  const categoryName = useMemo(
    () => categories.find((category) => category.slug === filters.category)?.name || filters.category,
    [categories, filters.category]
  );
  const collectionName = useMemo(
    () => collections.find((collection) => collection.slug === filters.collection)?.name || filters.collection,
    [collections, filters.collection]
  );
  const priceLabel = useMemo(
    () => [
      filters.minPrice != null ? `From ₦${filters.minPrice.toLocaleString()}` : null,
      filters.maxPrice != null ? `To ₦${filters.maxPrice.toLocaleString()}` : null,
    ].filter(Boolean).join(' '),
    [filters.maxPrice, filters.minPrice]
  );

  if (!hasActiveFilters) return null;

  return (
    <div className="shrink-0 border-b border-(--zova-border) bg-(--zova-linen) px-5 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-(--zova-text-muted)">
          Applied
        </p>
        <span className="rounded-full bg-(--zova-green-soft) px-2 py-0.5 text-[10px] font-black text-(--zova-primary-action)">
          {activeFilterCount}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {filters.search ? <FilterPill label={`Search: ${filters.search}`} onRemove={() => setSearch('')} /> : null}
        {filters.category ? <FilterPill label={`Category: ${categoryName}`} onRemove={() => setCategory('')} /> : null}
        {filters.collection ? <FilterPill label={`Collection: ${collectionName}`} onRemove={() => setCollection('')} /> : null}
        {filters.minPrice != null || filters.maxPrice != null ? (
          <FilterPill label={`Price: ${priceLabel}`} onRemove={() => setPriceRange(null, null)} />
        ) : null}
        {filters.sizes.map((size) => <FilterPill key={size} label={`Size: ${size}`} onRemove={() => toggleSize(size)} />)}
        {filters.colors.map((color) => <FilterPill key={color} label={`Color: ${color}`} onRemove={() => toggleColor(color)} />)}
      </div>
    </div>
  );
}

function FilterSidebarContent({ onMobileClose }) {
  const {
    filters,
    categories,
    hierarchicalCategories,
    collections,
    availableFilters,
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
    isApplyingFilters,
  } = useFilters();

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    sizes: true,
    colors: true,
  });
  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.minPrice ? filters.minPrice.toLocaleString() : '',
    max: filters.maxPrice ? filters.maxPrice.toLocaleString() : '',
  });
  const [draftCategory, setDraftCategory] = useState(filters.category || '');

  useEffect(() => {
    setLocalPriceRange({
      min: filters.minPrice ? filters.minPrice.toLocaleString() : '',
      max: filters.maxPrice ? filters.maxPrice.toLocaleString() : '',
    });
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    setDraftCategory(filters.category || '');
  }, [filters.category]);

  useEffect(() => {
    if (filters.sizes?.length > 0) setExpandedSections((previous) => ({ ...previous, sizes: true }));
  }, [filters.sizes?.length]);

  useEffect(() => {
    if (filters.colors?.length > 0) setExpandedSections((previous) => ({ ...previous, colors: true }));
  }, [filters.colors?.length]);

  const selectedCategoryPath = useMemo(
    () => findCategoryPath(hierarchicalCategories, draftCategory) || [],
    [draftCategory, hierarchicalCategories]
  );
  const activeDepartment = useMemo(() => selectedCategoryPath[0] || null, [selectedCategoryPath]);
  const fallbackCategoryList = useMemo(() => categories.filter((category) => !category.parent_id), [categories]);
  const departmentOptions = useMemo(
    () => (hierarchicalCategories.length ? hierarchicalCategories : fallbackCategoryList),
    [fallbackCategoryList, hierarchicalCategories]
  );
  const sizeCounts = availableFilters?.sizeCounts || {};
  const colorCounts = availableFilters?.colorCounts || {};
  const priceBuckets = useMemo(
    () => [
      { label: 'Under ₦5,000', min: null, max: 5000 },
      { label: '₦5,000 - ₦15,000', min: 5000, max: 15000 },
      { label: '₦15,000 - ₦30,000', min: 15000, max: 30000 },
      { label: '₦30,000+', min: 30000, max: null },
    ],
    []
  );

  const toggleSection = (section) => {
    setExpandedSections((previous) => ({ ...previous, [section]: !previous[section] }));
  };

  const handlePriceChange = (field, value) => {
    setLocalPriceRange((previous) => ({ ...previous, [field]: value.replace(/[^0-9,]/g, '') }));
  };

  const handlePriceBlur = (field) => {
    const value = localPriceRange[field].replace(/,/g, '');
    if (value && !Number.isNaN(Number(value))) {
      setLocalPriceRange((previous) => ({ ...previous, [field]: Number(value).toLocaleString() }));
    }
  };

  const handlePriceApply = () => {
    setPriceRange(parsePriceInput(localPriceRange.min), parsePriceInput(localPriceRange.max));
  };

  const handlePriceBucketSelect = (bucket) => {
    setLocalPriceRange({
      min: bucket.min != null ? bucket.min.toLocaleString() : '',
      max: bucket.max != null ? bucket.max.toLocaleString() : '',
    });
  };

  const handleCategoryApply = () => {
    setCategory(draftCategory);
  };

  const isBucketActive = (bucket) => (
    parsePriceInput(localPriceRange.min) === bucket.min &&
    parsePriceInput(localPriceRange.max) === bucket.max
  );

  const hasPendingCategoryChange = draftCategory !== (filters.category || '');
  const hasPendingPriceChange = (
    parsePriceInput(localPriceRange.min) !== filters.minPrice ||
    parsePriceInput(localPriceRange.max) !== filters.maxPrice
  );

  const canApplyCategory = hasPendingCategoryChange && !isApplyingFilters;
  const canApplyPrice = hasPendingPriceChange && !isApplyingFilters;

  return (
    <aside
      className="flex h-full w-full min-w-[260px] flex-col overflow-hidden rounded-2xl border border-(--zova-border) bg-white"
      style={{ boxShadow: '0 18px 45px rgba(25, 27, 25, 0.08)' }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-(--zova-border) px-5 py-4">
        <div className="flex items-center gap-2">
          <FiSliders className="h-3.5 w-3.5 text-(--zova-primary-action)" />
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-(--zova-ink)">
            Filters
          </h2>
          {isApplyingFilters ? (
            <span className="rounded-full bg-(--zova-green-soft) px-2 py-0.5 text-[9px] font-black text-(--zova-primary-action)">
              Applying...
            </span>
          ) : null}
          {hasActiveFilters ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-(--zova-accent-emphasis) text-[9px] font-black text-white">
              ✓
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 rounded-lg border border-(--zova-border) bg-(--zova-linen) px-2.5 py-1.5 text-xs font-semibold text-(--zova-text-muted) transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <FiTrash2 className="h-3 w-3" /> Clear all
            </button>
          ) : null}
          {onMobileClose ? (
            <button
              type="button"
              onClick={onMobileClose}
              className="rounded-lg bg-(--zova-linen) p-1.5 text-(--zova-text-muted) lg:hidden"
              aria-label="Close filters"
            >
              <FiX className="h-4 w-4" />
            </button>
          ) : null}
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

      <div className="flex-1 overflow-y-auto px-5 py-2">
        <FilterSection title="Categories" section="category" isExpanded={expandedSections.category} onToggle={toggleSection}>
          {categoriesLoading ? (
            <div className="py-1 text-xs text-(--zova-text-muted)">Loading...</div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-(--zova-text-muted)">
                  Shop by department
                </p>
                <div className="flex flex-wrap gap-2" data-nav-group>
                  <CategoryChip label="All" isActive={draftCategory === ''} onClick={() => setDraftCategory('')} />
                  {departmentOptions.map((category) => (
                    <CategoryChip
                      key={category.id}
                      label={category.name}
                      isActive={draftCategory === category.slug || activeDepartment?.slug === category.slug}
                      onClick={() => setDraftCategory(draftCategory === category.slug ? '' : category.slug)}
                    />
                  ))}
                </div>
              </div>

              {activeDepartment?.children?.length > 0 ? (
                <div className="space-y-1 border-t border-(--zova-border) pt-1">
                  <p className="px-1 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-(--zova-text-muted)">
                    Refine {activeDepartment.name}
                  </p>
                  {activeDepartment.children.map((group) => (
                    <div key={group.id} className="space-y-0.5" data-nav-group>
                      <CategoryTreeItem category={group} activeSlug={draftCategory} onSelect={setDraftCategory} />
                      {group.children?.map((child) => (
                        <CategoryTreeItem key={child.id} category={child} depth={1} activeSlug={draftCategory} onSelect={setDraftCategory} />
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleCategoryApply}
                disabled={!canApplyCategory}
                data-active={canApplyCategory}
                className="w-full rounded-xl py-2.5 text-xs font-black transition-colors bg-(--zova-border) text-(--zova-text-muted) cursor-default data-[active=true]:bg-(--zova-primary-action) data-[active=true]:text-white data-[active=true]:cursor-pointer"
              >
                {isApplyingFilters && hasPendingCategoryChange ? 'Applying...' : 'Apply Category'}
              </button>
            </div>
          )}
        </FilterSection>

        <FilterSection title="Price Range (₦)" section="price" isExpanded={expandedSections.price} onToggle={toggleSection}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {priceBuckets.map((bucket) => (
                <PriceBucketButton
                  key={bucket.label}
                  label={bucket.label}
                  isActive={isBucketActive(bucket)}
                  onClick={() => handlePriceBucketSelect(bucket)}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              {['min', 'max'].map((field) => (
                <div key={field} className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-(--zova-text-muted)">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={localPriceRange[field]}
                    onChange={(event) => handlePriceChange(field, event.target.value)}
                    onBlur={() => handlePriceBlur(field)}
                    placeholder={field === 'min' ? 'Min' : 'Max'}
                    className="w-full rounded-lg border border-(--zova-border) bg-(--zova-linen) py-2 pl-6 pr-2 text-xs text-(--zova-ink) outline-none transition-all focus:border-(--zova-primary-action)"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handlePriceApply}
              disabled={!canApplyPrice}
              data-active={canApplyPrice}
              className="w-full rounded-xl py-2.5 text-xs font-black transition-colors bg-(--zova-border) text-(--zova-text-muted) cursor-default data-[active=true]:bg-(--zova-primary-action) data-[active=true]:text-white data-[active=true]:cursor-pointer data-[active=true]:hover:bg-primary-hover"
            >
              {isApplyingFilters && hasPendingPriceChange ? 'Applying...' : 'Apply Range'}
            </button>
          </div>
        </FilterSection>

        <FilterSection title="Size" section="sizes" isExpanded={expandedSections.sizes} onToggle={toggleSection}>
          <div className="grid grid-cols-3 gap-1.5" data-nav-group>
            {SIZE_OPTIONS.map((size) => {
              const isActive = filters.sizes.includes(size);
              const count = Number(sizeCounts[size] || 0);
              const isUnavailable = count === 0 && Object.keys(sizeCounts).length > 0;

              return (
                <SizeChip
                  key={size}
                  size={size}
                  isActive={isActive}
                  isUnavailable={isUnavailable}
                  count={count}
                  onClick={toggleSize}
                />
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Color" section="colors" isExpanded={expandedSections.colors} onToggle={toggleSection}>
          <div className="grid grid-cols-4 gap-2" data-nav-group>
            {COLOR_OPTIONS.map((color) => {
              const isActive = filters.colors.includes(color.name);
              const count = Number(colorCounts[color.name] || 0);
              const isUnavailable = count === 0 && Object.keys(colorCounts).length > 0;

              return (
                <ColorSwatchButton
                  key={color.name}
                  color={color}
                  isActive={isActive}
                  isUnavailable={isUnavailable}
                  count={count}
                  onClick={toggleColor}
                />
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
