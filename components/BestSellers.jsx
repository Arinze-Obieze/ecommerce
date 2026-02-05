"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import SectionCarousel from './SectionCarousel';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try fetching by collection first, fallback to rating
        // For now using collection=best-sellers
        const res = await fetch('/api/products?collection=best-sellers&limit=8');
        let json = await res.json();
        
        // Fallback if no collection data yet
        if (json.data.length === 0) {
            const resFallback = await fetch('/api/products?sortBy=rating&limit=8');
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
                <div key={i} className="bg-gray-50 rounded-xl h-64 md:h-96 animate-pulse w-full"></div>
             ))}
        </SectionCarousel>
     )
  }

  if (products.length === 0) return null;

  return (
    <SectionCarousel title="Best Sellers" linkText="View All" linkHref="/shop?collection=best-sellers">
      {products.map((product) => (
         <ProductCard key={product.id} product={product} />
      ))}
    </SectionCarousel>
  );
};

export default BestSellers;
