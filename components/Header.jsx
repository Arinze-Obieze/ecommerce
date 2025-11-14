'use client'

import { useState } from 'react'
import { FiSearch, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi'
import { HiOutlineUser } from 'react-icons/hi'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationLinks = [
    { href: "/", label: "HOME" },
    { href: "/pages", label: "PAGES" },
    { href: "/products", label: "PRODUCTS" },
    { href: "/contact", label: "CONTACT" }
  ]

  const topInfoItems = [
    { text: "📦 FREE SHIPPING OVER $100" },
    { text: "⏳ 30 DAYS MONEY BACK" },
    { text: "🔒 100% SECURE PAYMENT" }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top Info Bar - Only shows if there are items */}
      {topInfoItems.length > 0 && (
        <div className="hidden md:block bg-blue-600 text-white text-sm py-2 px-4">
          <div className="max-w-7xl mx-auto flex justify-center gap-8 text-center">
            {topInfoItems.map((item, index) => (
              <span key={index}>{item.text}</span>
            ))}
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex place-items-center items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              S
            </div>
            <span className="text-gray-900">SWOO</span>
            <span className="text-gray-500 max-sm:hidden">TELEMART</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 flex-1 justify-center text-sm font-semibold">
            {navigationLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
                {(link.label === 'PAGES' || link.label === 'PRODUCTS') && ' ▼'}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
              <HiOutlineUser size={20} />
              <span>LOGIN/REGISTER</span>
            </button>
         
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiShoppingCart size={24} className="text-gray-700" />
              <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <FiSearch className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="flex-1 bg-transparent ml-2 outline-none text-sm"
            />
          </div>
          <button className="btn-primary hidden md:flex items-center justify-center w-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <FiSearch size={20} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-gray-200 pt-4">
            {navigationLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-gray-700 hover:text-blue-600 font-semibold py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold py-2 transition-colors">
              <HiOutlineUser size={20} />
              <span>LOGIN/REGISTER</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}