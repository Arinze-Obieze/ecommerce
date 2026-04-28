'use client';

import Link from 'next/link';
import { MOOD_PRICE_PRESETS, MOOD_SORT_OPTIONS } from '@/features/storefront/mood/mood.constants';
import { formatMoodPrice, getMoodDiscountPercent } from '@/features/storefront/mood/mood.utils';

function StarRating({ rating }) {
  const stars = Math.round(Number(rating || 0));

  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((index) => (
        <svg key={index} className={`h-3 w-3 ${index <= stars ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function MoodProductCard({ product }) {
  const price = Number(product.price || 0);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const discount = getMoodDiscountPercent(price, discountPrice);
  const image = product.image_urls?.[0] || null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-gray-300">👗</div>
        )}

        {discount > 0 ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white">
            -{discount}%
          </span>
        ) : null}

        {product.stock_quantity > 0 && product.stock_quantity <= 5 ? (
          <span className="absolute right-2.5 top-2.5 rounded-full border border-amber-200 bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber-600">
            {product.stock_quantity} left
          </span>
        ) : null}

        {product.stock_quantity === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm">Sold Out</span>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <button onClick={(event) => event.preventDefault()} className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-primary-hover">
            Quick Add
          </button>
        </div>
      </div>

      <div className="space-y-1 px-0.5">
        <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {product.category_name || 'Collection'}
        </p>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary">
          {product.name}
        </p>
        <StarRating rating={product.rating} />
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-black text-gray-900">{formatMoodPrice(discountPrice || price)}</span>
          {discount > 0 ? <span className="text-xs text-gray-400 line-through">{formatMoodPrice(price)}</span> : null}
        </div>
        {Array.isArray(product.colors) && product.colors.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {product.colors.slice(0, 4).map((color) => (
              <span key={color} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{color}</span>
            ))}
            {product.colors.length > 4 ? <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span> : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function FilterSection({ title, badge, children, defaultOpen = true }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between py-3.5 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">{title}</span>
          {badge > 0 ? (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">{badge}</span>
          ) : null}
        </div>
      </div>
      <div className="pb-4">{children}</div>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/8 py-1.5 pl-3 pr-2 text-xs font-semibold text-primary">
      {label}
      <button onClick={onRemove} className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/15 leading-none transition-colors hover:bg-primary hover:text-white">×</button>
    </span>
  );
}

function MoodSidebar({ filters }) {
  const toggleArrayValue = (setter, value) => setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));

  const CheckRow = ({ active, label, onClick }) => (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all ${active ? 'bg-primary/6 font-semibold text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
      <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[5px] border transition-all ${active ? 'border-primary bg-primary' : 'border-gray-300'}`}>
        {active ? <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : null}
      </span>
      {label}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <span className="text-sm font-bold text-gray-900">Filters</span>
          {filters.activeFilterCount > 0 ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">{filters.activeFilterCount}</span> : null}
        </div>
        {filters.activeFilterCount > 0 ? (
          <button onClick={filters.onClearAll} className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover">
            Clear all
          </button>
        ) : null}
      </div>

      <div className="px-4 pb-2">
        <FilterSection title="Sort By" badge={0}>
          <div className="space-y-0.5">
            {MOOD_SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => filters.setSort(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm transition-all ${filters.sort === option.value ? 'bg-primary/6 font-semibold text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
              >
                {option.label}
                {filters.sort === option.value ? <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary"><svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> : null}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price" badge={filters.pricePreset !== null ? 1 : 0}>
          <div className="space-y-0.5">
            {MOOD_PRICE_PRESETS.map((preset, index) => (
              <CheckRow key={preset.label} active={filters.pricePreset === index} label={preset.label} onClick={() => filters.setPricePreset(filters.pricePreset === index ? null : index)} />
            ))}
          </div>
        </FilterSection>

        {filters.availableCategories.length > 0 ? (
          <FilterSection title="Category" badge={filters.selectedCategories.length}>
            <div className="space-y-0.5">
              {filters.availableCategories.map((category) => (
                <CheckRow key={category.slug} active={filters.selectedCategories.includes(category.slug)} label={category.name} onClick={() => toggleArrayValue(filters.setSelectedCategories, category.slug)} />
              ))}
            </div>
          </FilterSection>
        ) : null}

        {filters.availableSizes.length > 0 ? (
          <FilterSection title="Size" badge={filters.selectedSizes.length}>
            <div className="flex flex-wrap gap-1.5">
              {filters.availableSizes.map((size) => {
                const active = filters.selectedSizes.includes(size);
                return (
                  <button key={size} onClick={() => toggleArrayValue(filters.setSelectedSizes, size)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${active ? 'border-primary bg-primary text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-primary/40 hover:text-primary'}`}>
                    {size}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        ) : null}

        {filters.availableColors.length > 0 ? (
          <FilterSection title="Color" badge={filters.selectedColors.length}>
            <div className="flex flex-wrap gap-1.5">
              {filters.availableColors.map((color) => {
                const active = filters.selectedColors.includes(color);
                return (
                  <button key={color} onClick={() => toggleArrayValue(filters.setSelectedColors, color)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${active ? 'border-primary bg-primary/8 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                    {color}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        ) : null}
      </div>
    </div>
  );
}

export function MoodPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-100 border-t-primary" />
        <p className="text-sm font-medium text-gray-400">Loading collection…</p>
      </div>
    </div>
  );
}

export function MoodPageError({ error }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <p className="text-3xl">😕</p>
      <p className="font-medium text-gray-600">{error || "This mood doesn't exist."}</p>
      <Link href="/" className="text-sm font-semibold text-primary">← Back to home</Link>
    </div>
  );
}

export function MoodPageLayout({ moodPage }) {
  const sidebarProps = {
    sort: moodPage.sort,
    setSort: moodPage.setSort,
    pricePreset: moodPage.pricePreset,
    setPricePreset: moodPage.setPricePreset,
    selectedCategories: moodPage.selectedCategories,
    setSelectedCategories: moodPage.setSelectedCategories,
    selectedSizes: moodPage.selectedSizes,
    setSelectedSizes: moodPage.setSelectedSizes,
    selectedColors: moodPage.selectedColors,
    setSelectedColors: moodPage.setSelectedColors,
    availableCategories: moodPage.availableCategories,
    availableSizes: moodPage.availableSizes,
    availableColors: moodPage.availableColors,
    activeFilterCount: moodPage.activeFilters.length,
    onClearAll: moodPage.clearAllFilters,
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Link href="/" className="transition-colors hover:text-gray-600">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/mood" className="transition-colors hover:text-gray-600">Moods</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700">{moodPage.mood.label}</span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">{moodPage.meta.emoji}</span>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{moodPage.mood.label}</h1>
              </div>
              {moodPage.mood.description ? <p className="max-w-lg text-sm leading-relaxed text-gray-500">{moodPage.mood.description}</p> : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-400">
                <span className="font-bold text-gray-700">{moodPage.filteredProducts.length}</span> of {moodPage.allProducts.length} pieces
              </span>
              <button onClick={() => moodPage.setShowMobileFilters(true)} className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white lg:hidden">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filter & Sort
                {moodPage.activeFilters.length > 0 ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">{moodPage.activeFilters.length}</span> : null}
              </button>
            </div>
          </div>

          {moodPage.activeFilters.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {moodPage.activeFilters.map((filter) => (
                <FilterChip key={filter.key} label={filter.label} onRemove={filter.clear} />
              ))}
              <button onClick={moodPage.clearAllFilters} className="px-1 text-xs font-semibold text-gray-400 transition-colors hover:text-red-500">
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-7">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-6">
              <MoodSidebar filters={sidebarProps} />
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            {moodPage.filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">🔍</div>
                <p className="mb-1 text-base font-bold text-gray-900">No products match your filters</p>
                <p className="mb-6 text-sm text-gray-500">Try removing a filter or two</p>
                <button onClick={moodPage.clearAllFilters} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
                {moodPage.filteredProducts.map((product) => <MoodProductCard key={product.id} product={product} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      {moodPage.showMobileFilters ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => moodPage.setShowMobileFilters(false)} />
          <div className="absolute bottom-0 right-0 top-0 flex w-[88vw] max-w-[340px] flex-col bg-[#fafafa] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <span className="text-sm font-black text-gray-900">Filter & Sort</span>
              <button onClick={() => moodPage.setShowMobileFilters(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500 transition-colors hover:bg-gray-200">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MoodSidebar filters={sidebarProps} />
            </div>
            <div className="flex gap-2.5 border-t border-gray-100 bg-white p-4">
              <button onClick={moodPage.clearAllFilters} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50">Clear</button>
              <button onClick={() => moodPage.setShowMobileFilters(false)} className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white">Show {moodPage.filteredProducts.length} items</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
