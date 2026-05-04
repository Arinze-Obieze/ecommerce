'use client';

import { useState } from 'react';
import BestSellers from './BestSellers';
import NewArrivals from './NewArrivals';
import RecommendedForYou from './RecommendedForYou';

export default function TrendingProductsGrid({ bestSellers, newArrivals, recommended }) {
  const [activeTab, setActiveTab] = useState('best-sellers');

  const tabs = [
    { id: 'best-sellers', label: 'Best Sellers', component: <BestSellers initialProducts={bestSellers} isTabbed={true} /> },
    { id: 'new-arrivals', label: 'New Arrivals', component: <NewArrivals initialProducts={newArrivals} isTabbed={true} /> },
    { id: 'recommended', label: 'Recommended', component: <RecommendedForYou initialProducts={recommended} isTabbed={true} /> },
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:mb-10 md:flex-row">
          <h2 className="text-2xl font-bold tracking-tight text-(--zova-ink) md:text-3xl">
            Trending Now
          </h2>
          
          <div className="flex w-full items-center gap-2 overflow-x-auto rounded-full bg-(--zova-linen) p-1.5 md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-(--zova-ink) shadow-sm'
                    : 'text-(--zova-muted) hover:text-(--zova-ink)'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </section>
  );
}
