"use client";
// ── New Arrivals fetch strategy ──────────────────────────────────────────────
// Primary:  collection=new-arrivals + sortBy=reviewed_at
//   → API filters products where reviewed_at is within the last 14 days
//     AND moderation_status = 'approved', sorted newest-approved first.
//   → Uses reviewed_at (not created_at) so the clock starts when the product
//     becomes publicly visible, not when the seller first uploaded it.
//
// Fallback: sortBy=reviewed_at (no 14-day window)
//   → Kicks in when no products have been reviewed in the last 14 days
//     (e.g. early-stage store with low activity). Shows the most recently
//     approved products regardless of age so the section is never empty.
// ────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import SectionCarousel from '@/components/shared/SectionCarousel';
import { getNewArrivalProducts } from '@/features/catalog/api/client';

const NewArrivals = ({ initialProducts = null }) => {
  const [products, setProducts] = useState(() => (Array.isArray(initialProducts) ? initialProducts : []));
  const [loading, setLoading]   = useState(() => !Array.isArray(initialProducts));

  useEffect(() => {
    if (Array.isArray(initialProducts)) return undefined;

    let active = true;

    const fetchProducts = async () => {
      try {
        const json = await getNewArrivalProducts(8);
        if (active && json.success) setProducts(json.data);
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [initialProducts]);

  if (loading) {
    return (
      <SectionCarousel title="New Arrivals">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-64 md:h-96 animate-pulse w-full" />
        ))}
      </SectionCarousel>
    );
  }

  return (
    <SectionCarousel title="New Arrivals" linkText="View All" linkHref="/shop?sortBy=newest">
      {products.map((product, index) => (
        <ProductImpressionTracker
          key={product.id}
          product={product}
          surface="new_arrivals"
          position={index + 1}
          metadata={{ sortStrategy: 'smart' }}
        >
          {/*
            source="new_arrivals" — tells the ranking engine where this
              cart_add or click came from.
            position={index + 1} — 1-based slot so you can later analyse
              whether slot 1 converts better than slot 5.
          */}
          <ProductCard
            product={product}
            source="new_arrivals"
            position={index + 1}
          />
        </ProductImpressionTracker>
      ))}
    </SectionCarousel>
  );
};

export default NewArrivals;
