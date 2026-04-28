"use client";

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import SectionCarousel from '@/components/shared/SectionCarousel';
import { getRecommendedProducts } from '@/features/catalog/api/client';

const RecommendedForYou = ({ initialProducts = null }) => {
  const [products, setProducts] = useState(() => (Array.isArray(initialProducts) ? initialProducts : []));
  const [loading, setLoading] = useState(() => !Array.isArray(initialProducts));

  useEffect(() => {
    if (Array.isArray(initialProducts)) return undefined;

    let active = true;

    const load = async () => {
      try {
        const json = await getRecommendedProducts(10);
        if (!active) return;
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch recommended products:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [initialProducts]);

  if (loading) {
    return (
      <SectionCarousel title="Recommended For You" linkText="See More" linkHref="/shop?sortBy=smart">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl h-64 md:h-96 animate-pulse w-full border border-gray-100" />
        ))}
      </SectionCarousel>
    );
  }

  if (products.length === 0) return null;

  return (
    <SectionCarousel title="Recommended For You" linkText="See More" linkHref="/shop?sortBy=smart">
      {products.map((product, index) => (
        <ProductImpressionTracker
          key={product.id}
          product={product}
          surface="recommended_home"
          position={index + 1}
          metadata={{ sortStrategy: 'smart' }}
        >
          <ProductCard product={product} />
        </ProductImpressionTracker>
      ))}
    </SectionCarousel>
  );
};

export default RecommendedForYou;
