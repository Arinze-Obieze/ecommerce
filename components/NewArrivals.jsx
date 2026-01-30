"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?sortBy=newest&limit=4');
        const json = await res.json();
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
      <section className="py-12 bg-[#f8f5f2]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm h-80 animate-pulse"></div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-[#f8f5f2]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
          <Link href="/shop?sortBy=newest" className="flex items-center gap-1 text-[#2E5C45] font-medium hover:underline">
            View All <FiChevronRight />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
             // Calculate discount percentage if needed
             const discountPercent = product.discount_price 
                ? Math.round(((product.price - product.discount_price) / product.price) * 100)
                : null;
             
             return (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group h-full">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={product.image_urls?.[0] || 'https://placehold.co/400x400?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* We assume these are new arrivals since we sorted by newest */}
                  <span className="absolute top-3 left-3 bg-[#2E5C45] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    New
                  </span>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="text-gray-900 font-medium mb-1 truncate">{product.name}</h3>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-gray-900">
                            {product.discount_price 
                              ? `₦${(product.discount_price).toLocaleString()}` 
                              : `₦${(product.price).toLocaleString()}`}
                        </span>
                        {product.discount_price && (
                          <span className="text-sm text-gray-400 line-through">
                              ₦{(product.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FiCheckCircle className="text-[#2E5C45]" />
                        <span>Verified Seller</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-[#2E5C45]/10 text-[#2E5C45] rounded-full hover:bg-[#2E5C45] hover:text-white transition-all shadow-sm"
                      title="Add to Cart"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          )})}
        </div>

      </div>
    </section>
  );
};

export default NewArrivals;
