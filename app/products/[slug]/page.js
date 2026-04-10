"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiShoppingCart, FiHeart, FiStar, FiChevronLeft,
  FiMinus, FiPlus, FiShare2, FiCheck, FiTruck,
  FiRefreshCw, FiShield, FiZoomIn, FiChevronDown,
} from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';
import RelatedProducts from '@/components/RelatedProducts';
import { DEFAULT_RETURN_POLICY } from '@/utils/returnPolicy';
import { calculateBulkPricing, getBulkDiscountTiers } from '@/utils/bulkPricing';
import { logProductEvent } from '@/utils/logProductEvent';

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
const T = {
  green:        '#00B86B',
  greenDark:    '#0F7A4F',
  greenDeep:    '#0A3D2E',
  greenTint:    '#EDFAF3',
  greenBorder:  '#A8DFC4',
  white:        '#FFFFFF',
  pageBg:       '#F9FAFB',
  charcoal:     '#111111',
  medGray:      '#666666',
  mutedText:    '#999999',
  border:       '#E8E8E8',
  softGray:     '#F5F5F5',
  saleRed:      '#E53935',
  saleBg:       '#FEF2F2',
  starYellow:   '#F59E0B',
};

function buildGalleryMedia(product) {
  const images = Array.isArray(product?.image_urls)
    ? product.image_urls.filter(Boolean).map((url, index) => ({
      id: `image-${index}`,
      type: 'image',
      url,
    }))
    : [];
  const videos = Array.isArray(product?.video_urls)
    ? product.video_urls.filter(Boolean).map((url, index) => ({
      id: `video-${index}`,
      type: 'video',
      url,
    }))
    : [];

  return [...images, ...videos];
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getUniqueOptions(variants, key) {
  return [...new Set((variants || []).map(v => v?.[key]).filter(Boolean))];
}
function pickDefaultVariant(variants) {
  if (!Array.isArray(variants) || !variants.length) return null;
  return variants.find(v => Number(v.stock_quantity) > 0) || variants[0];
}

function getSpecificationEntries(specifications) {
  if (!specifications) return [];

  if (typeof specifications === 'string') {
    return specifications
      .split('\n')
      .map((row, index) => ({ key: `Detail ${index + 1}`, value: row.trim() }))
      .filter((row) => row.value);
  }

  if (Array.isArray(specifications)) {
    return specifications
      .map((entry, index) => {
        if (!entry) return null;
        if (typeof entry === 'object') {
          const key = String(entry.key || `Detail ${index + 1}`).trim();
          const value = String(entry.value || '').trim();
          if (!value) return null;
          return { key, value };
        }
        const value = String(entry).trim();
        if (!value) return null;
        return { key: `Detail ${index + 1}`, value };
      })
      .filter(Boolean);
  }

  if (typeof specifications === 'object') {
    return Object.entries(specifications)
      .map(([key, value]) => ({
        key: String(key || '').trim(),
        value: String(value || '').trim(),
      }))
      .filter((entry) => entry.key && entry.value);
  }

  return [];
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────
const StarRow = ({ rating, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <FiStar key={s} size={13}
          style={{ color: s <= Math.round(rating) ? T.starYellow : T.border,
                   fill:  s <= Math.round(rating) ? T.starYellow : 'none' }} />
      ))}
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, color: T.charcoal }}>{Number(rating || 5).toFixed(1)}</span>
    {count !== undefined && (
      <span style={{ fontSize: 13, color: T.mutedText }}>({count} reviews)</span>
    )}
  </div>
);

const IconTile = ({ icon: Icon, size = 16, bg = T.softGray, color = T.charcoal }) => (
  <div style={{ width: 34, height: 34, borderRadius: 9, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon size={size} style={{ color }} />
  </div>
);

const TrustPill = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                border: `1px solid ${T.border}`, borderRadius: 12, background: T.white, flex: 1 }}>
    <Icon size={14} style={{ color: T.green, flexShrink: 0 }} />
    <span style={{ fontSize: 12, fontWeight: 600, color: T.charcoal, lineHeight: 1.4 }}>{label}</span>
  </div>
);

// Image gallery
function ImageGallery({ media, productName }) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const imgRef = useRef(null);

  const all = media?.length ? media : [{ id: 'fallback-image', type: 'image', url: 'https://placehold.co/600x800' }];
  const selectedMedia = all[selected] || all[0];
  const canZoom = selectedMedia?.type !== 'video';

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowRight' && all.length > 1) setSelected((prev) => (prev + 1) % all.length);
      if (event.key === 'ArrowLeft' && all.length > 1) setSelected((prev) => (prev - 1 + all.length) % all.length);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [all.length, lightboxOpen]);

  const handleMouseMove = (e) => {
    if (!imgRef.current || !canZoom) return;
    const rect = imgRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const goPrev = () => setSelected((prev) => (prev - 1 + all.length) % all.length);
  const goNext = () => setSelected((prev) => (prev + 1) % all.length);
  const handleTouchEnd = (e) => {
    if (touchStartX === null || all.length < 2) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) goNext();
      else goPrev();
    }
    setTouchStartX(null);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Thumbnails — desktop only */}
        {all.length > 1 && (
          <div
            className="hidden lg:flex"
            style={{ flexDirection: 'column', gap: 8, flexShrink: 0, maxHeight: 'min(72vh, 900px)', overflowY: 'auto', paddingRight: 4 }}
          >
            {all.map((item, i) => (
              <button key={i} type="button" onClick={() => setSelected(i)}
                style={{
                  width: 72, height: 86, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  border: `2px solid ${i === selected ? T.green : 'transparent'}`,
                  opacity: i === selected ? 1 : 0.6,
                  transition: 'all 0.18s', padding: 0, background: T.softGray,
                }}
                onMouseEnter={e => { if (i !== selected) e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { if (i !== selected) e.currentTarget.style.opacity = '0.6'; }}
              >
                {item.type === 'video' ? (
                  <div style={{ width: '100%', height: '100%', background: T.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, fontSize: 11, fontWeight: 800 }}>
                    VIDEO
                  </div>
                ) : (
                  <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div style={{ flex: 1 }}>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Open ${productName} media fullscreen`}
            style={{ width: '100%', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
          >
            <div
              ref={imgRef}
              onMouseEnter={() => setZoomed(canZoom)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
              style={{
                position: 'relative', borderRadius: 20, overflow: 'hidden',
                aspectRatio: '3/4', background: T.softGray, cursor: canZoom ? 'zoom-in' : 'pointer',
              }}
            >
              {selectedMedia?.type === 'video' ? (
                <video src={selectedMedia.url} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
              ) : (
                <>
                  <img
                    src={selectedMedia?.url}
                    alt={productName}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      transform: zoomed ? 'scale(1.6)' : 'scale(1)',
                      transition: zoomed ? 'transform 0.15s ease-out' : 'transform 0.3s ease-out',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 12, right: 12,
                                background: 'rgba(255,255,255,0.88)', borderRadius: 8, padding: '5px 8px',
                                display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(4px)' }}>
                    <FiZoomIn size={12} style={{ color: T.charcoal }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.charcoal }}>TAP TO EXPAND</span>
                  </div>
                </>
              )}
            </div>
          </button>

          {/* Mobile thumbnails */}
          {all.length > 1 && (
            <div
              className="flex lg:hidden"
              style={{ gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}
            >
              {all.map((item, i) => (
                <button key={i} type="button" onClick={() => setSelected(i)}
                  style={{
                    width: 60, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                    border: `2px solid ${i === selected ? T.green : 'transparent'}`,
                    opacity: i === selected ? 1 : 0.6, padding: 0, cursor: 'pointer',
                  }}
                >
                  {item.type === 'video' ? (
                    <div style={{ width: '100%', height: '100%', background: T.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, fontSize: 10, fontWeight: 800 }}>
                      VIDEO
                    </div>
                  ) : (
                    <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(17,17,17,0.94)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
            style={{ width: '100%', maxWidth: 1100, display: 'grid', gap: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: T.white }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {productName}
                {all.length > 1 ? ` • ${selected + 1} of ${all.length}` : ''}
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                style={{ border: 'none', background: 'rgba(255,255,255,0.12)', color: T.white, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}
              >
                ×
              </button>
            </div>

            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedMedia?.type === 'video' ? (
                <video src={selectedMedia.url} controls playsInline autoPlay style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', background: '#000' }} />
              ) : (
                <img src={selectedMedia?.url} alt={productName} style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
              )}

              {all.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.14)', color: T.white, cursor: 'pointer', fontSize: 22 }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.14)', color: T.white, cursor: 'pointer', fontSize: 22 }}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            {all.length > 1 ? (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {all.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(i)}
                    style={{
                      width: 72,
                      height: 88,
                      flexShrink: 0,
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: `2px solid ${i === selected ? T.green : 'rgba(255,255,255,0.24)'}`,
                      background: '#0f0f0f',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {item.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, fontSize: 11, fontWeight: 800 }}>VIDEO</div>
                    ) : (
                      <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

// Option selector (sizes / colors)
function OptionPills({ label, options, selected, onSelect, getAvailable }) {
  const [hov, setHov] = useState(null);
  if (!options.length) return null;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.charcoal }}>{label}</span>
        {selected && <span style={{ fontSize: 12, color: T.medGray }}>{selected}</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => {
          const isSelected = opt === selected;
          const isAvailable = getAvailable ? getAvailable(opt) : true;
          return (
            <button key={opt} type="button"
              onClick={() => isAvailable && onSelect(opt)}
              onMouseEnter={() => setHov(opt)}
              onMouseLeave={() => setHov(null)}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                border: `2px solid ${isSelected ? T.green : hov === opt && isAvailable ? T.greenBorder : T.border}`,
                background: isSelected ? T.green : hov === opt && isAvailable ? T.greenTint : T.white,
                color: isSelected ? T.white : isAvailable ? T.charcoal : T.mutedText,
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                opacity: isAvailable ? 1 : 0.45,
                textDecoration: isAvailable ? 'none' : 'line-through',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {opt}
              {isSelected && (
                <FiCheck size={10} style={{ marginLeft: 5, verticalAlign: 'middle' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Quantity stepper
function QuantityStepper({ quantity, setQuantity, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                  border: `1.5px solid ${T.border}`, borderRadius: 12,
                  background: T.white, overflow: 'hidden', height: 52, width: '100%' }}>
      <button type="button"
        onClick={() => setQuantity(q => Math.max(1, q - 1))}
        style={{ width: 46, height: '100%', border: 'none', background: 'none',
                 cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                 color: quantity <= 1 ? T.mutedText : T.charcoal,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 borderRight: `1px solid ${T.border}` }}
      >
        <FiMinus size={16} />
      </button>
      <span style={{ width: 56, textAlign: 'center', fontSize: 16, fontWeight: 800, color: T.charcoal }}>
        {quantity}
      </span>
      <button type="button"
        onClick={() => setQuantity(q => q < max ? q + 1 : q)}
        disabled={quantity >= max}
        style={{ width: 46, height: '100%', border: 'none', background: 'none',
                 cursor: quantity >= max ? 'not-allowed' : 'pointer',
                 color: quantity >= max ? T.mutedText : T.charcoal,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 borderLeft: `1px solid ${T.border}` }}
      >
        <FiPlus size={16} />
      </button>
    </div>
  );
}

// Tab bar
const TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'reviews',        label: 'Reviews' },
  { id: 'policies',       label: 'Returns & Policies' },
];

const SECTION_LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'specifications', label: 'Specs' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'policies', label: 'Delivery' },
];

function TabBar({ active, setActive, reviewCount }) {
  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, overflowX: 'auto' }}>
      {TABS.map(t => {
        const label = t.id === 'reviews' ? `Reviews (${reviewCount})` : t.label;
        const isActive = active === t.id;
        return (
          <button key={t.id} type="button" onClick={() => setActive(t.id)}
            style={{
              padding: '15px 20px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
              border: 'none', background: 'none', cursor: 'pointer',
              color: isActive ? T.green : T.medGray,
              borderBottom: `2.5px solid ${isActive ? T.green : 'transparent'}`,
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SectionShortcutNav({ active, onJump, reviewCount }) {
  return (
    <div
      className="lg:hidden"
      style={{
        position: 'sticky',
        top: 8,
        zIndex: 15,
        marginTop: 28,
        marginBottom: 24,
        padding: 8,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.92)',
        border: `1px solid ${T.border}`,
        backdropFilter: 'blur(14px)',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
      }}
    >
      {SECTION_LINKS.map((section) => {
        const label = section.id === 'reviews' ? `Reviews (${reviewCount})` : section.label;
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onJump(section.id)}
            style={{
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderRadius: 999,
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 800,
              background: isActive ? T.green : T.white,
              color: isActive ? T.white : T.charcoal,
              boxShadow: isActive ? '0 8px 18px rgba(0, 184, 107, 0.18)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function MobileSection({ id, title, open, onToggle, children }) {
  return (
    <section id={id} style={{ border: `1px solid ${T.border}`, borderRadius: 18, background: T.white, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px 16px',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 900, color: T.charcoal, letterSpacing: '0.01em' }}>{title}</span>
        <FiChevronDown
          size={16}
          style={{
            color: T.medGray,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
          }}
        />
      </button>
      {open ? (
        <div style={{ padding: '0 16px 18px' }}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

function OverviewPanel({ product, storeName, mediaFacts, specificationPreview, selectedVariantLabel, returnPolicy }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {mediaFacts.map((fact) => (
            <span
              key={fact}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: 999,
                background: '#F7F8FA',
                border: `1px solid ${T.border}`,
                color: T.charcoal,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {fact}
            </span>
          ))}
        </div>

        <p style={{ margin: 0, fontSize: 14, color: T.medGray, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {product.description || 'No description available.'}
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10 }} className="sm:grid-cols-2">
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, background: '#FCFCFC' }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 800, color: T.charcoal, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Buying essentials
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span style={{ color: T.medGray }}>Seller</span>
              <span style={{ color: T.charcoal, fontWeight: 700 }}>{storeName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span style={{ color: T.medGray }}>Delivery</span>
              <span style={{ color: T.charcoal, fontWeight: 700 }}>Free over ₦50,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span style={{ color: T.medGray }}>Returns</span>
              <span style={{ color: T.charcoal, fontWeight: 700 }}>{returnPolicy?.rows?.[0]?.window || '30-day policy'}</span>
            </div>
            {selectedVariantLabel ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                <span style={{ color: T.medGray }}>Chosen option</span>
                <span style={{ color: T.charcoal, fontWeight: 700 }}>{selectedVariantLabel}</span>
              </div>
            ) : null}
          </div>
        </div>

        {specificationPreview.length > 0 ? (
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, background: T.white }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 800, color: T.charcoal, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick specifications
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {specificationPreview.map((entry) => (
                <div key={`${entry.key}-${entry.value}`} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.charcoal }}>{entry.key}</span>
                  <span style={{ fontSize: 12, color: T.medGray }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Reviews tab content
function ReviewsTab({ product, user, supabase, onReviewAdded }) {
  const [rating, setRating]       = useState(5);
  const [comment, setComment]     = useState('');
  const [hovStar, setHovStar]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [submitHov, setSubmitHov] = useState(false);
  const [focused, setFocused]     = useState(false);
  const [showForm, setShowForm]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) { setError('Please enter a comment.'); return; }
    setLoading(true); setError(''); setSuccess(false);
    try {
      const res  = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      onReviewAdded({ id: data.id || Date.now(), rating, comment, created_at: new Date().toISOString() });
      setComment(''); setRating(5); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reviews = product.reviews || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="lg:grid-cols-3-custom">
      <div style={{ display: 'grid', gap: 40 }} className="lg:grid-cols-[1fr_340px]">
        {/* Review list */}
        <div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: T.pageBg,
                          borderRadius: 16, border: `1.5px dashed ${T.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: T.charcoal, margin: '0 0 6px' }}>No reviews yet</p>
              <p style={{ fontSize: 13, color: T.mutedText, margin: 0 }}>Be the first to share your thoughts</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {reviews.map((rev, i) => (
                <div key={rev.id}
                  style={{ paddingTop: i === 0 ? 0 : 20, paddingBottom: 20,
                            borderBottom: i < reviews.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.greenTint,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 16, flexShrink: 0 }}>
                      👤
                    </div>
                    <div>
                      <StarRow rating={rev.rating} />
                      <span style={{ fontSize: 11, color: T.mutedText, marginTop: 2, display: 'block' }}>
                        {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: T.medGray, lineHeight: 1.7, margin: 0 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            style={{
              width: '100%',
              border: `1px solid ${T.border}`,
              background: T.white,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 13,
              fontWeight: 800,
              color: T.charcoal,
              cursor: 'pointer',
            }}
          >
            <span>Write a Review</span>
            <FiChevronDown
              size={16}
              style={{ color: T.medGray, transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease' }}
            />
          </button>
        </div>

        {/* Write review form */}
        <div
          className={showForm ? 'block lg:block' : 'hidden lg:block'}
          style={{ background: T.pageBg, borderRadius: 16, padding: 24, border: `1px solid ${T.border}`, alignSelf: 'start' }}
        >
          <p style={{ fontSize: 14, fontWeight: 800, color: T.charcoal, margin: '0 0 18px' }}>Write a Review</p>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: 13, color: T.mutedText, marginBottom: 16 }}>Sign in to leave a review</p>
              <Link href="/login" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 10,
                                          background: T.green, color: T.white, textDecoration: 'none',
                                          fontSize: 13, fontWeight: 700 }}>
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.charcoal, margin: '0 0 8px' }}>Your Rating</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                      onMouseEnter={() => setHovStar(s)} onMouseLeave={() => setHovStar(0)}
                      onClick={() => setRating(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <FiStar size={26}
                        style={{ color: s <= (hovStar || rating) ? T.starYellow : T.border,
                                 fill:  s <= (hovStar || rating) ? T.starYellow : 'none',
                                 transition: 'all 0.1s' }} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.charcoal, margin: '0 0 8px' }}>Your Review</p>
                <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="What did you think of this product?"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, resize: 'vertical',
                           border: `1.5px solid ${focused ? T.green : T.border}`,
                           background: T.white, fontSize: 13, color: T.charcoal, outline: 'none',
                           boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }} />
              </div>
              {error   && <p style={{ fontSize: 12, color: '#DC2626', background: T.saleBg, padding: '8px 12px', borderRadius: 8, margin: 0 }}>{error}</p>}
              {success && <p style={{ fontSize: 12, color: T.green, background: T.greenTint, padding: '8px 12px', borderRadius: 8, margin: 0, fontWeight: 600 }}>Review submitted — thank you!</p>}
              <button type="submit" disabled={loading}
                onMouseEnter={() => setSubmitHov(true)} onMouseLeave={() => setSubmitHov(false)}
                style={{ padding: '11px 0', borderRadius: 10, border: 'none',
                         background: submitHov ? T.greenDark : T.green,
                         color: T.white, fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                         opacity: loading ? 0.7 : 1, transition: 'background 0.18s' }}>
                {loading ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ReturnPolicyTable({ policy }) {
  const rows = Array.isArray(policy?.rows) && policy.rows.length ? policy.rows : DEFAULT_RETURN_POLICY.rows;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 900, color: T.charcoal, margin: '0 0 6px' }}>
          {policy?.title || DEFAULT_RETURN_POLICY.title}
        </p>
        <p style={{ fontSize: 14, color: T.medGray, lineHeight: 1.7, margin: 0 }}>
          {policy?.subtitle || DEFAULT_RETURN_POLICY.subtitle}
        </p>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={{ background: T.pageBg }}>
              {['Scenario', 'Window', 'Condition', 'Resolution', 'Notes'].map((label) => (
                <th
                  key={label}
                  style={{
                    padding: '14px 16px',
                    borderBottom: `1px solid ${T.border}`,
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 800,
                    color: T.charcoal,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index} style={{ background: index % 2 === 0 ? T.white : '#FCFCFC' }}>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 700, color: T.charcoal }}>
                  {row.scenario}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.medGray }}>
                  {row.window}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.medGray, lineHeight: 1.65 }}>
                  {row.condition}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.greenDark, fontWeight: 700 }}>
                  {row.resolution}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.medGray, lineHeight: 1.65 }}>
                  {row.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 18, border: `1px solid ${T.border}`, borderRadius: 14 }}>
        <IconTile icon={FiShield} bg={T.greenTint} color={T.green} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: T.charcoal, margin: '0 0 4px' }}>Need help with a return?</p>
          <p style={{ fontSize: 13, color: T.medGray, margin: 0, lineHeight: 1.65 }}>
            {policy?.support_text || DEFAULT_RETURN_POLICY.support_text}{' '}
            <Link href="/support" style={{ color: T.green, fontWeight: 700, textDecoration: 'none' }}>
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ProductPage({ params }) {
  const router = useRouter();
  const { addToCart }                   = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct]       = useState(null);
  const [returnPolicy, setReturnPolicy] = useState(DEFAULT_RETURN_POLICY);
  const [variants, setVariants]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity]     = useState(1);
  const [activeTab, setActiveTab]   = useState('overview');
  const [activeSection, setActiveSection] = useState('overview');
  const [openMobileSection, setOpenMobileSection] = useState('overview');
  const [user, setUser]             = useState(null);
  const [toast, setToast]           = useState('');
  const [addedAnim, setAddedAnim]   = useState(false);
  const [wishHov, setWishHov]       = useState(false);
  const [shareHov, setShareHov]     = useState(false);
  const [cartHov, setCartHov]       = useState(false);
  const [visitHov, setVisitHov]     = useState(false);
  const [backHov, setBackHov]       = useState(false);

  const { slug } = React.use(params);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!slug) return;

    
    (async () => {
      try {
        const [pRes, vRes] = await Promise.all([
          fetch(`/api/products/${slug}`, { cache: 'no-store' }),
          fetch(`/api/products/${slug}/variants`, { cache: 'no-store' }),
        ]);
        const pData = await pRes.json();
        const vData = await vRes.json();
        if (!pRes.ok) throw new Error(pData.error);

        const fetchedVariants = Array.isArray(vData?.variants) ? vData.variants : [];
        setProduct(pData);
        setReturnPolicy(pData.return_policy || DEFAULT_RETURN_POLICY);
        setVariants(fetchedVariants);

        // Log product view
  // Guard: only log view once per product per page load
      if (!hasLoggedView.current) {
        hasLoggedView.current = true
        logProductEvent({
          productId: pData.id,
          eventType: 'view',
          source:    'product_page',
          metadata:  { referrer: document.referrer || null },
        })
      }

        try {
          const views = JSON.parse(localStorage.getItem('recently_viewed_products')) || [];
          const next  = [pData.id, ...views.filter(id => id !== pData.id)].slice(0, 15);
          localStorage.setItem('recently_viewed_products', JSON.stringify(next));
        } catch {}

        const def = pickDefaultVariant(fetchedVariants);
        if (def) {
          setSelectedSize(def.size || null);
          setSelectedColor(def.color || null);
        } else {
          setSelectedSize(pData.sizes?.[0] || null);
          setSelectedColor(pData.colors?.[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined' || !slug) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined' || !product) return;

    const targets = SECTION_LINKS
      .map(({ id }) => sectionRefs.current[id])
      .filter(Boolean);

    if (!targets.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [product, openMobileSection]);

  const sizeOptions  = useMemo(() => {
    const f = getUniqueOptions(variants, 'size');
    return f.length ? f : (Array.isArray(product?.sizes) ? product.sizes : []);
  }, [variants, product]);

  const colorOptions = useMemo(() => {
    const f = getUniqueOptions(variants, 'color');
    return f.length ? f : (Array.isArray(product?.colors) ? product.colors : []);
  }, [variants, product]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find(v => {
      const sm = sizeOptions.length  ? v.size  === selectedSize  : true;
      const cm = colorOptions.length ? v.color === selectedColor : true;
      return sm && cm;
    }) || null;
  }, [variants, sizeOptions.length, colorOptions.length, selectedSize, selectedColor]);

  const effectiveStock    = selectedVariant
    ? Number(selectedVariant.stock_quantity) || 0
    : Number(product?.stock_quantity) || 0;
  const selectedVariantLabel = [selectedVariant?.color || selectedColor, selectedVariant?.size || selectedSize].filter(Boolean).join(' / ');
  const requiresVariant   = variants.length > 0;
  const canAddToCart      = requiresVariant ? Boolean(selectedVariant) && effectiveStock > 0 : effectiveStock > 0;
  const galleryMedia      = useMemo(() => buildGalleryMedia(product), [product]);
  const specificationEntries = useMemo(() => getSpecificationEntries(product?.specifications), [product?.specifications]);
  const specificationPreview = specificationEntries.slice(0, 4);
  const pricingProduct    = useMemo(
    () => (selectedVariant ? { ...product, price: selectedVariant.price ?? product?.price } : product),
    [product, selectedVariant]
  );
  const bulkPricing       = useMemo(() => calculateBulkPricing(pricingProduct, quantity), [pricingProduct, quantity]);
  const bulkDiscountTiers = useMemo(() => getBulkDiscountTiers(product), [product]);
  const baseDiscountPercent = product?.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) : null;
  const currentPrice      = bulkPricing.finalUnitPrice;
  const compareAtPrice    = bulkPricing.hasBulkDiscount
    ? bulkPricing.baseUnitPrice
    : (product?.discount_price ? product.price : null);
  const activeDiscountPercent = bulkPricing.hasBulkDiscount
    ? bulkPricing.appliedTier?.discount_percent
    : baseDiscountPercent;
  const inWishlist        = product ? isInWishlist(product.id) : false;
  const storeName         = product?.stores?.name || product?.store?.name || 'Trusted seller';
  const mediaFacts        = [
    galleryMedia.some((item) => item.type === 'video') ? 'Includes video' : null,
    specificationEntries.length ? `${specificationEntries.length} key specs` : null,
    effectiveStock > 0 ? `${effectiveStock} in stock` : 'Currently unavailable',
  ].filter(Boolean);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleShare = async () => {
    const data = { title: product?.name, text: product?.description?.slice(0, 100), url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else {
      try { await navigator.clipboard.writeText(data.url); showToast('Link copied!'); } catch {}
    }
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addToCart({
      ...product,
      variant_id:    selectedVariant?.id || null,
      stock_quantity: effectiveStock,
      selectedSize:  selectedVariant?.size  || selectedSize,
      selectedColor: selectedVariant?.color || selectedColor,
      quantity,
    });
    setAddedAnim(true);
    showToast('Added to cart!');
    setTimeout(() => setAddedAnim(false), 1800);
  };

  const handleReviewAdded = (rev) => {
    setProduct(prev => ({ ...prev, reviews: [rev, ...(prev.reviews || [])] }));
  };

  const jumpToSection = (sectionId) => {
    setActiveSection(sectionId);
    setOpenMobileSection(sectionId);

    if (sectionId === 'overview') {
      setActiveTab('overview');
    } else if (sectionId === 'specifications') {
      setActiveTab('specifications');
    } else if (sectionId === 'reviews') {
      setActiveTab('reviews');
    } else if (sectionId === 'policies') {
      setActiveTab('policies');
    }

    const target = sectionRefs.current[sectionId];
    if (!target || typeof window === 'undefined') return;
    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.white, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 48 }}
             className="lg:grid-cols-2">
          {[['100%', '100%', '66.66%'], ['100%']].map((widths, gi) => (
            <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {widths.map((w, i) => (
                <div key={i} className="animate-pulse"
                  style={{ width: w, aspectRatio: i === 0 && gi === 0 ? '3/4' : undefined,
                            height: i === 0 && gi === 0 ? undefined : 24,
                            borderRadius: 16, background: T.softGray }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: T.charcoal }}>Product not found</p>
        <Link href="/shop" style={{ color: T.green, fontWeight: 600, fontSize: 14 }}>← Back to Shop</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.white }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: T.charcoal, color: T.white,
          padding: '12px 24px', borderRadius: 100, fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          whiteSpace: 'nowrap',
        }}>
          <FiCheck size={14} style={{ color: T.green }} /> {toast}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 80px' }} className="lg:px-8 lg:py-8">

        {/* ── Back nav ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <button type="button"
            onClick={() => router.back()}
            onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 100, border: `1.5px solid ${backHov ? T.greenBorder : T.border}`,
              background: backHov ? T.greenTint : T.white,
              color: backHov ? T.green : T.charcoal, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            <FiChevronLeft size={15} /> Back
          </button>

        </div>

        {/* ── Main product grid ── */}
        <div style={{ display: 'grid', gap: 32, alignItems: 'start' }} className="lg:grid-cols-2 lg:gap-12">

          {/* Left: image gallery */}
          <ImageGallery media={galleryMedia} productName={product.name} />

          {/* Right: product info panel */}
          <div className="lg:sticky lg:top-6">

            {/* Category + rating */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                              textTransform: 'uppercase', color: T.green, background: T.greenTint,
                              border: `1px solid ${T.greenBorder}`, padding: '4px 10px', borderRadius: 100 }}>
                {product.category?.name || 'Collection'}
              </span>
              <StarRow rating={product.rating} count={product.reviews_count || 0} />
            </div>

            {/* Name + action buttons */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.65rem, 4vw, 2.25rem)', fontWeight: 900, color: T.charcoal, margin: 0,
                            letterSpacing: '-0.03em', lineHeight: 1.15, flex: 1 }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button type="button"
                  onMouseEnter={() => setWishHov(true)} onMouseLeave={() => setWishHov(false)}
                  onClick={() => toggleWishlist(product.id)}
                  style={{ width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
                           border: `1.5px solid ${inWishlist ? '#FECACA' : wishHov ? T.border : T.border}`,
                           background: inWishlist ? '#FEF2F2' : wishHov ? T.softGray : T.white,
                           display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  <FiHeart size={16} style={{ color: inWishlist ? T.saleRed : T.charcoal, fill: inWishlist ? T.saleRed : 'none' }} />
                </button>
                <button type="button"
                  onMouseEnter={() => setShareHov(true)} onMouseLeave={() => setShareHov(false)}
                  onClick={handleShare}
                  style={{ width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
                           border: `1.5px solid ${T.border}`, background: shareHov ? T.softGray : T.white,
                           display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <FiShare2 size={16} style={{ color: T.charcoal }} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: T.charcoal, letterSpacing: '-0.03em' }}>
                ₦{currentPrice?.toLocaleString()}
              </span>
              {compareAtPrice ? (
                <>
                  <span style={{ fontSize: 18, color: T.mutedText, textDecoration: 'line-through', fontWeight: 500 }}>
                    ₦{compareAtPrice?.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.saleRed,
                                  background: T.saleBg, padding: '3px 8px', borderRadius: 6 }}>
                    -{activeDiscountPercent}%
                  </span>
                </>
              ) : null}
            </div>

            {bulkPricing.hasBulkDiscount && product.price > bulkPricing.baseUnitPrice ? (
              <p style={{ fontSize: 12, color: T.mutedText, margin: '0 0 8px' }}>
                Regular list price: ₦{product.price.toLocaleString()}
              </p>
            ) : null}

            {bulkPricing.hasBulkDiscount ? (
              <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 12, background: T.greenTint, border: `1px solid ${T.greenBorder}` }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: T.greenDeep }}>
                  {bulkPricing.appliedTier.discount_percent}% bulk discount active at {bulkPricing.appliedTier.minimum_quantity}+ units
                </p>
                <p style={{ margin: 0, fontSize: 12, color: T.greenDeep }}>
                  You save ₦{bulkPricing.totalSavings.toLocaleString()} at quantity {quantity}.
                </p>
              </div>
            ) : null}

            {product.sku && (
              <p style={{ fontSize: 11, color: T.mutedText, margin: '0 0 16px', fontWeight: 500 }}>
                SKU: {product.sku}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {mediaFacts.map((fact) => (
                <span key={fact} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#F7F8FA', border: `1px solid ${T.border}`, color: T.charcoal, fontSize: 12, fontWeight: 700 }}>
                  {fact}
                </span>
              ))}
            </div>

            {/* Short description */}
            {product.description && (
              <p style={{ fontSize: 14, color: T.medGray, lineHeight: 1.75, margin: '0 0 22px' }}>
                {product.description.length > 200
                  ? product.description.slice(0, product.description.lastIndexOf(' ', 200)) + '…'
                  : product.description}
              </p>
            )}

            <div style={{ marginBottom: 22, padding: '12px 0 0', borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 12, color: T.medGray }}>
                <span>Sold by <span style={{ color: T.charcoal, fontWeight: 800 }}>{storeName}</span></span>
                <span style={{ color: T.border }}>•</span>
                <span>Free delivery over ₦50k</span>
                <span style={{ color: T.border }}>•</span>
                <span>{returnPolicy?.rows?.[0]?.window || '30-day returns'}</span>
                {product.stores ? (
                  <>
                    <span style={{ color: T.border }}>•</span>
                    <a
                      href={`/store/${product.stores.slug || product.stores.id}`}
                      onMouseEnter={() => setVisitHov(true)} onMouseLeave={() => setVisitHov(false)}
                      style={{ color: visitHov ? T.green : T.charcoal, fontWeight: 700, textDecoration: 'none' }}
                    >
                      Visit store
                    </a>
                  </>
                ) : null}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: T.border, marginBottom: 20 }} />

            {/* Size + Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 }}>
              <OptionPills
                label="Size" options={sizeOptions} selected={selectedSize} onSelect={setSelectedSize}
                getAvailable={sz => !variants.length || variants.some(v => v.size === sz && (!selectedColor || v.color === selectedColor) && Number(v.stock_quantity) > 0)}
              />
              <OptionPills
                label="Color" options={colorOptions} selected={selectedColor} onSelect={setSelectedColor}
                getAvailable={cl => !variants.length || variants.some(v => v.color === cl && (!selectedSize || v.size === selectedSize) && Number(v.stock_quantity) > 0)}
              />
            </div>

            {/* Stock indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%',
                             background: effectiveStock > 10 ? T.green : effectiveStock > 0 ? '#F59E0B' : T.saleRed }} />
              <span style={{ fontSize: 12, fontWeight: 600,
                              color: effectiveStock > 10 ? T.green : effectiveStock > 0 ? '#D97706' : T.saleRed }}>
                {effectiveStock > 10 ? 'In Stock' : effectiveStock > 0 ? `Only ${effectiveStock} left` : 'Out of Stock'}
              </span>
            </div>

            {selectedVariantLabel && (
              <div style={{ marginBottom: 18, padding: '10px 12px', borderRadius: 12, background: '#FCFCFC', border: `1px solid ${T.border}` }}>
                <p style={{ margin: 0, fontSize: 12, color: T.medGray }}>
                  Selected variant
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 800, color: T.charcoal }}>
                  {selectedVariantLabel}
                </p>
              </div>
            )}

            {!selectedVariantLabel && requiresVariant && (
              <div style={{ marginBottom: 18, padding: '10px 12px', borderRadius: 12, background: T.saleBg, border: `1px solid #FECACA` }}>
                <p style={{ margin: 0, fontSize: 12, color: T.saleRed, fontWeight: 800 }}>
                  Choose your size and color to continue.
                </p>
              </div>
            )}

            <div style={{ marginBottom: 12, padding: '14px 16px', borderRadius: 16, border: `1px solid ${T.border}`, background: '#FCFCFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.charcoal, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quantity
                </span>
                <span style={{ fontSize: 12, color: T.medGray }}>
                  {quantity} × ₦{currentPrice?.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 13, color: T.medGray }}>Line total</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: T.charcoal }}>₦{bulkPricing.lineTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Qty + Add to cart */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }} className="flex-col lg:flex-row">
              <QuantityStepper quantity={quantity} setQuantity={setQuantity} max={effectiveStock || 1} />
              <button type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                onMouseEnter={() => setCartHov(true)} onMouseLeave={() => setCartHov(false)}
                className="hidden lg:flex"
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '0 24px', height: 48, borderRadius: 12, border: 'none', cursor: canAddToCart ? 'pointer' : 'not-allowed',
                  background: !canAddToCart ? T.softGray : addedAnim ? T.greenDeep : cartHov ? T.greenDark : T.green,
                  color: !canAddToCart ? T.mutedText : T.white, fontSize: 14, fontWeight: 800,
                  transition: 'background 0.18s', letterSpacing: '-0.01em',
                }}
              >
                {addedAnim ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
                {!canAddToCart
                  ? (requiresVariant && !selectedVariant ? 'Select Options' : 'Out of Stock')
                  : addedAnim ? 'Added!' : 'Add to Cart'}
              </button>
            </div>

            {bulkDiscountTiers.length > 0 ? (
              <div style={{ marginBottom: 22, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, background: '#FCFCFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.charcoal }}>Bulk pricing</p>
                  <span style={{ fontSize: 12, color: T.medGray }}>
                    Quantity {quantity} total: ₦{bulkPricing.lineTotal.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {bulkDiscountTiers.map((tier) => {
                    const isActiveTier = bulkPricing.appliedTier?.minimum_quantity === tier.minimum_quantity;
                    const tierPrice = calculateBulkPricing(product, tier.minimum_quantity).finalUnitPrice;
                    return (
                      <div
                        key={tier.minimum_quantity}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: `1px solid ${isActiveTier ? T.greenBorder : T.border}`,
                          background: isActiveTier ? T.greenTint : T.white,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.charcoal }}>
                          Buy {tier.minimum_quantity}+ pieces
                        </span>
                        <span style={{ fontSize: 13, color: isActiveTier ? T.greenDeep : T.medGray, fontWeight: 700 }}>
                          {tier.discount_percent}% off • ₦{tierPrice.toLocaleString()} each
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <SectionShortcutNav active={activeSection} onJump={jumpToSection} reviewCount={product.reviews?.length || 0} />

        <div className="lg:hidden" style={{ display: 'grid', gap: 12 }}>
          <div ref={(node) => { sectionRefs.current.overview = node; }}>
            <MobileSection
              id="overview"
              title="Overview"
              open={openMobileSection === 'overview'}
              onToggle={() => setOpenMobileSection((prev) => prev === 'overview' ? '' : 'overview')}
            >
              <OverviewPanel
                product={product}
                storeName={storeName}
                mediaFacts={mediaFacts}
                specificationPreview={specificationPreview}
                selectedVariantLabel={selectedVariantLabel}
                returnPolicy={returnPolicy}
              />
            </MobileSection>
          </div>

          <div ref={(node) => { sectionRefs.current.specifications = node; }}>
            <MobileSection
              id="specifications"
              title="Specifications"
              open={openMobileSection === 'specifications'}
              onToggle={() => setOpenMobileSection((prev) => prev === 'specifications' ? '' : 'specifications')}
            >
              {product.specifications ? (() => {
                const entries = typeof product.specifications === 'string'
                  ? product.specifications.split('\n').map((s, i) => [i, s])
                  : Array.isArray(product.specifications)
                    ? product.specifications.map((s, i) => [i, typeof s === 'object' ? s : { key: i, value: s }])
                    : Object.entries(product.specifications);
                return (
                  <div style={{ display: 'grid', gap: 0 }}>
                    {entries.map(([k, v], i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr',
                                            padding: '13px 0', borderBottom: i < entries.length - 1 ? `1px solid ${T.border}` : 'none', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: T.charcoal }}>
                          {typeof v === 'object' ? v.key : k}
                        </span>
                        <span style={{ fontSize: 13, color: T.medGray, lineHeight: 1.65 }}>
                          {typeof v === 'object' ? v.value : v}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })() : (
                <p style={{ color: T.mutedText, fontStyle: 'italic', fontSize: 14, margin: 0 }}>No specifications available.</p>
              )}
            </MobileSection>
          </div>

          <div ref={(node) => { sectionRefs.current.reviews = node; }}>
            <MobileSection
              id="reviews"
              title={`Reviews (${product.reviews?.length || 0})`}
              open={openMobileSection === 'reviews'}
              onToggle={() => setOpenMobileSection((prev) => prev === 'reviews' ? '' : 'reviews')}
            >
              <ReviewsTab product={product} user={user} supabase={supabase} onReviewAdded={handleReviewAdded} />
            </MobileSection>
          </div>

          <div ref={(node) => { sectionRefs.current.policies = node; }}>
            <MobileSection
              id="policies"
              title="Delivery & Returns"
              open={openMobileSection === 'policies'}
              onToggle={() => setOpenMobileSection((prev) => prev === 'policies' ? '' : 'policies')}
            >
              <ReturnPolicyTable policy={returnPolicy} />
            </MobileSection>
          </div>
        </div>

        {/* ── Tabs section ── */}
        <div style={{ marginTop: 48, border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden', background: T.white }} className="hidden lg:block lg:mt-16">
          <TabBar active={activeTab} setActive={setActiveTab} reviewCount={product.reviews?.length || 0} />

          <div style={{ padding: '24px 16px' }} className="sm:px-6 sm:py-7 lg:px-7 lg:py-8">
            {activeTab === 'overview' && (
              <OverviewPanel
                product={product}
                storeName={storeName}
                mediaFacts={mediaFacts}
                specificationPreview={specificationPreview}
                selectedVariantLabel={selectedVariantLabel}
                returnPolicy={returnPolicy}
              />
            )}

            {activeTab === 'specifications' && (
              <div>
                {product.specifications ? (() => {
                  const entries = typeof product.specifications === 'string'
                    ? product.specifications.split('\n').map((s, i) => [i, s])
                    : Array.isArray(product.specifications)
                      ? product.specifications.map((s, i) => [i, typeof s === 'object' ? s : { key: i, value: s }])
                      : Object.entries(product.specifications);
                  return (
                    <div style={{ display: 'grid', gap: 0, maxWidth: 600 }}>
                      {entries.map(([k, v], i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr',
                                              padding: '13px 0', borderBottom: i < entries.length - 1 ? `1px solid ${T.border}` : 'none', gap: 16 }}
                          className="sm:grid-cols-[140px_1fr]">
                          <span style={{ fontSize: 13, fontWeight: 700, color: T.charcoal }}>
                            {typeof v === 'object' ? v.key : k}
                          </span>
                          <span style={{ fontSize: 13, color: T.medGray }}>
                            {typeof v === 'object' ? v.value : v}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })() : (
                  <p style={{ color: T.mutedText, fontStyle: 'italic', fontSize: 14 }}>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab product={product} user={user} supabase={supabase} onReviewAdded={handleReviewAdded} />
            )}

            {activeTab === 'policies' && (
              <ReturnPolicyTable policy={returnPolicy} />
            )}
          </div>
        </div>
      </div>

      {/* ── Related + Recently Viewed ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 112px' }} className="lg:px-8 lg:pb-20">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <RelatedProducts
            currentProductId={product.id}
            categorySlug={product.categories?.[0]?.slug || null}
            storeId={product.stores?.id}
          />
          <RecentlyViewedProducts currentProductId={product.id} />
        </div>
      </div>

      <div
        className="lg:hidden"
        style={{
          position: 'fixed',
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 30,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.96)',
          border: `1px solid ${T.border}`,
          boxShadow: '0 16px 32px rgba(17,17,17,0.12)',
          backdropFilter: 'blur(14px)',
          padding: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: T.medGray, fontWeight: 700 }}>Ready to buy</p>
            <p style={{ margin: '2px 0 0', fontSize: 18, color: T.charcoal, fontWeight: 900 }}>₦{currentPrice?.toLocaleString()}</p>
            {selectedVariantLabel ? (
              <p style={{ margin: '2px 0 0', fontSize: 11, color: T.medGray }}>{selectedVariantLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            style={{
              flex: '0 0 auto',
              minWidth: 160,
              height: 46,
              border: 'none',
              borderRadius: 14,
              padding: '0 18px',
              fontSize: 13,
              fontWeight: 800,
              color: !canAddToCart ? T.mutedText : T.white,
              background: !canAddToCart ? T.softGray : addedAnim ? T.greenDeep : T.green,
              cursor: canAddToCart ? 'pointer' : 'not-allowed',
            }}
          >
            {!canAddToCart
              ? (requiresVariant && !selectedVariant ? 'Select options' : 'Out of stock')
              : addedAnim ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
