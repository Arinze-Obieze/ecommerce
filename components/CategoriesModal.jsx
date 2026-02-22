"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiBox } from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';

/**
 * CategoriesModal - Card-based navigation using Material Design + Apple HIG
 *
 * Design Principles Applied:
 * 1. Material Design: Card-based hierarchy, clear elevation on interaction
 * 2. Apple HIG: Generous spacing, clear visual hierarchy, consistent transitions
 * 3. Nielsen's 10 Usability: Visibility of system status (selected category), user control
 * 4. JTBD Framework: Users want to find products by category efficiently
 */
const CategoriesModal = () => {
  const router = useRouter();
  const { hierarchicalCategories, categoriesLoading } = useFilters();
  const [selectedParentId, setSelectedParentId] = useState(null);

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
        No categories found.
      </div>
    );
  }

  // On first load, select the first category
  const activeParentId = selectedParentId ?? hierarchicalCategories[0]?.id;
  const selectedParent = hierarchicalCategories.find((cat) => cat.id === activeParentId);

  return (
    <div className="absolute top-full left-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT SIDEBAR: Top-Level Categories as Cards */}
          <div className="lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">
              Categories
            </p>
            <div className="space-y-2 flex flex-col lg:flex-col">
              {hierarchicalCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedParentId(cat.id)}
                  className={`relative w-full px-4 py-3.5 rounded-xl text-left transition-all duration-200 flex items-start justify-between group ${
                    activeParentId === cat.id
                      ? 'bg-[#2E5C45] text-white shadow-lg shadow-[#2E5C45]/20'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm line-clamp-2 ${
                        activeParentId === cat.id ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {cat.name}
                    </p>
                    {/* Item count badge */}
                    {cat.children && cat.children.length > 0 && (
                      <p
                        className={`text-xs mt-1 ${
                          activeParentId === cat.id ? 'text-green-100' : 'text-gray-500'
                        }`}
                      >
                        {cat.children.length} subcategories
                      </p>
                    )}
                  </div>
                  <FiChevronRight
                    className={`w-4 h-4 shrink-0 ml-2 transition-transform duration-200 ${
                      activeParentId === cat.id
                        ? 'text-white translate-x-1'
                        : 'text-gray-400 group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* "Shop All" Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/shop"
                className="block w-full px-4 py-3 bg-[#2E5C45] text-white font-semibold text-sm rounded-xl hover:bg-[#254a38] transition-all text-center shadow-md hover:shadow-lg"
              >
                Shop All <FiChevronRight className="inline w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* RIGHT CONTENT: Dynamic Subcategories and Sub-subcategories */}
          <div className="lg:col-span-4">
            {selectedParent && selectedParent.children && selectedParent.children.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedParent.name}</h2>
                  {selectedParent.description && (
                    <p className="text-sm text-gray-500 ml-auto">{selectedParent.description}</p>
                  )}
                </div>

                {/* Grid of subcategories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedParent.children.map((group) => (
                    <div
                      key={group.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/shop?category=${encodeURIComponent(group.slug)}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/shop?category=${encodeURIComponent(group.slug)}`);
                        }
                      }}
                      className="group/card text-left p-4 rounded-xl bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-[#2E5C45] hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      {/* Subcategory Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900 group-hover/card:text-[#2E5C45] transition-colors flex-1">
                          {group.name}
                        </h3>
                        <FiChevronRight className="w-5 h-5 text-gray-400 group-hover/card:text-[#2E5C45] shrink-0 ml-2 transition-all group-hover/card:translate-x-1" />
                      </div>

                      {/* Sub-subcategories (Items under each group) */}
                      {group.children && group.children.length > 0 && (
                        <ul className="space-y-2">
                          {group.children.slice(0, 4).map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/shop?category=${encodeURIComponent(item.slug)}`);
                                }}
                                className="text-sm text-gray-600 hover:text-[#2E5C45] flex items-center gap-1.5 transition-colors group/item"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-[#2E5C45] transition-colors shrink-0"></span>
                                <span className="line-clamp-1">{item.name}</span>
                              </button>
                            </li>
                          ))}
                          {group.children.length > 4 && (
                            <li>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/shop?category=${encodeURIComponent(group.slug)}`);
                                }}
                                className="text-xs font-semibold text-[#2E5C45] hover:underline mt-2"
                              >
                                +{group.children.length - 4} more
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-center">
                <div>
                  <FiBox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No subcategories available</p>
                  <p className="text-sm text-gray-400 mt-2">Select another category to explore products</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesModal;
