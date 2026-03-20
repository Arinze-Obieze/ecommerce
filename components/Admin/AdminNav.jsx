'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiUsers, FiFileText, FiBarChart2, FiShoppingBag, FiPackage, FiCreditCard } from 'react-icons/fi';

const items = [
  { href: '/admin', label: 'Overview', icon: FiGrid },
  { href: '/admin/stores', label: 'Stores', icon: FiUsers },
  { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { href: '/admin/products', label: 'Products', icon: FiPackage },
  { href: '/admin/escrow', label: 'Escrow', icon: FiCreditCard },
  { href: '/admin/logs', label: 'System Logs', icon: FiFileText },
  { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? 'bg-[#2E5C45] text-white shadow-sm'
                : 'text-gray-700 hover:bg-[#eef4f0] hover:text-[#2E5C45]'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
