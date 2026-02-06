"use client";
import React from 'react';
import Link from 'next/link';
import { FiChevronRight, FiUser, FiGithub, FiBox, FiBriefcase } from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';
// Using generic icons since specific ones like T-Shirt might not be in the standard fi package,
// but relying on the text structure mostly.

const CategoriesModal = () => {
  const { hierarchicalCategories, categoriesLoading } = useFilters();
  
  // Debug
  console.log('CategoriesModal - Loading:', categoriesLoading);
  console.log('CategoriesModal - Data:', hierarchicalCategories);

  if (categoriesLoading) {
      return (
        <div className="absolute top-full left-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-xl z-40 p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E5C45]"></div>
        </div>
      );
  }

  if (!hierarchicalCategories || hierarchicalCategories.length === 0) {
      return (
        <div className="absolute top-full left-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-xl z-40 p-8 flex justify-center text-gray-500">
            No categories found. Please run the database seed script.
        </div>
      );
  }

  return (
    <div className="absolute top-full left-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {hierarchicalCategories.map((cat, idx) => {
             // Map icons based on category name
             let icon = <FiBox className="w-5 h-5" />;
             if (cat.slug.includes('men')) icon = <FiUser className="w-5 h-5" />;
             if (cat.slug.includes('women')) icon = <FiUser className="w-5 h-5" />;
             if (cat.slug.includes('kids')) icon = <FiGithub className="w-5 h-5" />; // Placeholder
             if (cat.slug.includes('accessories')) icon = <FiBriefcase className="w-5 h-5" />;

             return (
            <div key={cat.id || idx} className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="text-gray-400">{icon}</span>
                <Link href={`/shop/${cat.slug}`} className="text-lg font-bold text-gray-900 hover:text-[#2E5C45] transition-colors">
                    {cat.name}
                </Link>
              </div>
              
              <div className="space-y-6">
                {cat.children && cat.children.map((group, groupIdx) => (
                  <div key={group.id || groupIdx}>
                    <Link href={`/shop/${group.slug}`} className="block text-sm font-bold text-gray-800 mb-3 hover:text-[#2E5C45]">
                        {group.name}
                    </Link>
                    <ul className="space-y-2">
                      {group.children && group.children.map((item, itemIdx) => (
                        <li key={item.id || itemIdx}>
                          <Link 
                            href={`/shop/${item.slug}`} 
                            className="text-sm text-gray-500 hover:text-[#2E5C45] hover:pl-1 transition-all flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100"></span>
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )})}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <Link href="/shop" className="px-8 py-2.5 bg-[#2E5C45] text-white font-medium rounded-lg hover:bg-[#254a38] transition-colors flex items-center gap-2">
                Shop All Categories <FiChevronRight />
            </Link>
        </div>
      </div>
    </div>
  );
};


export default CategoriesModal;
