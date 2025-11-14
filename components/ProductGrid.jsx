'use client'

import { FiFilter } from 'react-icons/fi'
import ProductCard from './ProductCard'

export default function ProductGrid({ title = 'Products' }) {
  const products = [
    {
      id: 1,
      name: 'Samsung Galaxy S24 Ultra 512GB, AMOLED Display',
      price: 1299,
      originalPrice: 1399,
      image: 'https://images.unsplash.com/photo-1705920460730-6547e53e7eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: false,
      stockCount: 6,
      badge: { text: 'SAVE $100', color: 'green' }
    },
    {
      id: 2,
      name: 'Apple iPad Pro 12.9" M2 Chip, 1TB Storage',
      price: 1799,
      originalPrice: 1999,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 0, // Out of stock due to 0 stock count
      badge: { text: 'NEW', color: 'dark' }
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      price: 399,
      originalPrice: 449,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 3, // In stock
      badge: null
    },
    {
      id: 4,
      name: 'MacBook Pro 16" M3 Max, 64GB RAM, 4TB SSD',
      price: 4899,
      originalPrice: 5299,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: false,
      stockCount: 5, // Out of stock due to inStock: false
      badge: null
    },
    {
      id: 5,
      name: 'DJI Mavic 3 Pro Cine Premium Drone',
      price: 3299,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: false,
      stockCount: 0,
      badge: null
    },
    {
      id: 6,
      name: 'PlayStation 5 Pro Console + Extra Controller',
      price: 749,
      originalPrice: 899,
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 0,
      badge: { text: 'SOLD OUT', color: 'red' }
    },
    {
      id: 7,
      name: 'Canon EOS R5 Mirrorless Camera Body',
      price: 3899,
      originalPrice: 4299,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: false,
      stockCount: 2, // Out of stock due to inStock: false
      badge: null
    },
    {
      id: 8,
      name: 'Apple Watch Ultra 2 Titanium Case',
      price: 799,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1633469880917-0088e5332583?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 0,
      badge: null
    },
    {
      id: 9,
      name: 'Nintendo Switch OLED Model - White',
      price: 349,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: false,
      stockCount: 0,
      badge: { text: 'BACKORDER', color: 'orange' }
    },
    {
      id: 10,
      name: 'Bose QuietComfort Ultra Headphones',
      price: 429,
      originalPrice: 479,
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 8, // In stock
      badge: null
    },
    {
      id: 11,
      name: 'LG 65" OLED EVO C3 Series 4K Smart TV',
      price: 2199,
      originalPrice: 2599,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 0,
      badge: { text: 'LIMITED', color: 'blue' }
    },
    {
      id: 12,
      name: 'Xbox Series X 1TB Console - Diablo IV Bundle',
      price: 599,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1621259182978-fbf83296f7c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: false,
      stockCount: 1, // Out of stock due to inStock: false
      badge: null
    },
    {
      id: 13,
      name: 'iPhone 15 Pro Max 1TB',
      price: 1599,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484b67e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 15, // In stock
      badge: { text: 'HOT', color: 'red' }
    },
    {
      id: 14,
      name: 'Google Pixel 8 Pro',
      price: 999,
      originalPrice: 1099,
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      stockCount: 8, // In stock
      badge: null
    },
  ]

  // Show ALL products (remove the filter)
  const displayedProducts = products

  // Count out of stock products for the pagination text
  const outOfStockCount = products.filter(product => !product.inStock || product.stockCount === 0).length

  return (
    <section className="py-8 md:py-12 px-2">
      <div className="md:max-w-7xl mx-auto">
        {/* Header with Filter */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold">{title}</h2>
          <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold md:hidden">
            <FiFilter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {/* Products Grid - Show ALL products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 md:mt-12">
  {/* Results info - moves to top on mobile */}
  <span className="text-sm text-gray-600 text-center sm:text-left">
    Showing 1-{displayedProducts.length} of {displayedProducts.length} products
    <span className="block sm:inline"> ({outOfStockCount} out of stock)</span>
  </span>
  
  {/* Pagination buttons - simplified on mobile */}
  <div className="flex items-center gap-1 sm:gap-2">
    <button className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
      1
    </button>
    <button className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 rounded hover:bg-gray-100 hidden sm:block">
      2
    </button>
    <button className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 rounded hover:bg-gray-100 hidden sm:block">
      3
    </button>
    <span className="text-gray-600 hidden sm:inline">...</span>
    <button className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 rounded hover:bg-gray-100 hidden sm:block">
      4
    </button>
    <button className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 rounded hover:bg-gray-100">
      Next
    </button>
  </div>
</div>
</div>
    </section>
  )
}