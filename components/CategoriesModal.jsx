"use client";
import React from 'react';
import Link from 'next/link';
import { FiChevronRight, FiUser, FiGithub, FiBox, FiBriefcase } from 'react-icons/fi';
// Using generic icons since specific ones like T-Shirt might not be in the standard fi package,
// but relying on the text structure mostly.

const CategoriesModal = () => {
  const categories = [
    {
      title: 'Men',
      icon: <FiUser className="w-5 h-5" />,
      groups: [
        {
          title: 'Clothing',
          items: [
            'T-Shirts & Polos', 'Shirts (Casual / Formal)', 'Trousers & Chinos',
            'Native Wear (Kaftan, Senator)', 'Hoodies & Jackets'
          ]
        },
        {
          title: 'Footwear',
          items: [
            'Corporate Shoes', 'Loafers', 'Brogues & Oxfords',
            'Sneakers', 'Sandals & Slippers', 'Boots'
          ]
        }
      ]
    },
    {
      title: 'Women',
      icon: <FiUser className="w-5 h-5" />, 
      groups: [
        {
          title: 'Clothing',
          items: [
            'Dresses & Gowns', 'Tops & Blouses', 'Skirts & Trousers',
            'Native Wear (Ankara, Lace)', 'Two-Piece Sets'
          ]
        },
        {
          title: 'Footwear',
          items: [
            'Heels', 'Flats & Ballerinas', 'Sandals',
            'Sneakers', 'Wedges'
          ]
        }
      ]
    },
    {
      title: 'Kids',
      icon: <FiGithub className="w-5 h-5" />, // Placeholder icon
      groups: [
        {
          title: 'Boys\' Fashion',
          items: [
            'T-Shirts & Polos', 'Jeans & Trousers', 'Sets',
            'Sneakers', 'Sandals'
          ]
        },
        {
          title: 'Girls\' Fashion',
          items: [
            'Dresses', 'Tops & Skirts', 'Sets',
            'Ballerinas', 'Sandals'
          ]
        },
        {
          title: 'School Shop',
          items: [
             'Backpacks', 'Lunch Boxes', 'School Shoes', 'Uniforms'
          ]
        }
      ]
    },
    {
      title: 'Accessories',
      icon: <FiBriefcase className="w-5 h-5" />,
      groups: [
        {
          title: 'General',
          items: [
            'Sunglasses', 'Scarves & Shawls', 'Caps & Hats',
            'Watches', 'Jewelry'
          ]
        },
        {
          title: 'Bags & Luggage',
          items: [
             'Handbags', 'Tote Bags', 'Crossbody Bags',
             'Laptop Bags', 'Travel Boxes', 'Duffel Bags'
          ]
        }
      ]
    }
  ];

  return (
    <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="text-gray-400">{cat.icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{cat.title}</h3>
              </div>
              
              <div className="space-y-6">
                {cat.groups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h4 className="text-sm font-bold text-gray-800 mb-3">{group.title}</h4>
                    <ul className="space-y-2">
                      {group.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link 
                            href="#" 
                            className="text-sm text-gray-500 hover:text-[#2E5C45] hover:pl-1 transition-all flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100"></span>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <button className="px-8 py-2.5 bg-[#2E5C45] text-white font-medium rounded-lg hover:bg-[#254a38] transition-colors flex items-center gap-2">
                Shop All Categories <FiChevronRight />
            </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesModal;
