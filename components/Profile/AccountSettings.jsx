"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { FiSave } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/contexts/ToastContext';

export default function AccountSettings() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    state: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/account/profile', { cache: 'no-store' });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || 'Could not load profile');
        }

        setFormData((prev) => ({
          ...prev,
          fullName: json?.data?.fullName || user?.user_metadata?.full_name || '',
          email: json?.data?.email || user?.email || '',
          phone: json?.data?.phone || '',
          state: json?.data?.state || '',
        }));
      } catch (loadError) {
        showError(loadError.message || 'Could not load profile settings');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.fullName.trim()) {
      showError('Full name is required');
      return;
    }

    const wantsPasswordChange = formData.newPassword.trim().length > 0;
    if (wantsPasswordChange && !formData.currentPassword.trim()) {
      showError('Current password is required to set a new password');
      return;
    }

    if (wantsPasswordChange && formData.newPassword.trim().length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }

    setIsSaving(true);

    try {
      const profileResponse = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          state: formData.state,
        }),
      });

      const profileJson = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error(profileJson.error || 'Failed to save profile');
      }

      const supabase = createClient();

      if (wantsPasswordChange) {
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.currentPassword,
        });

        if (reauthError) {
          throw new Error('Current password is incorrect');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
          data: { full_name: formData.fullName },
        });

        if (passwordError) {
          throw new Error(passwordError.message || 'Failed to update password');
        }
      } else {
        await supabase.auth.updateUser({ data: { full_name: formData.fullName } });
      }

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));

      success(wantsPasswordChange ? 'Profile and password updated' : 'Profile updated');
    } catch (saveError) {
      showError(saveError.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading account settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Lagos"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Required only for password change"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-[#2E5C45] text-white font-medium rounded-xl hover:bg-[#254a38] transition-colors shadow-lg shadow-[#2E5C45]/20 flex items-center gap-2 disabled:opacity-60"
          >
            <FiSave className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
