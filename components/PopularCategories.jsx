'use client'

import { FiSmartphone, FiTablet, FiWatch, FiHeadphones } from 'react-icons/fi'

export default function PopularCategories() {
  const categories = [
    { name: 'Phones', icon: FiSmartphone },
    { name: 'Tablets', icon: FiTablet },
    { name: 'Watches', icon: FiWatch },
    { name: 'Audio', icon: FiHeadphones }
  ]

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Popular Categories</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.name}
                className="flex flex-col items-center justify-center py-6 md:py-8 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={40} className="md:w-12 md:h-12" />
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-900">{category.name}</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
