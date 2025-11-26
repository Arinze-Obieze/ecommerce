'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiCamera,
  FiCreditCard,
  FiChevronRight,
} from 'react-icons/fi';
import createClient from '@/utils/supabase/client';
import ProfileStats from '@/components/Stats/ProfileStats';
import RecentOrder from '@/components/Profile/RecentOrder';


export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }
      const userId = authData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user:', error);
      } else if(!data){
      console.log('No profile found for this user yet.');
      }else {
        setUser(data);
      }
    }

    fetchUser();
  }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Hero Profile Section */}
        <section className="bg-white rounded-3xl shadow p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative w-32 h-32">
            <img
              src={user.avatar || '/woman-profile-avatar.png'}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow"
            />
            <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700">
              <FiCamera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{user.full_name}</h1>

            <div className="mt-4 space-y-2 text-gray-600">
              <div className="flex items-center gap-3">
                <FiMail /> {user.email}
              </div>
              <div className="flex items-center gap-3">
                <FiPhone /> {user.phone}
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin /> {user.state}
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="inline-block mt-6 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              Edit Profile
            </Link>
          </div>
        </section>

        {/* Stats */}
       <ProfileStats/>

        {/* Recent Orders */}
      <RecentOrder/>

        {/* Settings */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'My Orders', icon: FiShoppingBag, href: '/orders' },
            { label: 'Payment Methods', icon: FiCreditCard, href: '/payments' },
            { label: 'Account Settings', icon: FiSettings, href: '/settings' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white p-6 rounded-2xl shadow flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-6 h-6 text-gray-500" />
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <FiChevronRight className="text-gray-400" />
            </Link>
          ))}

          <button className="bg-white p-6 rounded-2xl shadow flex items-center gap-4 text-red-600 hover:bg-red-50 font-medium">
            <FiLogOut className="w-6 h-6" /> Log Out
          </button>
        </section>
      </main>
    </div>
  );
}
