'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getPasswordChecks } from '@/features/auth/shared/authPassword.utils';

export default function useResetPasswordPage(router) {
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordHovered, setPasswordHovered] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [confirmHovered, setConfirmHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checks = getPasswordChecks(password);
  const passwordStrength = Object.values(checks).filter(Boolean).length;

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!active) return;

        if (sessionError) {
          setError(sessionError.message);
          setValidSession(false);
        } else {
          setValidSession(Boolean(data?.session?.user));
        }
      } catch (sessionError) {
        if (!active) return;
        setError(sessionError.message || 'Unable to validate reset session');
        setValidSession(false);
      } finally {
        if (active) {
          setReady(true);
          setLoading(false);
        }
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setValidSession(Boolean(session?.user));
        setLoading(false);
        setReady(true);
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!validSession) {
      setError('This setup link is invalid or has expired. Request a new password reset email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength < 5) {
      setError('Use a stronger password that meets all listed requirements.');
      return;
    }

    setSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setSubmitting(false);
        return;
      }

      setSuccess(true);

      const redirectRes = await fetch('/api/auth/post-login-target', { cache: 'no-store' });
      const redirectJson = await redirectRes.json().catch(() => ({}));
      const target = typeof redirectJson?.target === 'string' ? redirectJson.target : '/';

      setTimeout(() => {
        router.push(target);
      }, 1200);
    } catch (updateError) {
      setError(updateError.message || 'Unable to update password.');
      setSubmitting(false);
    }
  }

  return {
    password,
    confirmPassword,
    ready,
    validSession,
    loading,
    submitting,
    error,
    success,
    passwordFocused,
    passwordHovered,
    confirmFocused,
    confirmHovered,
    submitHovered,
    showPassword,
    showConfirmPassword,
    checks,
    setPassword,
    setConfirmPassword,
    setPasswordFocused,
    setPasswordHovered,
    setConfirmFocused,
    setConfirmHovered,
    setSubmitHovered,
    setShowPassword,
    setShowConfirmPassword,
    handleSubmit,
  };
}
