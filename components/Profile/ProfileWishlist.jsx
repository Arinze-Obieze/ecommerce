"use client";
import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';

export default function ProfileWishlist() {
  const { wishlistItems, isLoading: isWishlistLoading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistItems.size === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const ids = Array.from(wishlistItems).join(',');
        const res = await fetch(`/api/products?ids=${ids}&limit=100&includeOutOfStock=true`);
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
  }, [wishlistItems]);

  if (isWishlistLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
        <span className="text-gray-500">{wishlistItems.size} items</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Items you save will appear here.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2 bg-[#2E5C45] text-white rounded-lg font-medium hover:bg-[#254a38] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
