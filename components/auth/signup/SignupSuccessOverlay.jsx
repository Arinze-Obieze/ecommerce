"use client";

import AuthSuccessOverlay from "@/components/auth/shared/AuthSuccessOverlay";

export default function SignupSuccessOverlay() {
  return (
    <AuthSuccessOverlay
      title="Account created!"
      description="Redirecting you to sign in..."
    />
  );
}
