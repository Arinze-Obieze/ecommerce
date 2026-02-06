"use client"
import ProductCard from "../ProductCard"
import { useFilters } from "@/contexts/FilterContext"

export default function ProductGrid({ products, loading, error, meta, onLoadMore }) {
  const { setSearch, setPage } = useFilters()
  
  // Handlers for empty state
  const handleClearSearch = () => {
      setSearch('')
      // If we have a local input state in header, it needs to be cleared too. 
      // Ideally context handles everything.
  }

  return (
    <>
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
            onClick={handleClearSearch}
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
          {/* Retry logic usually requires a refetch function passed down */}
        </div>
      )}

      {/* Load More Button */}
      {meta?.hasNextPage && (
        <div className="flex justify-center mt-12">
          <button
            onClick={onLoadMore}
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
    </>
  )
}
