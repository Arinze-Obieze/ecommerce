"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

const ExploreProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch more for explore (12 items)
        const res = await fetch('/api/products?limit=12');
        const json = await res.json();
        if (json.success) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch explore products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-[#f8f5f2]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col items-center text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Explore Our Collection</h2>
              <div className="w-24 h-1 bg-gray-200 rounded-full"></div>
           </div>
           {/* Loading Skeleton matching 2-col mobile layout */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 md:h-80 animate-pulse"></div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#f8f5f2]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Header */}
        <div className="flex flex-col items-center text-center mb-12">
           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Explore Our Collection</h2>
           <p className="text-gray-500 max-w-2xl mb-6">Discover our wide range of premium products curated just for you.</p>
           <Link href="/shop" className="group flex items-center gap-2 text-[#2E5C45] font-semibold border-b border-[#2E5C45] pb-0.5 hover:text-[#254a38] transition-colors">
              Browse All Products <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

        {/* Grid - FORCE 2 columns on mobile (grid-cols-2) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-6">
          {products.map((product) => (
             <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-12 text-center">
            <Link href="/shop">
                <button className="px-10 py-3.5 bg-transparent border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300">
                    Load More Products
                </button>
            </Link>
        </div>

      </div>
    </section>
  );
};

export default ExploreProducts;
