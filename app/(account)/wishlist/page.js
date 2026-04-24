"use client";
import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/contexts/wishlist/WishlistContext';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import Link from 'next/link';
import { FiHeart, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { getRecommendationRequestHeaders } from '@/utils/catalog/recommendation-request';

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

const SkeletonCard = ({ delay = 0 }) => (
  <div className="animate-pulse" style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: 'hidden', animationDelay: `${delay}ms` }}>
    <div style={{ aspectRatio: '3/4', background: THEME.softGray }} />
    <div style={{ padding: '10px 14px 14px' }}>
      <div style={{ height: 8,  background: THEME.softGray, borderRadius: 4, width: '55%', marginBottom: 8 }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, width: '80%', marginBottom: 8 }} />
      <div style={{ height: 11, background: THEME.softGray, borderRadius: 4, width: '40%', marginBottom: 12 }} />
      <div style={{ height: 32, background: THEME.softGray, borderRadius: 8 }} />
    </div>
  </div>
);

export default function WishlistPage() {
  const { wishlistItems, isLoading: isWishlistLoading } = useWishlist();
  const [products, setProducts]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ctaHov, setCtaHov]       = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      if (wishlistItems.size === 0) { setProducts([]); setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const ids  = Array.from(wishlistItems).join(',');
        const res  = await fetch(`/api/products?ids=${ids}&limit=100&includeOutOfStock=true`, {
          headers: getRecommendationRequestHeaders('wishlist_page'),
        });
        const json = await res.json();
        if (json.success) setProducts(json.data);
      } catch (e) {
        console.error('Failed to fetch wishlist products:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch_();
  }, [wishlistItems]);

  if (isWishlistLoading) return null;

  return (
    <div style={{ minHeight: '100vh', background: THEME.white }}>
      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 24px 80px' }} className="lg:px-8">

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36, paddingBottom: 24, borderBottom: `1px solid ${THEME.border}` }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText, margin: 0, marginBottom: 4 }}>
              My Account
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: 10 }}>
              Wishlist
            </h1>
          </div>

          {wishlistItems.size > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: THEME.greenTint, color: THEME.green, border: `1px solid ${THEME.greenBorder}` }}>
              <FiHeart size={13} />
              {wishlistItems.size} {wishlistItems.size === 1 ? 'item' : 'items'} saved
            </span>
          )}
        </div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} delay={i * 60} />)}
          </div>

        /* ── Products ── */
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {products.map((product, index) => (
              <ProductImpressionTracker
                key={product.id}
                product={product}
                surface="wishlist_page"
                position={index + 1}
                metadata={{ sortStrategy: 'wishlist' }}
              >
                <ProductCard product={product} />
              </ProductImpressionTracker>
            ))}
          </div>

        /* ── Empty state ── */
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', background: THEME.pageBg, border: `1.5px dashed ${THEME.border}`, borderRadius: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: THEME.greenTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FiHeart size={26} style={{ color: THEME.green }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.charcoal, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Your wishlist is empty
            </h2>
            <p style={{ fontSize: 14, color: THEME.mutedText, margin: '0 0 28px', maxWidth: 320, lineHeight: 1.7 }}>
              Tap the heart on any product to save it here and come back whenever you're ready.
            </p>
            <Link
              href="/shop"
              onMouseEnter={() => setCtaHov(true)}
              onMouseLeave={() => setCtaHov(false)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: THEME.white, background: ctaHov ? THEME.greenDark : THEME.green, textDecoration: 'none', transition: 'background 0.2s' }}
            >
              <FiShoppingBag size={15} /> Start Shopping
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
