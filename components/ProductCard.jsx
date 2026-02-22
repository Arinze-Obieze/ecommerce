"use client";
import React from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

const ProductCard = ({ product, layout = 'grid' }) => {
  const { addToCart } = useCart();
  
  // Calculate discount
  const discountPercent = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  return (
    <div className="group h-full flex flex-col bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="relative block shrink-0">
        {/* Aspect Ratio Container (3:4) */}
        <div className="aspect-3/4 overflow-hidden bg-gray-100 relative">
          <img 
            src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Overlays */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {product.is_featured && (
              <span className="bg-[#2E5C45] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                NEW
              </span>
            )}
            {discountPercent && (
               <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-1 line-clamp-1 font-medium">
             {product.categories?.[0]?.name || "Collection"}
          </p>
          <Link href={`/products/${product.slug}`}>
             <h3 className="text-gray-900 font-medium text-sm md:text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#2E5C45] transition-colors">
               {product.name}
             </h3>
          </Link>
          
          <div className="flex flex-col mb-3">
             <span className="font-bold text-gray-900 text-sm md:text-lg">
               ₦{(product.discount_price || product.price).toLocaleString()}
             </span>
             {product.discount_price && (
               <span className="text-xs text-gray-400 line-through">
                 ₦{product.price.toLocaleString()}
               </span>
             )}
          </div>
        </div>

        {/* Footer: Store Badge + Add to Cart Button */}
        <div className="flex items-center justify-between gap-2">
          {/* Store Badge */}
          {product.stores && (
            <Link href={`/store/${product.stores.slug || product.stores.id}`} onClick={(e) => e.stopPropagation()}>
              <span className="inline-block px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full line-clamp-1 transition-colors shrink-0">
                {product.stores.name}
              </span>
            </Link>
          )}

          {/* Action Button - Pill Shaped */}
          <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
              className="px-3 py-2 bg-[#2E5C45] text-white text-xs md:text-sm font-bold rounded-full hover:bg-[#254a38] transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
              <FiShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
