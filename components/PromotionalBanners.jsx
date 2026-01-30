"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

const PromotionalBanners = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
  
    useEffect(() => {
      const fetchDeals = async () => {
        try {
          // Fetch items with discounts, limit 3
          const res = await fetch('/api/products?hasDiscount=true&limit=3');
          const json = await res.json();
          if (json.success) {
            setDeals(json.data);
          }
        } catch (error) {
          console.error('Failed to fetch deals:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchDeals();
    }, []);

  return (
    <section className="py-12 bg-white mb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Upper Banners (2 Column) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Hot Deals Banner */}
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 group">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
             <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
             <div className="absolute inset-0 p-8 flex flex-col justify-center items-start">
               <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">HOT DEALS</h3>
               <p className="text-xl text-white/90 mb-6">UP TO 50% OFF</p>
               <Link href="/shop?hasDiscount=true">
                 <button className="px-6 py-2.5 bg-[#2E5C45] text-white font-medium rounded-lg hover:bg-[#254a38] transition-colors shadow-lg">
                   Shop Deals &gt;
                 </button>
               </Link>
             </div>
          </div>

          {/* Best Sellers Banner */}
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 group">
             <div className="absolute inset-0 bg-[#f0f4f1]"></div>
             <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center md:mask-gradient-left"></div>
             
             {/* Gradient Mask */}
             <div className="absolute inset-0 bg-gradient-to-r from-[#f0f4f1] via-[#f0f4f1]/80 to-transparent pointer-events-none"></div>

             <div className="absolute inset-0 p-8 flex flex-col justify-center items-start relative z-10">
               <h3 className="text-3xl md:text-4xl font-bold text-[#1a382b] mb-2">BEST SELLERS</h3>
               <Link href="/shop?sortBy=rating" className="flex items-center gap-1 text-gray-700 font-medium mb-6 hover:text-[#2E5C45]">
                  Shop Now <FiChevronRight />
               </Link>
               <Link href="/shop?sortBy=rating">
                <button className="px-6 py-2.5 bg-[#2E5C45] text-white font-medium rounded-lg hover:bg-[#254a38] transition-colors shadow-lg">
                    View All &gt;
                </button>
               </Link>
             </div>
          </div>

        </div>

        {/* Lower Deals Grid (3 Column) */}
        {!loading && deals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deals.map((item) => {
                const discountPercent = item.discount_price 
                ? Math.round(((item.price - item.discount_price) / item.price) * 100)
                : 0;

                return (
                <div key={item.id} className="bg-[#fcfbf9] rounded-xl p-6 flex items-center justify-between border border-gray-100 hover:border-[#2E5C45]/30 transition-colors">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">
                        {item.discount_price 
                            ? `₦${(item.discount_price).toLocaleString()}` 
                            : `₦${(item.price).toLocaleString()}`}
                    </span>
                    {discountPercent > 0 && (
                        <span className="text-xs font-bold text-white bg-[#2E5C45] px-1.5 py-0.5 rounded">-{discountPercent}%</span>
                    )}
                    </div>
                    {item.discount_price && (
                        <p className="text-xs text-gray-400 line-through mb-1">₦{(item.price).toLocaleString()}</p>
                    )}
                    
                    <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <FiCheckCircle className="text-[#2E5C45]" /> Verified Seller
                        </div>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                addToCart(item);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-[#2E5C45]/10 text-[#2E5C45] rounded-full hover:bg-[#2E5C45] hover:text-white transition-all shadow-sm"
                            title="Add to Cart"
                        >
                            <FiShoppingCart className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 ml-4">
                    <img src={item.image_urls?.[0] || 'https://placehold.co/400x400?text=No+Image'} alt={item.name} className="w-full h-full object-cover" />
                </div>
                </div>
            )})}
            </div>
        )}

      </div>
    </section>
  );
};

export default PromotionalBanners;
