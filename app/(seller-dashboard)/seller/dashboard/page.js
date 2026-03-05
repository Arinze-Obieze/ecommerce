"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiShoppingBag, FiEye, FiActivity } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState({
    name: 'Loading...',
    totalSales: 0,
    activeOrders: 0,
    storeViews: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        // Fetch user's store
        const { data: stores, error: storeError } = await supabase
          .from('stores')
          .select('id, name, followers')
          .eq('owner_id', user.id)
          .limit(1);

        if (storeError) throw storeError;

        if (!stores || stores.length === 0) {
           // Direct them to create a store if they don't have one
           router.push('/seller/settings');
           return;
        }

        const store = stores[0];

        // Fetch recent orders containing this store's products 
        // (In a real scenario, this requires a specific RPC or complex query depending on DB schema)
        // For launch V1, we will mock the analytics block so the UI is ready for the backend connection.
        
        setStoreData({
          name: store.name,
          totalSales: 1542000, // Dummy data for UI scaffolding
          activeOrders: 12,
          storeViews: store.followers * 14 || 1240,
          recentOrders: [
            { id: 'ORD-8921', customer: 'Sarah Jenkins', amount: 45000, status: 'Processing', date: '2 Mins ago' },
            { id: 'ORD-8920', customer: 'Michael Okoye', amount: 125000, status: 'Shipped', date: '1 Hour ago' },
            { id: 'ORD-8919', customer: 'Aisha Bello', amount: 15000, status: 'Delivered', date: 'Yesterday' },
            { id: 'ORD-8918', customer: 'Chidi Eze', amount: 89000, status: 'Processing', date: 'Yesterday' }
          ]
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E5C45]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {storeData.name}</h1>
        <p className="text-gray-500 mt-1">Here is what's happening with your store today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Metric Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                 <FiTrendingUp className="text-[#2E5C45] w-5 h-5" />
              </div>
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mt-4">₦{storeData.totalSales.toLocaleString()}</h3>
           <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
             <FiActivity className="w-4 h-4" /> +14.5% from last month
           </p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Active Orders</p>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                 <FiShoppingBag className="text-blue-600 w-5 h-5" />
              </div>
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mt-4">{storeData.activeOrders}</h3>
           <p className="text-sm text-gray-500 mt-2">Requires your attention</p>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Store Views</p>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                 <FiEye className="text-purple-600 w-5 h-5" />
              </div>
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mt-4">{storeData.storeViews.toLocaleString()}</h3>
           <p className="text-sm text-gray-500 mt-2">Across all products</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/seller/orders" className="text-sm font-medium text-[#2E5C45] hover:underline">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {storeData.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">₦{order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
