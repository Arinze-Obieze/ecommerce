"use client";
import React from 'react';
import Link from 'next/link';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

export default function OrderHistory() {
  // Placeholder data - connect to real API later
  const orders = [
    { id: 'ORD-245-889', date: 'Oct 24, 2024', total: '₦45,000', status: 'Delivered', items: 3 },
    { id: 'ORD-245-890', date: 'Oct 15, 2024', total: '₦12,500', status: 'Processing', items: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <div className="text-sm text-gray-500">
          Showing recent orders
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <FiPackage className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.date} • {order.items} items</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 w-full md:w-auto">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="font-bold text-gray-900">{order.total}</div>
                    <Link href={`/orders/${order.id}`} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                       <FiChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-gray-500 mb-6">When you place an order, it will appear here.</p>
            <Link href="/shop">
              <button className="px-6 py-2 bg-[#2E5C45] text-white rounded-lg font-medium hover:bg-[#254a38] transition-colors">
                Start Shopping
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
