"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useWishlist } from '@/contexts/WishlistContext';
import Link from 'next/link';
import { FiPackage, FiHeart, FiMapPin, FiClock } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

export default function ProfileOverview() {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistCount: wishlistItems.size,
    addressCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        const supabase = createClient();

        // Fetch total orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (ordersError) throw ordersError;

        // Fetch addresses count (if you have a table for it)
        const { count: addressCount, error: addressError } = await supabase
          .from('user_addresses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // addressError might occur if table doesn't exist, that's okay
        setStats({
          totalOrders: ordersCount || 0,
          wishlistCount: wishlistItems.size,
          addressCount: addressCount || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStats({
          totalOrders: 0,
          wishlistCount: wishlistItems.size,
          addressCount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id, wishlistItems.size]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: FiPackage, color: 'bg-blue-50 text-blue-600' },
    { label: 'Wishlist', value: stats.wishlistCount, icon: FiHeart, color: 'bg-red-50 text-red-600' },
    { label: 'Saved Addresses', value: stats.addressCount, icon: FiMapPin, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-[#2E5C45] rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, {userName}!</h1>
          <p className="text-white/80">Welcome back to your profile. Here's what's happening with your account today.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Link href="/profile?tab=orders" className="text-sm font-medium text-[#2E5C45] hover:text-[#254a38]">
            View All History
          </Link>
        </div>
        
        {/* Placeholder for no activity */}
        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
             <FiClock className="w-5 h-5 text-gray-400" />
           </div>
           <p className="text-gray-600 font-medium">No recent activity</p>
           <p className="text-sm text-gray-400">Your recent orders and returns will appear here.</p>
        </div>
      </div>
    </div>
  );
}
