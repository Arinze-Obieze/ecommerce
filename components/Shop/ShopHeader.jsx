"use client"
import { FiChevronDown } from "react-icons/fi"
import { useFilters } from "@/contexts/FilterContext"

export default function ShopHeader({ productsLength, totalItems, onMobileFiltersOpen }) {
  const { filters, setSortBy, searchInput, setSearchInput } = useFilters()

  return (
    <div className="mb-8">
      {/* Mobile-only header controls */}
      <div className="lg:hidden mb-6">
        <button
          onClick={onMobileFiltersOpen}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 font-medium hover:bg-gray-100 transition-colors"
        >
          Filters & Sort
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
          <p className="text-gray-500 text-sm mt-1">
            Showing {productsLength} of {totalItems} items
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
            value={searchInput} // Note: This needs to be passed down or accessed via context if context handles local state
            onChange={e => setSearchInput && setSearchInput(e.target.value)}
            // If setSearchInput implies the context debounced setter, we might need a local state in the header or context to handle the input value
            // checking ShopClient, it uses a local state `searchInput` and debounces it to `setSearch`
            // refactoring note: The context should probably handle this or we pass props.
            // For now, let's assume we update the context to handle searchInput or pass it as props
             placeholder="Search for products..."
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400"
          />
      </div>
    </div>
  )
}
