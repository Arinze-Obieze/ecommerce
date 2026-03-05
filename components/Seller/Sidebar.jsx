"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiSettings, 
  FiLogOut,
  FiPieChart,
  FiPlusSquare
} from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { success, error } = useToast();

  const navigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: FiHome },
    { name: 'Products', href: '/seller/products', icon: FiPackage },
    { name: 'Add Product', href: '/seller/products/new', icon: FiPlusSquare },
    { name: 'Orders', href: '/seller/orders', icon: FiShoppingBag },
    { name: 'Analytics', href: '/seller/analytics', icon: FiPieChart },
    { name: 'Settings', href: '/seller/settings', icon: FiSettings },
  ];

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      error('Failed to log out');
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex h-full">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#2E5C45] flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span>🛍️</span> Seller Hub
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#2E5C45] text-white shadow-md shadow-[#2E5C45]/20' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors group"
        >
          <FiLogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
