"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "react-icons/fi"

const recentOrders = [
  { id: "ORD-2024-001", date: "Nov 20, 2024", total: 129.97, status: "Delivered" },
  { id: "ORD-2024-002", date: "Nov 15, 2024", total: 79.98, status: "Shipped" },
  { id: "ORD-2024-003", date: "Nov 10, 2024", total: 49.99, status: "Processing" },
]

export default function ProfilePage() {
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "Kansas, United States",
    avatar: "/woman-profile-avatar.png",
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        {/* Hero Profile Section */}
        <section className="bg-white rounded-3xl shadow p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative w-32 h-32">
            <img
              src={user.avatar}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow"
            />
            <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700">
              <FiCamera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>

            <div className="mt-4 space-y-2 text-gray-600">
              <div className="flex items-center gap-3">
                <FiMail /> {user.email}
              </div>
              <div className="flex items-center gap-3">
                <FiPhone /> {user.phone}
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin /> {user.location}
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
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Orders</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">24</h3>
          </div>
        
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Payment Methods</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">3</h3>
          </div>
        </section>

        {/* Recent Orders */}
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

        {/* Settings */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "My Orders", icon: FiShoppingBag, href: "/orders" },
            { label: "Payment Methods", icon: FiCreditCard, href: "/payments" },
            { label: "Account Settings", icon: FiSettings, href: "/settings" },
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
  )
}
