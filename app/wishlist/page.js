"use client";
import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';

export default function WishlistPage() {
  const { wishlistItems, isLoading: isWishlistLoading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      // If no items, stop loading
      if (wishlistItems.size === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const ids = Array.from(wishlistItems).join(',');
        const res = await fetch(`/api/products?ids=${ids}&limit=100`); // Fetch all wishlist items
        const json = await res.json();
        
        if (json.success) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistItems]); // Re-fetch if wishlist items change (e.g. removed)

  if (isWishlistLoading) {
     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="w-full px-4 lg:px-8 py-8 max-w-[1600px] mx-auto">
        <div className="mb-8 border-b border-gray-100 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiHeart className="text-[#2E5C45] fill-[#2E5C45]" /> 
                My Wishlist
                <span className="text-lg font-normal text-gray-500 ml-2">({wishlistItems.size} items)</span>
            </h1>
        </div>

        {isLoading ? (
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse"></div>
             ))}
           </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FiHeart className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't saved any items yet.</p>
            <Link href="/shop">
              <button className="px-8 py-3 bg-[#2E5C45] text-white rounded-full font-medium hover:bg-[#254a38] transition-colors shadow-lg shadow-[#2E5C45]/20">
                Start Shopping
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
