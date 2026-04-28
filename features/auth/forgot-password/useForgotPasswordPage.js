'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FORGOT_PASSWORD_SLIDES } from '@/components/auth/forgot-password/forgotPassword.constants';
import useAuthSlideshow from '@/features/auth/shared/useAuthSlideshow';

export default function useForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const { slide, setSlide } = useAuthSlideshow(FORGOT_PASSWORD_SLIDES.length);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailHovered, setEmailHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);

  async function handleResetPassword(event) {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  return {
    slide,
    setSlide,
    email,
    error,
    success,
    loading,
    emailFocused,
    emailHovered,
    submitHovered,
    setEmail,
    setEmailFocused,
    setEmailHovered,
    setSubmitHovered,
    handleResetPassword,
  };
}
