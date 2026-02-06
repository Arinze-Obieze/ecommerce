"use client"
import { useState, useEffect, Suspense, useRef } from "react"
import FilterSidebar from "./FilterSidebar"
import ActiveFilters from "./ActiveFilters"
import { useFilters } from "@/contexts/FilterContext"
import ShopHeader from "./Shop/ShopHeader"
import ProductGrid from "./Shop/ProductGrid"
import MobileFilterDrawer from "./Shop/MobileFilterDrawer"

// Loading fallback for ShopHub
function ShopHubLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-4 lg:px-8 py-6">
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
function ShopHubContent({ initialCategory }) {
  const {
    filters,
    setSearch,
    setPage,
    setCategory
  } = useFilters()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  // Search input state moved to ShopHeader or handled via context in full refactor
  // For now, keeping the debounced logic sync requires passing props or lifting state
  // To keep ShopClient clean, let's keep the fetch logic here but pass handlers
  const [searchInput, setSearchInput] = useState(filters.search)

  // Ensure we only set the initial category once per mount/navigation
  const initializedRef = useRef(false);
  const lastInitialCategory = useRef(initialCategory);

  useEffect(() => {
    // If the initialCategory prop actually changes (navigation), reset initialization
    if (initialCategory !== lastInitialCategory.current) {
        initializedRef.current = false;
        lastInitialCategory.current = initialCategory;
    }

    if (!initializedRef.current && initialCategory) {
        setCategory(initialCategory);
        initializedRef.current = true;
    }
  }, [initialCategory, setCategory]);

  // Fetch products
  const fetchProducts = async (isLoadMore = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: "12",
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
        // Only set error if we don't have products to show (e.g. initial load failed)
        if (products.length === 0) {
            setError("Failed to load products")
        }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Refetch when filters change (reset to page 1)
  useEffect(() => {
    const isLoadMore = filters.page > 1;
    fetchProducts(isLoadMore);
  }, [filters.page, filters.category, filters.search, filters.minPrice, filters.maxPrice, filters.sizes, filters.colors, filters.sortBy])

  // Debounced search sync
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInput !== filters.search) {
        setSearch(searchInput)
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [searchInput, setSearch, filters.search])

  const handleLoadMore = () => {
      if (meta?.hasNextPage) {
          setPage(filters.page + 1);
      }
  }

  return (
    <div className="min-h-screen bg-white">
      <MobileFilterDrawer 
        isOpen={mobileFiltersOpen} 
        onClose={() => setMobileFiltersOpen(false)} 
      />

      <main className="w-full px-4 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
            {/* Desktop Filters (left sidebar) */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-fit">
              <FilterSidebar />
            </aside>

            {/* Products Section */}
            <div className="flex-1">
              <ShopHeader 
                 productsLength={products.length}
                 totalItems={meta?.totalItems || 0}
                 onMobileFiltersOpen={() => setMobileFiltersOpen(true)}
                 searchInput={searchInput}
                 setSearchInput={setSearchInput}
              />

              <div className="mb-6">
                <ActiveFilters />
              </div>

              <ProductGrid 
                products={products}
                loading={loading}
                error={error}
                meta={meta}
                onLoadMore={handleLoadMore}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main ShopHub component with Suspense
export default function ShopHub(props) {
  return (
    <Suspense fallback={<ShopHubLoading />}>
      <ShopHubContent {...props} />
    </Suspense>
  )
}