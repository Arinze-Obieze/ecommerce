import Link from 'next/link';
import React from 'react'

const RecentOrder = () => {

    const recentOrders = [
      { id: 'ORD-2024-001', date: 'Nov 20, 2024', total: 129.97, status: 'Delivered' },
      { id: 'ORD-2024-002', date: 'Nov 15, 2024', total: 79.98, status: 'Shipped' },
      { id: 'ORD-2024-003', date: 'Nov 10, 2024', total: 49.99, status: 'Processing' },
    ];
    

  return (
      <section className="bg-white rounded-3xl shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-blue-600 font-medium text-sm">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.total}</p>
                  <p className="text-sm text-gray-500">{order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
  )
}

export default RecentOrder
