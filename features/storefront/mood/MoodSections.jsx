'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight, FiShoppingBag, FiStar, FiX } from 'react-icons/fi';
import { MOOD_PRICE_PRESETS, MOOD_SORT_OPTIONS, GENDER_OPTIONS } from '@/features/storefront/mood/mood.constants';
import { formatMoodPrice, getMoodDiscountPercent } from '@/features/storefront/mood/mood.utils';

/* ─────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────── */
function MoodProductCard({ product }) {
  const price        = Number(product.price || 0);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const discount     = getMoodDiscountPercent(price, discountPrice);
  const image        = product.image_urls?.[0] || null;
  const fitScore     = product.mood_fit_score;

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }} className="mood-product-card">
      <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 16, overflow: 'hidden', background: '#f3f3f3', marginBottom: 10 }}>
        {image ? (
          <Image src={image} alt={product.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} className="mood-product-img" />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#ccc' }}>👗</div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: '#2E6417', color: '#fff', borderRadius: 20, padding: '3px 8px', fontSize: 10, fontWeight: 800 }}>
            -{discount}%
          </span>
        )}

        {/* Mood fit badge */}
        {fitScore > 0 && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff', borderRadius: 20, padding: '3px 8px', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
            <FiStar size={8} /> {Math.round(fitScore * 100)}% fit
          </span>
        )}

        {/* Low stock */}
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <span style={{ position: 'absolute', bottom: 44, left: 10, background: 'rgba(255,255,255,0.92)', color: '#B45309', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 700 }}>
            Only {product.stock_quantity} left
          </span>
        )}

        {/* Sold out */}
        {product.stock_quantity === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#555' }}>Sold Out</span>
          </div>
        )}

        {/* Quick add hover */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 }} className="mood-quick-add">
          <button
            onClick={(e) => e.preventDefault()}
            style={{ width: '100%', padding: '10px 0', borderRadius: 12, background: '#2E6417', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <FiShoppingBag size={12} /> Quick Add
          </button>
        </div>
      </div>

      <div style={{ paddingInline: 2 }}>
        {product.category_name && (
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 3 }}>
            {product.category_name}
          </p>
        )}
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.35, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </p>
        {/* Stars */}
        {Number(product.rating) > 0 && (
          <div style={{ display: 'flex', gap: 1, marginBottom: 5 }}>
            {[1,2,3,4,5].map((i) => (
              <svg key={i} width="11" height="11" viewBox="0 0 20 20" fill={i <= Math.round(Number(product.rating)) ? '#F59E0B' : '#E5E7EB'}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#111' }}>{formatMoodPrice(discountPrice || price)}</span>
          {discount > 0 && <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>{formatMoodPrice(price)}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────── */
function Section({ title, badge = 0, children }) {
  return (
    <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 16, marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0 10px' }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151' }}>{title}</span>
        {badge > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: '#2E6417', color: '#fff', fontSize: 9, fontWeight: 800 }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function CheckRow({ active, label, onClick, count }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, border: 'none', background: active ? 'rgba(46,100,23,0.07)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}>
      <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${active ? '#2E6417' : '#d1d5db'}`, background: active ? '#2E6417' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
        {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
      </span>
      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#2E6417' : '#4b5563', flex: 1 }}>{label}</span>
      {count != null && <span style={{ fontSize: 11, color: '#9ca3af' }}>{count}</span>}
    </button>
  );
}

function MoodSidebar({ filters }) {
  const toggle = (setter, value) =>
    setter((cur) => cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);

  return (
    <div style={{ borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>Filters</span>
          {filters.activeFilterCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: '#2E6417', color: '#fff', fontSize: 10, fontWeight: 800 }}>{filters.activeFilterCount}</span>
          )}
        </div>
        {filters.activeFilterCount > 0 && (
          <button onClick={filters.onClearAll} style={{ fontSize: 12, fontWeight: 600, color: '#2E6417', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
        )}
      </div>

      <div style={{ padding: '0 14px 8px' }}>

        {/* Sort By */}
        <Section title="Sort By">
          <div>
            {MOOD_SORT_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => filters.setSort(opt.value)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 10, border: 'none', background: filters.sort === opt.value ? 'rgba(46,100,23,0.07)' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: filters.sort === opt.value ? 700 : 400, color: filters.sort === opt.value ? '#2E6417' : '#4b5563', transition: 'background 0.15s' }}>
                {opt.label}
                {filters.sort === opt.value && (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#2E6417', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* In Stock */}
        <Section title="Availability" badge={filters.inStock ? 1 : 0}>
          <button onClick={() => filters.setInStock(!filters.inStock)}
            style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, color: '#4b5563', fontWeight: filters.inStock ? 600 : 400 }}>In Stock Only</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: filters.inStock ? '#2E6417' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, left: filters.inStock ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
            </div>
          </button>
        </Section>

        {/* Price */}
        <Section title="Price" badge={filters.pricePreset !== null ? 1 : 0}>
          <div>
            {MOOD_PRICE_PRESETS.map((preset, i) => (
              <CheckRow key={preset.label} active={filters.pricePreset === i} label={preset.label}
                onClick={() => filters.setPricePreset(filters.pricePreset === i ? null : i)} />
            ))}
          </div>
        </Section>

        {/* Category */}
        {filters.availableCategories.length > 0 && (
          <Section title="Category" badge={filters.selectedCategories.length}>
            <div>
              {filters.availableCategories.map((cat) => (
                <CheckRow key={cat.slug} active={filters.selectedCategories.includes(cat.slug)} label={cat.name}
                  onClick={() => toggle(filters.setSelectedCategories, cat.slug)} />
              ))}
            </div>
          </Section>
        )}

        {/* Size */}
        {filters.availableSizes.length > 0 && (
          <Section title="Size" badge={filters.selectedSizes.length}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {filters.availableSizes.map((size) => {
                const on = filters.selectedSizes.includes(size);
                return (
                  <button key={size} onClick={() => toggle(filters.setSelectedSizes, size)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${on ? '#2E6417' : '#e5e7eb'}`, background: on ? '#2E6417' : '#fff', color: on ? '#fff' : '#4b5563', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {size}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Color */}
        {filters.availableColors.length > 0 && (
          <Section title="Color" badge={filters.selectedColors.length}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {filters.availableColors.map((color) => {
                const on = filters.selectedColors.includes(color);
                return (
                  <button key={color} onClick={() => toggle(filters.setSelectedColors, color)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${on ? '#2E6417' : '#e5e7eb'}`, background: on ? 'rgba(46,100,23,0.08)' : '#fff', color: on ? '#2E6417' : '#4b5563', fontSize: 12, fontWeight: on ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {color}
                  </button>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PUBLIC EXPORTS
───────────────────────────────────────── */
export function MoodPageLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Hero skeleton */}
      <div style={{ height: 340, background: 'linear-gradient(to right, #e5e7eb, #d1d5db, #e5e7eb)', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 28 }}>
        <div style={{ width: 260, flexShrink: 0, height: 600, borderRadius: 20, background: '#e5e7eb' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div style={{ aspectRatio: '3/4', borderRadius: 16, background: '#e5e7eb', marginBottom: 10 }} />
              <div style={{ height: 12, borderRadius: 6, background: '#e5e7eb', marginBottom: 6 }} />
              <div style={{ height: 10, borderRadius: 6, background: '#f3f4f6', width: '60%' }} />
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  );
}

export function MoodPageError({ error }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#fafafa' }}>
      <span style={{ fontSize: 48 }}>😕</span>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#4b5563' }}>{error || "This mood doesn't exist."}</p>
      <Link href="/mood" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#2E6417', textDecoration: 'none' }}>
        <FiArrowLeft size={14} /> Back to moods
      </Link>
    </div>
  );
}

export function MoodPageLayout({ moodPage }) {
  const sidebarProps = {
    sort: moodPage.sort, setSort: moodPage.setSort,
    pricePreset: moodPage.pricePreset, setPricePreset: moodPage.setPricePreset,
    selectedCategories: moodPage.selectedCategories, setSelectedCategories: moodPage.setSelectedCategories,
    selectedSizes: moodPage.selectedSizes, setSelectedSizes: moodPage.setSelectedSizes,
    selectedColors: moodPage.selectedColors, setSelectedColors: moodPage.setSelectedColors,
    inStock: moodPage.inStock, setInStock: moodPage.setInStock,
    availableCategories: moodPage.availableCategories,
    availableSizes: moodPage.availableSizes,
    availableColors: moodPage.availableColors,
    activeFilterCount: moodPage.activeFilters.length,
    onClearAll: moodPage.clearAllFilters,
  };

  const meta = moodPage.meta;
  const gradient = meta.gradient || 'linear-gradient(135deg,#2E6417,#3a7a1e)';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .mood-product-card:hover .mood-product-img { transform: scale(1.07); }
        .mood-product-card .mood-quick-add { opacity: 0; transform: translateY(6px); transition: opacity 0.2s, transform 0.2s; }
        .mood-product-card:hover .mood-quick-add { opacity: 1; transform: translateY(0); }
        .mood-gender-pill { transition: all 0.18s; }
        .mood-gender-pill:hover { transform: translateY(-1px); }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        {moodPage.image ? (
          <Image src={moodPage.image} alt={moodPage.mood.label} fill priority
            sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center 30%' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: gradient }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%)' }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px 40px 32px', maxWidth: 1600, margin: '0 auto', left: 0, right: 0 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
            <span>/</span>
            <Link href="/mood" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>Moods</Link>
            <span>/</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{moodPage.mood.label}</span>
          </div>

          {/* Title area */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              <span>{meta.emoji}</span> {moodPage.mood.label}
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 10px' }}>
              {moodPage.mood.mood_key?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || moodPage.mood.label}
            </h1>
            {moodPage.mood.description && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', maxWidth: 480, lineHeight: 1.6, margin: '0 0 16px' }}>
                {moodPage.mood.description}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                <span style={{ fontWeight: 800, color: '#fff' }}>{moodPage.filteredProducts.length}</span> of {moodPage.allProducts.length} pieces
                {moodPage.isFallback && <span style={{ fontSize: 11, marginLeft: 6, color: 'rgba(255,255,255,0.5)' }}>(trending)</span>}
              </span>
              <Link href="/mood" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <FiArrowLeft size={11} /> All moods
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '28px 24px 64px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 24, display: 'none' }} className="mood-sidebar-desktop">
          <MoodSidebar filters={sidebarProps} />
        </aside>

        {/* Main area */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* ── Top bar: gender tabs + mobile filter + count ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            {/* Gender tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {GENDER_OPTIONS.map((opt) => {
                const active = moodPage.selectedGender === opt.value;
                return (
                  <button key={String(opt.value)} onClick={() => moodPage.setSelectedGender(opt.value)}
                    className="mood-gender-pill"
                    style={{ padding: '8px 20px', borderRadius: 32, border: `1.5px solid ${active ? '#2E6417' : '#e5e7eb'}`, background: active ? '#2E6417' : '#fff', color: active ? '#fff' : '#374151', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer', boxShadow: active ? '0 2px 8px rgba(46,100,23,0.25)' : 'none' }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Right side: count + mobile filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                <strong style={{ color: '#111' }}>{moodPage.filteredProducts.length}</strong> items
              </span>
              <button onClick={() => moodPage.setShowMobileFilters(true)}
                style={{ display: 'none', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, background: '#111', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                className="mood-filter-btn-mobile">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                Filter & Sort
                {moodPage.activeFilters.length > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#2E6417', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{moodPage.activeFilters.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {moodPage.activeFilters.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {moodPage.activeFilters.map((f) => (
                <span key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(46,100,23,0.08)', border: '1px solid rgba(46,100,23,0.2)', borderRadius: 20, padding: '5px 10px 5px 12px', fontSize: 12, fontWeight: 600, color: '#2E6417' }}>
                  {f.label}
                  <button onClick={f.clear} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'rgba(46,100,23,0.2)', border: 'none', cursor: 'pointer', color: '#2E6417' }}>
                    <FiX size={8} />
                  </button>
                </span>
              ))}
              <button onClick={moodPage.clearAllFilters} style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>
                Clear all
              </button>
            </div>
          )}

          {/* Product grid or empty state */}
          {moodPage.filteredProducts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 6 }}>No products match your filters</p>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Try removing a filter or browse the full shop</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={moodPage.clearAllFilters} style={{ padding: '11px 22px', borderRadius: 12, background: '#2E6417', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Clear filters
                </button>
                <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 12, background: '#fff', color: '#111', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  Browse all <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 14px' }} className="mood-product-grid">
              {moodPage.filteredProducts.map((product) => (
                <MoodProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {moodPage.showMobileFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => moodPage.setShowMobileFilters(false)} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '88vw', maxWidth: 340, background: '#f9fafb', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', background: '#fff' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>Filter & Sort</span>
              <button onClick={() => moodPage.setShowMobileFilters(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <FiX size={14} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <MoodSidebar filters={sidebarProps} />
            </div>
            <div style={{ display: 'flex', gap: 10, padding: 16, borderTop: '1px solid #f3f4f6', background: '#fff' }}>
              <button onClick={moodPage.clearAllFilters} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 700, color: '#4b5563', cursor: 'pointer' }}>Clear</button>
              <button onClick={() => moodPage.setShowMobileFilters(false)} style={{ flex: 2, padding: '12px 0', borderRadius: 12, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Show {moodPage.filteredProducts.length} items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 1024px) {
          .mood-sidebar-desktop { display: block !important; }
          .mood-filter-btn-mobile { display: none !important; }
          .mood-product-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .mood-product-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .mood-filter-btn-mobile { display: flex !important; }
        }
        @media (max-width: 639px) {
          .mood-product-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mood-filter-btn-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
