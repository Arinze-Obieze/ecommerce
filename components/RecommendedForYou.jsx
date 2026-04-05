"use client";

import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import ProductImpressionTracker from './ProductImpressionTracker';
import SectionCarousel from './SectionCarousel';
import { getRecommendationRequestHeaders } from '@/utils/recommendationRequest';

const RecommendedForYou = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const params = new URLSearchParams({
          limit: '10',
          sortBy: 'smart',
        });

        const res = await fetch(`/api/products?${params.toString()}`, {
          headers: getRecommendationRequestHeaders('recommended_home'),
        });
        const json = await res.json();
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
  }, []);

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
