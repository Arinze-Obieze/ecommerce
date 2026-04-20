"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import SectionCarousel from '@/components/shared/SectionCarousel';
import { getBestSellerProducts } from '@/features/catalog/api/client';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const json = await getBestSellerProducts(8);

        if (json.success) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch best sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <SectionCarousel title="Best Sellers">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[#F5F5F5] rounded-xl overflow-hidden w-full"
            style={{
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${i * 150}ms`,
            }}
          >
            <div className="aspect-square bg-[#E8E8E8] w-full" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-[#E0E0E0] rounded w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-[#E0E0E0] rounded w-3/4" />
                <div className="h-4 bg-[#E0E0E0] rounded w-1/2" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-2">
                  <div className="h-4 bg-[#E0E0E0] rounded w-16" />
                  <div className="h-3 bg-[#E8E8E8] rounded w-12" />
                </div>
                <div className="h-8 bg-[#E0E0E0] rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </SectionCarousel>
    );
  }

  if (products.length === 0) return null;

  return (
    <SectionCarousel
      title="Best Sellers"
      linkText="View All"
      linkHref="/shop?collection=best-sellers"
    >
      {products.map((product, index) => (
        <ProductImpressionTracker
          key={product.id}
          product={product}
          surface="best_sellers"
          position={index + 1}
          metadata={{ sortStrategy: 'smart' }}
        >
          <ProductCard
            product={product}
            source="best_sellers"
            position={index + 1}
          />
        </ProductImpressionTracker>
      ))}
    </SectionCarousel>
  );
};

export default BestSellers;
