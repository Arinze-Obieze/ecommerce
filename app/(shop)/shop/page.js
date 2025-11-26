"use client"

import { useState } from "react"
import {  FiX, FiFilter } from "react-icons/fi"

const products = [
  { id: 1, name: "Cotton T-Shirt", price: 29.99, sold: 520, image: "/cotton-t-shirt-women-fashion.jpg" },
  { id: 2, name: "Leggings", price: 39.99, sold: 480, image: "/women-leggings-fashion.jpg" },
  { id: 3, name: "Summer Dress", price: 49.99, sold: 350, image: "/summer-dress-women.jpg" },
  { id: 4, name: "Denim Jacket", price: 79.99, sold: 290, image: "/denim-jacket-women.png" },
  { id: 5, name: "Yoga Pants", price: 34.99, sold: 410, image: "/yoga-pants-women.jpg" },
  { id: 6, name: "Blouse", price: 44.99, sold: 320, image: "/blouse-women-fashion.jpg" },
]

const categories = [
  { name: "Women", active: true },
  { name: "Men", active: false },
  { name: "Kids", active: false },
]

const filterOptions = {
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: ["Black", "White", "Red", "Blue", "Green", "Pink"],
  priceRanges: ["Under $25", "$25 - $50", "$50 - $100", "Over $100"],
  brands: ["Nike", "Adidas", "Zara", "H&M", "Uniqlo"],
}

export default function ShopHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    sizes: [],
    colors: [],
    priceRanges: [],
    brands: [],
  })
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const toggleFilter = (category, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }))
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Main Content */}
      <main className="lg:px-16 max-lg::max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium"
          >
            <FiFilter className="w-5 h-5" />
            Filters
          </button>

          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-32">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              {/* Size Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleFilter("sizes", size)}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        selectedFilters.sizes.includes(size)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Color</h3>
                <div className="space-y-2">
                  {filterOptions.colors.map((color) => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.colors.includes(color)}
                        onChange={() => toggleFilter("colors", color)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {filterOptions.priceRanges.map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.priceRanges.includes(range)}
                        onChange={() => toggleFilter("priceRanges", range)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Brand</h3>
                <div className="space-y-2">
                  {filterOptions.brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.brands.includes(brand)}
                        onChange={() => toggleFilter("brands", brand)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Same filters code as desktop (size, color, price, brand) */}
                  {Object.entries(filterOptions).map(([key, options]) => (
                    <div className="mb-6" key={key}>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                      <div className={key === "sizes" ? "flex flex-wrap gap-2" : "space-y-2"}>
                        {options.map((option) => (
                          key === "sizes" ? (
                            <button
                              key={option}
                              onClick={() => toggleFilter(key, option)}
                              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                selectedFilters[key].includes(option)
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                              }`}
                            >
                              {option}
                            </button>
                          ) : (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFilters[key].includes(option)}
                                onChange={() => toggleFilter(key, option)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">{option}</span>
                            </label>
                          )
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-600">Women Collection</h2>
              <p className="text-gray-500 text-sm mt-1">Sorted from top sellers to least sellers</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-blue-600 font-semibold">${product.price.toFixed(2)}</span>
                      <span className="text-gray-400 text-sm">{product.sold} sold</span>
                    </div>
                    <button className="w-full mt-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
