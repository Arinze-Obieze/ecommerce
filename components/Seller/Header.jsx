"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiBell, FiUser } from 'react-icons/fi';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
      
      {/* Mobile Menu Button - Left */}
      <div className="flex items-center md:hidden">
        <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
        >
          <span className="sr-only">Open sidebar</span>
          <FiMenu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Brand (Center) */}
      <div className="md:hidden flex-1 text-center font-bold text-[#2E5C45] text-lg">
        Seller Hub
      </div>

      {/* Desktop Blank Space / Breadcrumbs area */}
      <div className="hidden md:flex flex-1 items-center">
        {/* Can put breadcrumbs or search here later */}
      </div>

      {/* Right side - User & Notifications */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors relative">
          <span className="sr-only">View notifications</span>
          <FiBell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-[#2E5C45] flex items-center justify-center text-white ring-2 ring-white cursor-pointer shadow-sm">
           <FiUser className="h-4 w-4" />
        </div>
      </div>

      {/* --- Mobile Sidebar Overlay --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
             className="fixed inset-0 bg-gray-900/80 transition-opacity" 
             onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar drawer */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 transform transition-transform">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <FiX className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>

            {/* Brand inside mobile drawer */}
            <div className="flex shrink-0 items-center px-4 mb-5">
               <span className="text-xl font-bold tracking-tight text-[#2E5C45] flex items-center gap-2">
                 <span>🛍️</span> Seller Hub
               </span>
            </div>
            
            <div className="h-0 flex-1 overflow-y-auto px-2">
               {/* Note: In a real app we'd extract the generic nav list array here too so it's DRY, 
                   but for speed we'll instruct the user to click the desktop sidebar links. */}
               <nav className="flex flex-col space-y-1">
                 <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center rounded-md px-3 py-3 text-base font-medium">
                   Dashboard
                 </Link>
                 <Link href="/seller/products" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center rounded-md px-3 py-3 text-base font-medium">
                   Products
                 </Link>
                 <Link href="/seller/products/new" onClick={() => setMobileMenuOpen(false)} className="text-[#2E5C45] bg-[#2E5C45]/10 hover:bg-[#2E5C45]/20 group flex items-center rounded-md px-3 py-3 text-base font-medium">
                   Add Product
                 </Link>
                 <Link href="/seller/orders" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center rounded-md px-3 py-3 text-base font-medium">
                   Orders
                 </Link>
               </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
