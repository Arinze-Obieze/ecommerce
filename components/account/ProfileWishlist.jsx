"use client";
import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/contexts/wishlist/WishlistContext';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import Link from 'next/link';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import { getWishlistProducts } from '@/features/catalog/api/client';

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

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="animate-pulse"
    style={{
      background: THEME.white,
      border: `1px solid ${THEME.border}`,
      borderRadius: 14,
      overflow: 'hidden',
      animationDelay: `${delay}ms`,
    }}
  >
    <div style={{ aspectRatio: '3/4', background: THEME.softGray }} />
    <div style={{ padding: '10px 14px 14px' }}>
      <div style={{ height: 8, background: THEME.softGray, borderRadius: 4, width: '55%', marginBottom: 8 }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, width: '80%', marginBottom: 10 }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, width: '40%', marginBottom: 12 }} />
      <div style={{ height: 32, background: THEME.softGray, borderRadius: 8 }} />
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProfileWishlist() {
  const { wishlistItems, isLoading: isWishlistLoading } = useWishlist();
  const [products, setProducts]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ctaHov, setCtaHov]       = useState(false);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistItems.size === 0) { setProducts([]); setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const json = await getWishlistProducts(Array.from(wishlistItems), 100);
        if (json.success) setProducts(json.data);
      } catch (err) {
        console.error('Failed to fetch wishlist products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlistItems]);

  if (isWishlistLoading) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText, margin: 0, marginBottom: 4 }}>
            My Account
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.025em' }}>
            Wishlist
          </h2>
        </div>

        {wishlistItems.size > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 700,
              background: THEME.greenTint,
              color: THEME.green,
              border: `1px solid ${THEME.greenBorder}`,
            }}
          >
            <FiHeart size={11} />
            {wishlistItems.size} {wishlistItems.size === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} delay={i * 60} />)}
        </div>
      ) : products.length > 0 ? (
        <div style={{ display: 'grid', gap: 14 }} className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductImpressionTracker
              key={product.id}
              product={product}
              surface="profile_wishlist"
              position={index + 1}
              metadata={{ sortStrategy: 'wishlist' }}
            >
              <ProductCard product={product} />
            </ProductImpressionTracker>
          ))}
        </div>
      ) : (
        /* ── Empty state ── */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            textAlign: 'center',
            background: THEME.white,
            border: `1.5px dashed ${THEME.border}`,
            borderRadius: 20,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: THEME.greenTint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <FiHeart size={24} style={{ color: THEME.green }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.charcoal, margin: 0, marginBottom: 6, letterSpacing: '-0.02em' }}>
            Your wishlist is empty
          </h3>
          <p style={{ fontSize: 13, color: THEME.mutedText, margin: '0 0 24px', maxWidth: 280, lineHeight: 1.6 }}>
            Save items you love and come back to them anytime.
          </p>
          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 24px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              background: ctaHov ? THEME.greenDark : THEME.green,
              color: THEME.white,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={() => setCtaHov(true)}
            onMouseLeave={() => setCtaHov(false)}
          >
            Start Shopping <FiArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
