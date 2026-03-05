"use client";
import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

const FeaturedCategories = () => {
  const cards = [
    {
      id: 1,
      title: 'Mood',
      subtitle: 'Express Your Vibe',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', // Fashion model
      link: '/category/mood',
      theme: 'dark'
    },
    {
      id: 2,
      title: 'Baby & Kids',
      subtitle: 'Comfort & Style',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop', // Baby
      link: '/category/kids',
      theme: 'light'
    },
    {
      id: 3,
      title: 'Men',
      subtitle: 'Fresh Looks & Trendy Styles',
      image: 'https://images.unsplash.com/photo-1488161628813-99c974fc5bce?q=80&w=1000&auto=format&fit=crop', // Men
      link: '/category/men',
      theme: 'dark'
    }
  ];

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 md:gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scbar-hide">
          {cards.map((card) => (
            <div key={card.id} className="relative group overflow-hidden rounded-2xl h-[300px] md:h-[400px] min-w-[280px] md:min-w-0 flex-shrink-0 snap-center md:snap-none w-[85%] md:w-auto">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-lg text-white/90 font-medium">{card.subtitle}</p>
                </div>
                
                <div>
                  <Link
                    href={card.link}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E5C45] text-white font-medium rounded-lg hover:bg-[#254a38] transition-colors shadow-lg backdrop-blur-sm bg-opacity-90"
                  >
                    Shop Now <FiChevronRight />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
