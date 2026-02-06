"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiGrid, 
  FiShoppingBag, 
  FiHeart, 
  FiMapPin, 
  FiSettings, 
  FiLogOut 
} from 'react-icons/fi';
import { useAuth } from '@/components/AuthProvider';

const menuItems = [
  { label: 'Overview', icon: FiGrid, id: 'overview' },
  { label: 'Orders', icon: FiShoppingBag, id: 'orders' },
  { label: 'Wishlist', icon: FiHeart, id: 'wishlist' },
  { label: 'Addresses', icon: FiMapPin, id: 'addresses' },
  { label: 'Settings', icon: FiSettings, id: 'settings' },
];

export default function ProfileSidebar({ activeTab, setActiveTab }) {
  const { signOut } = useAuth();
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 md:hidden">
        <h2 className="font-semibold text-gray-900">Menu</h2>
      </div>
      
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-[#2E5C45] text-white shadow-md shadow-[#2E5C45]/20' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}

        <div className="pt-2 mt-2 border-t border-gray-100">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
          >
            <FiLogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
}
