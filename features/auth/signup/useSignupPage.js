'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  SIGNUP_SLIDES,
} from '@/components/auth/signup/signup.constants';
import useAuthSlideshow from '@/features/auth/shared/useAuthSlideshow';
import {
  getPasswordChecks,
  sanitizePhoneInput,
} from '@/features/auth/shared/authPassword.utils';

export default function useSignupPage(router) {
  const { slide, setSlide } = useAuthSlideshow(SIGNUP_SLIDES.length);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hoverState, setHoverState] = useState({});
  const [focusState, setFocusState] = useState({});

  const requirements = getPasswordChecks(password);
  const passStrength = Object.values(requirements).filter(Boolean).length;
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  async function handleSignup(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);

    try {
      const { error: oauthError } = await createClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/auth/callback` },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function setHover(key, value) {
    setHoverState((current) => ({ ...current, [key]: value }));
  }

  function setFocus(key, value) {
    setFocusState((current) => ({ ...current, [key]: value }));
  }

  return {
    slide,
    setSlide,
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    showPass,
    showConfirm,
    error,
    loading,
    success,
    agreeTerms,
    hoverState,
    focusState,
    passStrength,
    passwordsMatch,
    requirements,
    setShowPass,
    setShowConfirm,
    setAgreeTerms,
    setFullName,
    setEmail,
    setPhone: (value) => setPhone(sanitizePhoneInput(value)),
    setPassword,
    setConfirmPassword,
    setHover,
    setFocus,
    handleSignup,
    handleGoogleSignup,
  };
}
