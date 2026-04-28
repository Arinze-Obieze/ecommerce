"use client";

import AuthSuccessOverlay from "@/components/auth/shared/AuthSuccessOverlay";

export default function ForgotPasswordSuccessOverlay({ email }) {
  return (
    <AuthSuccessOverlay
      title="Check your inbox"
      description={`We sent a secure reset link to ${email}.`}
    />
  );
}
