'use client'
import { useState } from 'react'
import { FiChevronDown, FiMapPin, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi'

const Header = () => {
      const [searchQuery, setSearchQuery] = useState("") 
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    
    const categories = [
  { name: "Women", active: true },
  { name: "Men", active: false },
  { name: "Kids", active: false },
]



  return (
         <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
           <div className="max-w-7xl mx-auto px-4 py-4">
             {/* Top Row - Logo, Search, Location, Cart, Profile */}
             <div className="flex items-center justify-between gap-4">
               <h1 className="text-xl md:text-2xl font-bold text-gray-900">ShopHub</h1>
   
               {/* Search Bar - Hidden on mobile, shown on md+ */}
               <div className="hidden md:flex flex-1 max-w-xl mx-4">
                 <div className="relative w-full">
                   <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                   <input
                     type="text"
                     placeholder="Search products..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>
   
               <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-center gap-1 text-gray-600">
                   <FiMapPin className="w-4 h-4" />
                   <span className="text-sm">Kansas</span>
                 </div>
   
                 {/* Cart */}
                 <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                   <FiShoppingCart className="w-6 h-6 text-gray-700" />
                   <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                     3
                   </span>
                 </button>
   
                 {/* Profile */}
                 <div className="relative">
                   <button
                     onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                     className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                   >
                     <FiUser className="w-6 h-6 text-gray-700" />
                     <span className="hidden sm:block text-gray-700 font-medium">Arinze</span>
                     <FiChevronDown className="w-4 h-4 text-gray-500" />
                   </button>
   
                   {profileDropdownOpen && (
                     <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                       <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
                       <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Orders</button>
                       <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                     </div>
                   )}
                 </div>
               </div>
             </div>
   
             {/* Mobile Search Bar */}
             <div className="md:hidden mt-3">
               <div className="relative w-full">
                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input
                   type="text"
                   placeholder="Search products..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
               </div>
             </div>
   
             {/* Category Navigation */}
             <nav className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
               {categories.map((category) => (
                 <button
                   key={category.name}
                   className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                     category.active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                   }`}
                 >
                   {category.name}
                   <FiChevronDown className="w-4 h-4" />
                 </button>
               ))}
             </nav>
           </div>
         </header>
  )
}

export default Header
