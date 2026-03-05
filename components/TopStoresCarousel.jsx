"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiStar, FiUsers, FiCheckCircle } from 'react-icons/fi';
import SectionCarousel from './SectionCarousel';

const TopStoresCarousel = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStores = async () => {
      try {
        const res = await fetch('/api/stores/top?limit=8');
        const json = await res.json();
        
        if (json.success) {
          setStores(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch top stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStores();
  }, []);

  if (loading) {
     return (
        <SectionCarousel title="Top Stores">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 md:h-72 border border-gray-100 animate-pulse w-full"></div>
             ))}
        </SectionCarousel>
     )
  }

  if (stores.length === 0) return null;

  return (
    <SectionCarousel title="Top Rated Stores" linkText="View All Stores" linkHref="/stores">
      {stores.map((store) => (
         <div key={store.id} className="h-full">
            <Link href={`/store/${store.slug}`} className="block h-full bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">{store.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 truncate group-hover:text-[#2E5C45] transition-colors">{store.name}</h3>
                        {store.kyc_status === 'verified' && (
                          <FiCheckCircle className="text-blue-500 w-4 h-4 shrink-0" title="Verified Store" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">{store.description || 'Welcome to our store. We offer high quality products.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs md:text-sm">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                        <FiStar className="text-yellow-600 w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
                      </div>
                      <span className="font-semibold text-gray-900">{store.rating || 'New'}</span>
                      {store.rating && <span className="text-gray-500 hidden sm:inline">Rating</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                      <FiUsers className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{store.followers || 0}</span>
                      <span className="hidden sm:inline">Followers</span>
                    </div>
                  </div>
                </div>
            </Link>
         </div>
      ))}
    </SectionCarousel>
  );
};

export default TopStoresCarousel;
