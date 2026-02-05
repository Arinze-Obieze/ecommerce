"use client"
import { useState, useEffect, Suspense } from "react"
import { FiFilter, FiChevronDown } from "react-icons/fi"
import Link from "next/link"
import FilterSidebar from "./FilterSidebar"
import ActiveFilters from "./ActiveFilters"
import { useFilters } from "@/contexts/FilterContext"
import ProductCard from "./ProductCard"

// Loading fallback for ShopHub
function ShopHubLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="lg:px-16 max-lg:max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="lg:hidden h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="h-[600px] bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="mb-6 space-y-4">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main content component
function ShopHubContent() {
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
  const fetchProducts = async (isLoadMore = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: "12", // 12 is good for 2, 3, 4 col grids
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

      if (isLoadMore) {
        setProducts(prev => [...prev, ...json.data])
      } else {
        setProducts(json.data)
      }
      
      setMeta(json.meta.pagination)
    } catch (err) {
      setError("Failed to load products")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Refetch when filters change (reset to page 1)
  useEffect(() => {
    // If page is 1, fetch. If page > 1, it means we likely just reset or are loading more.
    // Actually, checking if we Should reset list is better.
    // The filter context likely manages 'page'. 
    // If ANY filter changes (except page), we should be at page 1 (which useFilters should handle)
    
    // Logic: fetch if page is 1 (fresh start/filter change).
    // fetch if page > 1 (load more).
    
    // Important: We need to know if this is a "new filter" or "load more"
    // Ideally, when filter changes, page is reset to 1.
    const isLoadMore = filters.page > 1;
    fetchProducts(isLoadMore);
    
  }, [filters.page, filters.category, filters.search, filters.minPrice, filters.maxPrice, filters.sizes, filters.colors, filters.sortBy])

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchInput)
    }, 400)

    return () => clearTimeout(delay)
  }, [searchInput, setSearch])

  const handleLoadMore = () => {
      if (meta?.hasNextPage) {
          setPage(filters.page + 1);
      }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div 
            className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <FilterSidebar onMobileClose={() => setMobileFiltersOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:px-8 max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 font-medium hover:bg-gray-100 transition-colors"
          >
            <FiFilter className="w-5 h-5" /> Filters & Sort
          </button>

          {/* Main content grid */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Desktop Filters (left sidebar) */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-fit">
              <FilterSidebar />
            </aside>

            {/* Products Section */}
            <div className="flex-1">
              {/* Header with Search and Sort */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Showing {products.length} of {meta?.totalItems || 0} items
                    </p>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="w-full sm:w-48 relative">
                    <select
                      value={filters.sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none bg-white cursor-pointer text-sm font-medium focus:ring-1 focus:ring-gray-900 outline-none"
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      placeholder="Search for products..."
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mb-6">
                <ActiveFilters />
              </div>

              {/* Products Grid */}
              {products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 mb-12">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* No results */}
              {!loading && !error && products.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                    }}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-black transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}

               {/* Error State */}
               {error && (
                <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => fetchProducts(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Load More Button */}
              {meta?.hasNextPage && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                  >
                    {loading ? 'Loading...' : 'Load More Products'}
                  </button>
                </div>
              )}
              
              {/* End of list message */}
              {!meta?.hasNextPage && products.length > 0 && (
                   <div className="text-center mt-12 text-gray-400 text-sm">
                       You've reached the end of the list
                   </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main ShopHub component with Suspense
export default function ShopHub() {
  return (
    <Suspense fallback={<ShopHubLoading />}>
      <ShopHubContent />
    </Suspense>
  )
}