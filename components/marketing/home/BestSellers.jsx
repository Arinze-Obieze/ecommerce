"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import SectionCarousel from '@/components/shop/SectionCarousel';
import { getRecommendationRequestHeaders } from '@/utils/recommendationRequest';

const THEME = {
  colors: {
    primary: '#00B86B',
    primaryHover: '#0F7A4F',
    deepEmerald: '#0A3D2E',
    white: '#FFFFFF',
    pageBg: '#F9FAFB',
    softGray: '#F5F5F5',
    darkCharcoal: '#111111',
    mediumGray: '#666666',
    mutedText: '#888888',
    border: '#F0F0F0',
    cardBorder: '#EFEFEF',
    saleRed: '#E53935',
    trendingOrange: '#EA580C',
    starYellow: '#F59E0B',
    whatsappGreen: '#25D366',
  },
  shadows: {
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  transitions: {
    default: 'all 0.2s ease',
  }
};

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try fetching by collection first, fallback to rating
        // For now using collection=best-sellers
        const res = await fetch('/api/products?collection=best-sellers&limit=8', {
          headers: getRecommendationRequestHeaders('best_sellers'),
        });
        let json = await res.json();
        
        // Fallback if no collection data yet (or if the first request failed)
        if (!json.success || !json.data || json.data.length === 0) {
            const resFallback = await fetch('/api/products?sortBy=rating&limit=8', {
              headers: getRecommendationRequestHeaders('best_sellers'),
            });
            json = await resFallback.json();
        }

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
              animationDelay: `${i * 150}ms`
            }}
          >
            {/* Image skeleton */}
            <div className="aspect-square bg-[#E8E8E8] w-full" />
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Store name line */}
              <div className="h-3 bg-[#E0E0E0] rounded w-1/3" />
              
              {/* Product title lines */}
              <div className="space-y-2">
                <div className="h-4 bg-[#E0E0E0] rounded w-3/4" />
                <div className="h-4 bg-[#E0E0E0] rounded w-1/2" />
              </div>
              
              {/* Price and button row */}
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
          <ProductCard product={product} />
        </ProductImpressionTracker>
      ))}
    </SectionCarousel>
  );
};

export default BestSellers;
