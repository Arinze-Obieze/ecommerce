'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useWishlist } from '@/contexts/WishlistContext';
import ProfileSidebar from '@/components/Profile/ProfileSidebar';
import ProfileOverview from '@/components/Profile/ProfileOverview';
import OrderHistory from '@/components/Profile/OrderHistory';
import AddressBook from '@/components/Profile/AddressBook';
import AccountSettings from '@/components/Profile/AccountSettings';
import ProfileWishlist from '@/components/Profile/ProfileWishlist';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { wishlistItems } = useWishlist();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if tab is passed via URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#2E5C45]">Loading...</div>;
  if (!user) return null; // Handled by auth protection/middleware usually

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview />;
      case 'orders':
        return <OrderHistory />;
      case 'wishlist':
        return <ProfileWishlist />;
      case 'addresses':
        return <AddressBook />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24">
              <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
