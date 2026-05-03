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

        {/* Title row + sort */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="m-0 text-2xl font-extrabold leading-[1.15] tracking-tight text-(--zova-ink)">
              All Products
            </h2>
            <p className="mt-1 text-[13px] text-(--zova-text-muted)">
              Showing{" "}
              <span className="font-semibold text-(--zova-ink)">{productsLength}</span> of{" "}
              <span className="font-semibold text-(--zova-ink)">{totalItems}</span> items
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[180px] appearance-none rounded-[10px] border-[1.5px] border-(--zova-border) bg-white py-[9px] pl-[14px] pr-9 text-[13px] font-semibold text-(--zova-ink) outline-none transition-colors hover:border-[#B8D4A0] focus:border-(--zova-primary-action)"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name: A to Z</option>
            </select>
            <FiChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--zova-text-body)"
            />
          </div>
        </div>

        {/* Search bar */}
        <div className="group relative overflow-hidden rounded-xl border-[1.5px] border-(--zova-border) bg-(--zova-surface-alt) transition-[border-color,background-color] duration-[180ms] focus-within:border-(--zova-primary-action) focus-within:bg-white">
          <FiSearch
            size={15}
            className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-(--zova-text-muted) transition-colors duration-180 group-focus-within:text-(--zova-primary-action)"
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
