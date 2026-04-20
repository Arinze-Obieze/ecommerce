"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import SectionCarousel from '@/components/shared/SectionCarousel';
import { getRelatedProducts } from '@/features/catalog/api/client';

const RelatedProducts = ({ currentProductId, categorySlug, storeId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const json = await getRelatedProducts({ categorySlug, storeId, limit: 10 });

        if (json.success && json.data) {
          const filtered = json.data
            .filter(p => p.id !== currentProductId)
            .slice(0, 8);
          setProducts(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug || storeId) {
      fetchRelated();
    } else {
      setLoading(false);
    }
  }, [currentProductId, categorySlug, storeId]);

  if (loading) {
    return (
      <SectionCarousel title="You Might Also Like">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl h-64 md:h-96 animate-pulse w-full border border-gray-100"
          />
        ))}
      </SectionCarousel>
    );
  }

  if (products.length === 0) return null;

  return (
    <SectionCarousel title="You Might Also Like">
      {products.map((product, index) => (
        <ProductImpressionTracker
          key={product.id}
          product={product}
          surface="related_products"
          position={index + 1}
          metadata={{ sortStrategy: 'smart' }}
        >
          <ProductCard
            product={product}
            source="related_products"
            position={index + 1}
          />
        </ProductImpressionTracker>
      ))}
    </SectionCarousel>
  );
};

export default RelatedProducts;
