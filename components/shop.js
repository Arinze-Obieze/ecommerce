"use client"
import { useState, useEffect } from "react"
import { FiFilter, FiChevronDown } from "react-icons/fi"
import Link from "next/link"
import FilterSidebar from "./FilterSidebar"
import ActiveFilters from "./ActiveFilters"
import { useFilters } from "@/contexts/FilterContext"

export default function ShopHub() {
  const {
    filters,
    setSearch,
    setSortBy,
    setPage,
  } = useFilters()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search)

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: "24",
        search: filters.search,
        category: filters.category
      })

      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
      if (filters.sizes.length) params.set('sizes', filters.sizes.join(','))
      if (filters.colors.length) params.set('colors', filters.colors.join(','))
      if (filters.sortBy) params.set('sortBy', filters.sortBy)

      const res = await fetch(`/api/products?${params.toString()}`)
      const json = await res.json()

      if (!json.success) {
        setError(json.error)
        return
      }

      setProducts(json.data)
      setMeta(json.meta.pagination)
    } catch (err) {
      setError("Failed to load products")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    fetchProducts()
  }, [filters.page, filters.category, filters.search, filters.minPrice, filters.maxPrice, filters.sizes, filters.colors, filters.sortBy])

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchInput)
    }, 400)

    return () => clearTimeout(delay)
  }, [searchInput, setSearch])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div 
            className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <FilterSidebar onMobileClose={() => setMobileFiltersOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:px-16 max-lg:max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium"
          >
            <FiFilter className="w-5 h-5" /> Filters
          </button>

          {/* Main content grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Filters (left sidebar) */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-20 h-fit">
              <FilterSidebar onMobileClose={() => setMobileFiltersOpen(false)} />
            </aside>

            {/* Products Section */}
            <div className="flex-1">
              {/* Header with Search and Sort */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600">Products Collection</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {meta?.totalItems || 0} products found
                    </p>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="w-full sm:w-48 relative">
                    <select
                      value={filters.sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer text-sm font-medium"
                    >
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-600" />
                  </div>
                </div>

                {/* Search */}
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Active Filters Display */}
              <ActiveFilters />

              {/* Loading */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
                    <span className="text-gray-600">Loading products...</span>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {!loading && products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {products.map(product => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        {/* Image Container */}
                        <div className="aspect-square bg-gray-100 overflow-hidden relative">
                          <img
                            src={product.image_urls?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.discount_price && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                              Sale
                            </div>
                          )}
                          {product.is_featured && (
                            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                              Featured
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                            {product.name}
                          </h3>

                          {/* Categories */}
                          {product.categories && product.categories.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {product.categories.map(c => c.name).join(', ')}
                            </p>
                          )}

                          {/* Price */}
                          <div className="mt-2 flex items-baseline gap-2">
                            <p className="text-lg font-bold text-blue-600">
                              ${product.discount_price ? (product.discount_price / 100).toFixed(2) : (product.price / 100).toFixed(2)}
                            </p>
                            {product.discount_price && (
                              <p className="text-sm text-gray-500 line-through">
                                ${(product.price / 100).toFixed(2)}
                              </p>
                            )}
                          </div>

                          {/* Rating */}
                          {product.rating && (
                            <div className="mt-2 flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < Math.round(product.rating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">({product.rating})</span>
                            </div>
                          )}

                          {/* Stock Status */}
                          <p className={`text-xs mt-2 font-medium ${
                            product.stock_quantity > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No results */}
              {!loading && products.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                    }}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {/* Prev */}
                  <button
                    disabled={!meta.hasPreviousPage}
                    onClick={() => setPage(filters.page - 1)}
                    className={`px-4 py-2 rounded border font-medium transition-colors ${
                      meta.hasPreviousPage
                        ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Prev
                  </button>

                  {/* Page numbers */}
                  {meta.pageNumbers.map(num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`px-3 py-2 rounded border font-medium transition-colors ${
                        num === meta.currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    disabled={!meta.hasNextPage}
                    onClick={() => setPage(filters.page + 1)}
                    className={`px-4 py-2 rounded border font-medium transition-colors ${
                      meta.hasNextPage
                        ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}