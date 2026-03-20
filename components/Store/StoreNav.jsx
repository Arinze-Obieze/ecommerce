'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiUsers, FiPackage, FiShoppingBag, FiBarChart2, FiCreditCard, FiSettings } from 'react-icons/fi';

const items = [
  { href: '/store/dashboard', label: 'Overview', icon: FiGrid },
  { href: '/store/dashboard/products', label: 'Products', icon: FiPackage },
  { href: '/store/dashboard/orders', label: 'Orders', icon: FiShoppingBag },
  { href: '/store/dashboard/inventory', label: 'Inventory', icon: FiPackage },
  { href: '/store/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/store/dashboard/payouts', label: 'Payouts', icon: FiCreditCard },
  { href: '/store/dashboard/settings', label: 'Settings', icon: FiSettings },
  { href: '/store/dashboard/team', label: 'Team', icon: FiUsers },
];

export default function StoreNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== '/store/dashboard' && pathname.startsWith(item.href));
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
