"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/contexts/cart/CartContext';
import { getPromotionalDeals } from '@/features/catalog/api/client';

const PromotionalBanners = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
  
    useEffect(() => {
      const fetchDeals = async () => {
        try {
          const json = await getPromotionalDeals(3);
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
    <section className="py-12 bg-white md:mb-20">
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
               <Link
                 href="/shop?hasDiscount=true"
                 className="inline-block px-6 py-2.5 bg-[#2E6417] text-white font-medium rounded-lg hover:bg-[#245213] transition-colors shadow-lg"
               >
                 Shop Deals &gt;
               </Link>
             </div>
          </div>

          {/* Best Stores Banner */}
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 group">
             <div className="absolute inset-0 bg-[#f0f4f1]"></div>
             <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center md:mask-gradient-left"></div>
             
             {/* Gradient Mask */}
             <div className="absolute inset-0 bg-linear-to-r from-[#f0f4f1] via-[#f0f4f1]/80 to-transparent pointer-events-none"></div>

             <div className="inset-0 p-8 flex flex-col justify-center items-start relative z-10">
               <h3 className="text-3xl md:text-4xl font-bold text-[#1a382b] mb-2">BEST SELLERS</h3>
               <Link href="/shop?sortBy=rating" className="flex items-center gap-1 text-gray-700 font-medium mb-6 hover:text-[#2E6417]">
                  Shop Now <FiChevronRight />
               </Link>
               <Link
                 href="/shop?sortBy=rating"
                 className="inline-block px-6 py-2.5 bg-[#2E6417] text-white font-medium rounded-lg hover:bg-[#245213] transition-colors shadow-lg"
               >
                 View All &gt;
               </Link>
             </div>
          </div>

        </div>

        {/* Lower Deals Grid (3 Column) */}
        {!loading && deals.length > 0 && (
          <>
            {/* Mobile: horizontal scroll to preserve vertical space */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-4 w-max">
                {deals.map((item) => {
                  const discountPercent = item.discount_price
                    ? Math.round(((item.price - item.discount_price) / item.price) * 100)
                    : 0;

                  return (
                    <div key={item.id} className="w-[86vw] max-w-[380px] bg-[#F5F1EA] rounded-xl p-5 flex items-center justify-between border border-gray-100">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1 truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">
                            {item.discount_price
                              ? `₦${(item.discount_price).toLocaleString()}`
                              : `₦${(item.price).toLocaleString()}`}
                          </span>
                          {discountPercent > 0 && (
                            <span className="text-xs font-bold text-white bg-[#2E6417] px-1.5 py-0.5 rounded">-{discountPercent}%</span>
                          )}
                        </div>
                        {item.discount_price && (
                          <p className="text-xs text-gray-400 line-through mb-1">₦{(item.price).toLocaleString()}</p>
                        )}

                        <div className="flex items-end justify-between mt-2">
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <FiCheckCircle className="text-[#2E6417]" /> Verified Store
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(item);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-[#2E6417]/10 text-[#2E6417] rounded-full"
                            title="Add to Cart"
                          >
                            <FiShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden shrink-0 ml-4">
                        <img src={item.image_urls?.[0] || 'https://placehold.co/400x400?text=No+Image'} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop/Tablet: 3-column grid */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {deals.map((item) => {
                const discountPercent = item.discount_price
                  ? Math.round(((item.price - item.discount_price) / item.price) * 100)
                  : 0;

                return (
                  <div key={item.id} className="bg-[#F5F1EA] rounded-xl p-6 flex items-center justify-between border border-gray-100 hover:border-[#2E6417]/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">
                          {item.discount_price
                            ? `₦${(item.discount_price).toLocaleString()}`
                            : `₦${(item.price).toLocaleString()}`}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-xs font-bold text-white bg-[#2E6417] px-1.5 py-0.5 rounded">-{discountPercent}%</span>
                        )}
                      </div>
                      {item.discount_price && (
                        <p className="text-xs text-gray-400 line-through mb-1">₦{(item.price).toLocaleString()}</p>
                      )}

                      <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <FiCheckCircle className="text-[#2E6417]" /> Verified Store
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(item);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-[#2E6417]/10 text-[#2E6417] rounded-full hover:bg-[#2E6417] hover:text-white transition-all shadow-sm"
                          title="Add to Cart"
                        >
                          <FiShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gray-200 overflow-hidden shrink-0 ml-4">
                      <img src={item.image_urls?.[0] || 'https://placehold.co/400x400?text=No+Image'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default PromotionalBanners;
