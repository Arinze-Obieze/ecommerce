'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LOGIN_SLIDES } from '@/components/auth/login/login.constants';
import useAuthSlideshow from '@/features/auth/shared/useAuthSlideshow';
import { getPasswordStrengthMeta } from '@/features/auth/shared/authPassword.utils';

export default function useLoginPage(router) {
  const supabase = useMemo(() => createClient(), []);
  const { slide, setSlide } = useAuthSlideshow(LOGIN_SLIDES.length);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailHovered, setEmailHovered] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [passHovered, setPassHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [googleHovered, setGoogleHovered] = useState(false);
  const [facebookHovered, setFacebookHovered] = useState(false);
  const [rememberHovered, setRememberHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const strength = getPasswordStrengthMeta(password);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const redirectRes = await fetch('/api/auth/post-login-target', { cache: 'no-store' });
      const redirectJson = await redirectRes.json().catch(() => ({}));
      const target = typeof redirectJson?.target === 'string' ? redirectJson.target : '/';

      setSuccess(true);
      setTimeout(() => router.push(target), 1800);
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/auth/callback` },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return {
    slide,
    setSlide,
    mounted,
    email,
    password,
    showPass,
    rememberMe,
    error,
    loading,
    success,
    emailFocused,
    emailHovered,
    passFocused,
    passHovered,
    submitHovered,
    googleHovered,
    facebookHovered,
    rememberHovered,
    setEmail,
    setPassword,
    setShowPass,
    setRememberMe,
    setEmailFocused,
    setEmailHovered,
    setPassFocused,
    setPassHovered,
    setSubmitHovered,
    setGoogleHovered,
    setFacebookHovered,
    setRememberHovered,
    handleLogin,
    handleGoogleLogin,
    ...strength,
  };
}
