"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductImpressionTracker from './ProductImpressionTracker';
import SectionCarousel from './SectionCarousel';
import { getRecommendationRequestHeaders } from '@/utils/recommendationRequest';

const RecentlyViewedProducts = ({ currentProductId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const storedViews = JSON.parse(localStorage.getItem('recently_viewed_products')) || [];
        
        // Remove current product and keep latest 10
        const idsToFetch = storedViews
          .filter(id => id !== currentProductId)
          .slice(0, 10);

        if (idsToFetch.length === 0) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/products?ids=${idsToFetch.join(',')}&limit=10`, {
          headers: getRecommendationRequestHeaders('recently_viewed'),
        });
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          // Sort fetched products to match the recency order in storedViews
          const sorted = [...json.data].sort((a, b) => {
             return idsToFetch.indexOf(a.id) - idsToFetch.indexOf(b.id);
          });
          setProducts(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch recently viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [currentProductId]);

  if (loading) {
    return (
        <SectionCarousel title="Recently Viewed">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 md:h-96 animate-pulse w-full border border-gray-100"></div>
             ))}
        </SectionCarousel>
    );
  }

  if (products.length === 0) return null;

  return (
    <SectionCarousel title="Recently Viewed">
        {products.map((product, index) => (
          <ProductImpressionTracker
            key={product.id}
            product={product}
            surface="recently_viewed"
            position={index + 1}
            metadata={{ sortStrategy: 'recent_history' }}
          >
            <ProductCard product={product} />
          </ProductImpressionTracker>
        ))}
    </SectionCarousel>
  );
};

export default RecentlyViewedProducts;
