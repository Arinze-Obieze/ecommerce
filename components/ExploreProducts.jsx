"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiGrid } from 'react-icons/fi';
import ProductCard from './ProductCard';

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEME = {
  green:      '#00B86B',
  greenDark:  '#0F7A4F',
  greenTint:  '#EDFAF3',
  greenBorder:'#A8DFC4',
  charcoal:   '#111111',
  pageBg:     '#F9FAFB',
  white:      '#FFFFFF',
  border:     '#E8E8E8',
  medGray:    '#666666',
  mutedText:  '#999999',
  softGray:   '#F5F5F5',
};

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
  <div
    style={{
      background: THEME.white,
      borderRadius: 12,
      overflow: 'hidden',
      border: `1px solid ${THEME.border}`,
      animationDelay: `${delay}ms`,
    }}
    className="animate-pulse"
  >
    {/* Image placeholder */}
    <div style={{ background: THEME.softGray, aspectRatio: '3/4', width: '100%' }} />
    {/* Text placeholders */}
    <div style={{ padding: '10px 12px 12px' }}>
      <div style={{ height: 8, background: THEME.softGray, borderRadius: 4, marginBottom: 6, width: '60%' }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, marginBottom: 8, width: '85%' }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, marginBottom: 10, width: '45%' }} />
      <div style={{ height: 30, background: THEME.softGray, borderRadius: 8, width: '100%' }} />
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ExploreProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [linkHovered, setLinkHovered] = useState(false);
  const [ctaHovered,  setCtaHovered]  = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch('/api/products?limit=12');
        const json = await res.json();
        if (json.success) setProducts(json.data);
      } catch (err) {
        console.error('Failed to fetch explore products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Shared header ────────────────────────────────────────────────────────
  const SectionHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: THEME.green, borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.green }}>
          ZOVA Collection
        </span>
        <div style={{ width: 24, height: 2, background: THEME.green, borderRadius: 2 }} />
      </div>

      <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: THEME.charcoal, margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
        Explore Our Collection
      </h2>
      <p style={{ fontSize: 14, color: THEME.medGray, margin: '0 auto 18px', maxWidth: 440, lineHeight: 1.6 }}>
        Discover premium styles curated just for you.
      </p>

      <Link
        href="/shop"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 700,
          color: linkHovered ? THEME.greenDark : THEME.green,
          textDecoration: 'none',
          borderBottom: `1.5px solid ${linkHovered ? THEME.greenDark : THEME.green}`,
          paddingBottom: 2,
          transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={() => setLinkHovered(true)}
        onMouseLeave={() => setLinkHovered(false)}
      >
        Browse All Products
        <FiArrowRight
          size={13}
          style={{ transform: linkHovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s' }}
        />
      </Link>
    </div>
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section style={{ background: THEME.pageBg, padding: '56px 0' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 16px' }} className="sm:px-6 lg:px-8">
          <SectionHeader />
          {/*
            Grid: 2 cols mobile → 3 cols sm → 4 cols md → 5 cols lg
            Compact aspect-ratio cards to fit more per row
          */}
          <div
            style={{ display: 'grid', gap: 12 }}
            className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {[...Array(10)].map((_, i) => (
              <SkeletonCard key={i} delay={i * 50} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Loaded state ──────────────────────────────────────────────────────────
  return (
    <section style={{ background: THEME.pageBg, padding: '56px 0' }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 16px' }} className="sm:px-6 lg:px-8">
        <SectionHeader />

        {/*
          Grid: 2 cols mobile → 3 cols sm → 4 cols md → 5 cols lg
          Tighter gaps on mobile for a dense, browseable catalogue feel
        */}
        <div
          style={{ display: 'grid', gap: 12 }}
          className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-5"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{ marginTop: 44, textAlign: 'center' }}>
          <Link
            href="/shop"
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 32px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              color: ctaHovered ? THEME.white : THEME.charcoal,
              background: ctaHovered ? THEME.charcoal : THEME.white,
              border: `2px solid ${THEME.charcoal}`,
              textDecoration: 'none',
              transition: 'background 0.22s ease, color 0.22s ease',
              boxShadow: ctaHovered ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
            }}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
          >
            <FiGrid size={15} />
            Load More Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExploreProducts;