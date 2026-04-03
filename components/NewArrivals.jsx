"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductImpressionTracker from './ProductImpressionTracker';
import SectionCarousel from './SectionCarousel';
import { getRecommendationRequestHeaders } from '@/utils/recommendationRequest';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?collection=new-arrivals&limit=8', {
          headers: getRecommendationRequestHeaders('new_arrivals'),
        });
        let json = await res.json();
        
        // Fallback if no collection data yet (or if the first request failed)
        if (!json.success || !json.data || json.data.length === 0) {
            const resFallback = await fetch('/api/products?sortBy=newest&limit=8', {
              headers: getRecommendationRequestHeaders('new_arrivals'),
            });
            json = await resFallback.json();
        }

        if (json.success) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
        <SectionCarousel title="New Arrivals">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 md:h-96 animate-pulse w-full"></div>
             ))}
        </SectionCarousel>
     )
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
            <ProductCard product={product} />
          </ProductImpressionTracker>
        ))}
    </SectionCarousel>
  );
};

export default NewArrivals;
