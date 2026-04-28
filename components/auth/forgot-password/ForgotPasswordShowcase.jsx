"use client";

import AuthShowcase from "@/components/auth/shared/AuthShowcase";
import {
  FORGOT_PASSWORD_PILLS,
  FORGOT_PASSWORD_SLIDES,
} from "@/components/auth/forgot-password/forgotPassword.constants";

export default function ForgotPasswordShowcase({ slide, setSlide }) {
  return (
    <AuthShowcase
      slide={slide}
      setSlide={setSlide}
      slides={FORGOT_PASSWORD_SLIDES}
      pills={FORGOT_PASSWORD_PILLS}
    />
  );
}
