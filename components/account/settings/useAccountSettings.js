"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/contexts/toast/ToastContext";

export default function useAccountSettings(user) {
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/account/profile", { cache: "no-store" });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Could not load profile");
        }

        if (isActive) {
          setFormData((prev) => ({
            ...prev,
            fullName: json?.data?.fullName || user?.user_metadata?.full_name || "",
            email: json?.data?.email || user?.email || "",
            phone: json?.data?.phone || "",
          }));
        }
      } catch (error) {
        if (isActive) {
          showError(error.message || "Could not load profile settings");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [showError, user?.email, user?.id, user?.user_metadata?.full_name]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.fullName.trim()) {
      showError("Full name is required");
      return;
    }

    const wantsPasswordChange = formData.newPassword.trim().length > 0;

    if (wantsPasswordChange && !formData.currentPassword.trim()) {
      showError("Current password is required to set a new password");
      return;
    }

    if (wantsPasswordChange && formData.newPassword.trim().length < 8) {
      showError("New password must be at least 8 characters");
      return;
    }

    setIsSaving(true);

    try {
      const profileResponse = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      });
      const profileJson = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profileJson.error || "Failed to save profile");
      }

      const supabase = createClient();

      if (wantsPasswordChange) {
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.currentPassword,
        });

        if (reauthError) {
          throw new Error("Current password is incorrect");
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
          data: { full_name: formData.fullName },
        });

        if (passwordError) {
          throw new Error(passwordError.message || "Failed to update password");
        }
      } else {
        await supabase.auth.updateUser({
          data: { full_name: formData.fullName },
        });
      }

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));

      success(wantsPasswordChange ? "Profile and password updated" : "Profile updated");
    } catch (error) {
      showError(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    formData,
    isLoading,
    isSaving,
    handleChange,
    handleSubmit,
  };
}
