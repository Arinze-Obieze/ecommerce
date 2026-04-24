'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWishlist } from '@/contexts/wishlist/WishlistContext';
import ProfileSidebar from '@/components/account/ProfileSidebar';
import ProfileOverview from '@/components/account/ProfileOverview';
import OrderHistory from '@/components/account/OrderHistory';
import AddressBook from '@/components/account/AddressBook';
import AccountSettings from '@/components/account/AccountSettings';
import ProfileWishlist from '@/components/account/ProfileWishlist';
import ProfileNotifications from '@/components/account/ProfileNotifications';

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

  if (loading) return <div className="zova-page min-h-screen flex items-center justify-center text-[#2E6417] font-semibold">Loading your account...</div>;
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
      case 'notifications':
        return <ProfileNotifications />;
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <div className="zova-page">
      <main className="zova-shell py-8 lg:py-12">
        <div className="zova-section-header mb-8">
          <div>
            <span className="zova-eyebrow">Account centre</span>
            <h1 className="zova-title mt-3 text-[2rem] font-black">Your ZOVA account</h1>
            <p className="zova-copy mt-2 max-w-2xl">Manage orders, saved addresses, wishlist items, and account preferences from one calm, trusted workspace.</p>
          </div>
        </div>
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
