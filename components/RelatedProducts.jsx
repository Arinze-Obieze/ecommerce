"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import SectionCarousel from './SectionCarousel';

const RelatedProducts = ({ currentProductId, categorySlug, storeId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // Try fetching by category first if available
        let queryParams = new URLSearchParams({ limit: '10' });
        
        if (categorySlug) {
            queryParams.append('category', categorySlug);
        } else if (storeId) {
            queryParams.append('storeId', storeId);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          // Filter out the current product
          const filtered = json.data.filter(p => p.id !== currentProductId).slice(0, 8);
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
       setLoading(false); // Can't fetch without parameters
    }
  }, [currentProductId, categorySlug, storeId]);

  if (loading) {
    return (
        <SectionCarousel title="You Might Also Like">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 md:h-96 animate-pulse w-full border border-gray-100"></div>
             ))}
        </SectionCarousel>
    );
  }

  if (products.length === 0) return null;

  return (
    <SectionCarousel title="You Might Also Like">
        {products.map((product) => (
           <ProductCard key={product.id} product={product} /> 
        ))}
    </SectionCarousel>
  );
};

export default RelatedProducts;
