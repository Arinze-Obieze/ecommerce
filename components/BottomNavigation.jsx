'use client'

import { FiHome, FiGrid, FiHeart, FiUser } from 'react-icons/fi'
import Link from 'next/link'

export default function BottomNavigation() {
  const items = [
    { icon: FiHome, label: 'Home', href: '/' },
    { icon: FiGrid, label: 'Categories', href: '/' },
    { icon: FiHeart, label: 'Wishlist', href: '/' },
    { icon: FiUser, label: 'Account', href: '/' }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 py-2 px-3 text-gray-600 hover:text-green-500 transition-colors"
          >
            <Icon size={24} />
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
