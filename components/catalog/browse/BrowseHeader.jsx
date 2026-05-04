"use client";
import { useEffect, useState } from "react";
import { FiChevronDown, FiSearch, FiSliders } from "react-icons/fi";
import { useFilters } from "@/contexts/filter/FilterContext";

export default function BrowseHeader({
  productsLength,
  totalItems,
  onMobileFiltersOpen,
  searchInput,
  setSearchInput,
}) {
  const { filters, setSortBy, activeFilterCount } = useFilters();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerElevated, setHeaderElevated] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    function handleScroll() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      setHeaderElevated(currentScrollY > 96);
      if (currentScrollY <= 96) setHeaderVisible(true);
      else if (delta > 6) setHeaderVisible(false);
      else if (delta < -3) setHeaderVisible(true);
      lastScrollY = currentScrollY;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="sticky top-[72px] z-30 mb-3 rounded-2xl bg-white/95 backdrop-blur-[14px]"
      style={{
        transform: headerVisible ? "translateY(0)" : "translateY(calc(-100% - 12px))",
        opacity: headerVisible ? 1 : 0.98,
        transition: "transform 0.24s ease, box-shadow 0.18s ease, opacity 0.18s ease",
        boxShadow: headerElevated ? "0 14px 34px rgba(25,27,25,0.10)" : "none",
        border: headerElevated ? "1px solid var(--zova-border)" : "1px solid transparent",
      }}
    >
      <div className="px-3 pb-3.5 pt-3">

        {/* Mobile filter button */}
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={onMobileFiltersOpen}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-(--zova-border) bg-white px-5 py-[11px] text-sm font-bold text-(--zova-ink) transition-all hover:border-[#B8D4A0] hover:bg-(--zova-green-soft) hover:text-(--zova-primary-action)"
          >
            <FiSliders size={15} />
            Filters &amp; Sort
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-(--zova-primary-action) px-[5px] text-[10px] font-extrabold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

      {/* ── Title row + sort ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--zova-ink)', margin: 0, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            {filters.collection === 'new-arrivals' ? 'New Arrivals' : 'All Products'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--zova-text-muted)', margin: '4px 0 0' }}>
            Showing <span style={{ fontWeight: 600, color: 'var(--zova-ink)' }}>{productsLength}</span> of <span style={{ fontWeight: 600, color: 'var(--zova-ink)' }}>{totalItems}</span> items
          </p>
        </div>

        {/* Sort dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select
            value={filters.sortBy}
            onChange={e => setSortBy(e.target.value)}
            onMouseEnter={() => setSelectHov(true)}
            onMouseLeave={() => setSelectHov(false)}
            style={{
              padding: '9px 36px 9px 14px',
              borderRadius: 10,
              border: `1.5px solid ${selectHov ? '#B8D4A0' : 'var(--zova-border)'}`,
              background: '#FFFFFF',
              color: 'var(--zova-ink)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
              transition: 'border-color 0.18s',
              minWidth: 180,
            }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="reviewed_at">New Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name: A to Z</option>
          </select>
          <FiChevronDown
            size={14}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--zova-text-body)',
            }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput?.(e.target.value)}
            placeholder="Search for products..."
            className="w-full border-none bg-transparent py-3 pl-10 pr-10 text-sm text-(--zova-ink) outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput?.('')}
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-(--zova-border) text-[11px] font-bold text-(--zova-text-body)"
            >
              ✕
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
