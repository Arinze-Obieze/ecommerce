import React from 'react'

const ProfileStats = () => {
  return (
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
  )
}

export default ProfileStats
