'use client'

import { FiCheck } from 'react-icons/fi'
import Image from 'next/image'

export default function ProductCard({ product, badge }) {
  const { image, name, price, originalPrice, inStock, stockCount, badge: productBadge } = product

  // Consider out of stock if inStock is false OR stockCount is 0
  const isOutOfStock = !inStock || stockCount === 0

  return (
    <div className={`product-card ${isOutOfStock ? 'opacity-75' : ''}`}>
      {/* Image Container */}
      <div className="relative bg-gray-100 h-48 md:h-56 overflow-hidden">
        <Image 
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Badge */}
        {productBadge && (
          <div className={`absolute top-3 right-3 badge-${productBadge.color}`}>
            {productBadge.text}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 md:p-5">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
          {name}
        </h3>

        {/* Price Section */}
        <div className="mb-3">
          {originalPrice ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-bold text-blue-600">${price.toFixed(2)}</span>
                <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 mb-4">
          {isOutOfStock ? (
            <>
              {stockCount === 0 ? (
                <span className="text-xs md:text-sm text-red-600 font-semibold">Out of Stock (0 left)</span>
              ) : (
                <span className="text-xs md:text-sm text-red-600 font-semibold">Out of Stock</span>
              )}
            </>
          ) : (
            <>
              <FiCheck size={16} className="text-green-500" />
              <span className="text-xs md:text-sm text-green-600 font-semibold">
                In Stock {stockCount && `(${stockCount} left)`}
              </span>
            </>
          )}
        </div>

        {/* CTA Button */}
        {isOutOfStock ? (
          <button 
            className="w-full bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors text-sm md:text-base cursor-not-allowed"
            disabled
          >
            Out of Stock
          </button>
        ) : (
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm md:text-base">
            Add to Cart
          </button>
        )}
      </div>
    </div>
  )
}