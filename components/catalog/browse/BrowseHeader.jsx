"use client";
import { useState } from "react";
import { FiChevronDown, FiSearch, FiSliders } from "react-icons/fi";
import { useFilters } from "@/contexts/filter/FilterContext";

// Brand tokens — sourced from app/globals.css
const THEME = {
  green:       'var(--zova-primary-action)',
  greenDark:   'var(--zova-primary-action-hover)',
  greenTint:   'var(--zova-green-soft)',
  greenBorder: '#B8D4A0',
  white:       '#FFFFFF',
  pageBg:      'var(--zova-linen)',
  charcoal:    'var(--zova-ink)',
  medGray:     'var(--zova-text-body)',
  mutedText:   'var(--zova-text-muted)',
  border:      'var(--zova-border)',
  softGray:    'var(--zova-surface-alt)',
};

export default function BrowseHeader({
  productsLength,
  totalItems,
  onMobileFiltersOpen,
  searchInput,
  setSearchInput,
}) {
  const { filters, setSortBy, activeFilterCount } = useFilters();
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectHov, setSelectHov]         = useState(false);
  const [btnHov, setBtnHov]               = useState(false);

  return (
    <div>

      {/* ── Mobile filter button ── */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={onMobileFiltersOpen}
          onMouseEnter={() => setBtnHov(true)}
          onMouseLeave={() => setBtnHov(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '11px 20px',
            borderRadius: 12,
            border: `1.5px solid ${btnHov ? THEME.greenBorder : THEME.border}`,
            background: btnHov ? THEME.greenTint : THEME.white,
            color: btnHov ? THEME.green : THEME.charcoal,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
        >
          <FiSliders size={15} />
          Filters & Sort
          {activeFilterCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20,
                height: 20,
                borderRadius: 100,
                fontSize: 10,
                fontWeight: 800,
                background: THEME.green,
                color: THEME.white,
                padding: '0 5px',
              }}
            >
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
          <h2 style={{ fontSize: 24, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            All Products
          </h2>
          <p style={{ fontSize: 13, color: THEME.mutedText, margin: '4px 0 0' }}>
            Showing <span style={{ fontWeight: 600, color: THEME.charcoal }}>{productsLength}</span> of <span style={{ fontWeight: 600, color: THEME.charcoal }}>{totalItems}</span> items
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
              border: `1.5px solid ${selectHov ? THEME.greenBorder : THEME.border}`,
              background: THEME.white,
              color: THEME.charcoal,
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
              color: THEME.medGray,
            }}
          />
        </div>
      </div>

      {/* ── Search bar ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          border: `1.5px solid ${searchFocused ? THEME.green : THEME.border}`,
          background: searchFocused ? THEME.white : THEME.softGray,
          transition: 'border-color 0.18s, background 0.18s',
          overflow: 'hidden',
        }}
      >
        <FiSearch
          size={15}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: searchFocused ? THEME.green : THEME.mutedText,
            transition: 'color 0.18s',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput?.(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search for products..."
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            fontSize: 14,
            color: THEME.charcoal,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput?.('')}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: 'none',
              background: THEME.border,
              color: THEME.medGray,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}