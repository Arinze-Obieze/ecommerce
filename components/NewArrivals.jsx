"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import SectionCarousel from './SectionCarousel';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?collection=new-arrivals&limit=8');
        let json = await res.json();
        
        // Fallback
        if (json.data.length === 0) {
            const resFallback = await fetch('/api/products?sortBy=newest&limit=8');
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
        {products.map((product) => (
           <ProductCard key={product.id} product={product} /> 
        ))}
    </SectionCarousel>
  );
};

export default NewArrivals;
