"use client";
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { FiSave } from 'react-icons/fi';

export default function AccountSettings() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Connect to Supabase update logic here
    console.log('Update profile', formData);
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        {/* Personal Details */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Security */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#2E5C45] text-white font-medium rounded-xl hover:bg-[#254a38] transition-colors shadow-lg shadow-[#2E5C45]/20 flex items-center gap-2"
          >
            <FiSave className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
