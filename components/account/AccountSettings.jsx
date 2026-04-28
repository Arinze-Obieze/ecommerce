"use client";

import { FiLock, FiSave, FiUser } from "react-icons/fi";
import { useAuth } from "@/components/auth/AuthProvider";
import SettingsField from "@/components/account/settings/SettingsField";
import SettingsSection from "@/components/account/settings/SettingsSection";
import SettingsSkeleton from "@/components/account/settings/SettingsSkeleton";
import useAccountSettings from "@/components/account/settings/useAccountSettings";

export default function AccountSettings() {
  const { user } = useAuth();
  const { formData, isLoading, isSaving, handleChange, handleSubmit } = useAccountSettings(user);

  return (
    <div className="flex max-w-[680px] flex-col gap-6">
      <div>
        <p className="zova-account-kicker">My Account</p>
        <h2 className="zova-account-title">Account Settings</h2>
      </div>

      {isLoading ? (
        <SettingsSkeleton />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <SettingsSection icon={FiUser} title="Personal Details">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SettingsField label="Full Name">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="zova-account-field"
                />
              </SettingsField>

              <SettingsField label="Email Address" hint="Email cannot be changed">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="zova-account-field"
                />
              </SettingsField>

              <SettingsField label="Phone Number">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234"
                  className="zova-account-field"
                />
              </SettingsField>
            </div>
          </SettingsSection>

          <SettingsSection icon={FiLock} title="Security">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SettingsField label="Current Password" hint="Required only when changing password">
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="zova-account-field"
                />
              </SettingsField>

              <SettingsField label="New Password" hint="Leave blank to keep current password">
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="zova-account-field"
                />
              </SettingsField>
            </div>
          </SettingsSection>

          <div className="flex justify-end">
            <button type="submit" disabled={isSaving} className="zova-account-button is-primary zova-account-save-button">
              <FiSave size={15} />
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
