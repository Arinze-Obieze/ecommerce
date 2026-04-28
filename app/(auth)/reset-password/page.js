'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiCheck, FiLock, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

// Brand tokens — sourced from app/globals.css


function getPasswordChecks(password) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

function RequirementRow({ met, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: met ? 'var(--zova-primary-action)' : 'var(--zova-border)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {met ? <FiCheck size={10} /> : null}
      </div>
      <span style={{ fontSize: 12, color: met ? 'var(--zova-primary-action-hover)' : 'var(--zova-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    loadSession();

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

  const inputStyle = {
    width: '100%',
    padding: '13px 14px 13px 44px',
    borderRadius: 12,
    border: `1.5px solid ${error ? 'var(--zova-error)' : 'var(--zova-border)'}`,
    background: 'var(--zova-surface-alt)',
    fontSize: 14,
    color: 'var(--zova-ink)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--zova-linen)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'var(--zova-font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          border: `1px solid ${'var(--zova-border)'}`,
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 18px 60px rgba(17,17,17,0.08)',
        }}
      >
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            color: 'var(--zova-text-body)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <FiArrowLeft size={14} />
          Back to login
        </Link>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              borderRadius: 999,
              background: 'var(--zova-green-soft)',
              border: `1px solid ${'#B8D4A0'}`,
              color: 'var(--zova-primary-action-hover)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Secure account setup
          </div>
          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, color: 'var(--zova-ink)' }}>
            Set your new password
          </h1>
          <p style={{ margin: '10px 0 0', color: 'var(--zova-text-body)', fontSize: 14, lineHeight: 1.7 }}>
            Choose a strong password to finish account recovery or complete your invited account setup.
          </p>
        </div>

        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 16,
              borderRadius: 14,
              background: 'var(--zova-surface-alt)',
              color: 'var(--zova-text-body)',
            }}
          >
            <FiLoader size={16} style={{ animation: 'spin 0.9s linear infinite' }} />
            Validating your secure link...
          </div>
        ) : null}

        {!loading && ready && !validSession ? (
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: '#FEF2F2',
              border: `1px solid rgba(229,57,53,0.18)`,
              color: 'var(--zova-error)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6 }}>
              <FiAlertCircle size={16} />
              Link unavailable
            </div>
            This password setup link is invalid, already used, or expired. Request a fresh reset email to continue.
          </div>
        ) : null}

        {!loading && validSession ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: '#FEF2F2',
                  border: `1px solid rgba(229,57,53,0.18)`,
                  color: 'var(--zova-error)',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: 'var(--zova-green-soft)',
                  border: `1px solid ${'#B8D4A0'}`,
                  color: 'var(--zova-primary-action-hover)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Password updated successfully. Taking you to your dashboard...
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="password" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                  <FiLock size={18} color={'var(--zova-text-muted)'} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  style={inputStyle}
                  disabled={submitting || success}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="confirmPassword" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                  <FiLock size={18} color={'var(--zova-text-muted)'} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  style={inputStyle}
                  disabled={submitting || success}
                />
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                border: `1px solid ${'var(--zova-border)'}`,
                background: 'var(--zova-surface-alt)',
                display: 'grid',
                gap: 10,
              }}
            >
              <RequirementRow met={checks.minLength} label="At least 8 characters" />
              <RequirementRow met={checks.hasUpper} label="One uppercase letter" />
              <RequirementRow met={checks.hasLower} label="One lowercase letter" />
              <RequirementRow met={checks.hasNumber} label="One number" />
              <RequirementRow met={checks.hasSpecial} label="One special character" />
            </div>

            <button
              type="submit"
              disabled={submitting || success}
              style={{
                border: 'none',
                borderRadius: 14,
                padding: '14px 16px',
                background: submitting || success ? 'var(--zova-primary-action-hover)' : 'var(--zova-primary-action)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: submitting || success ? 'default' : 'pointer',
              }}
            >
              {submitting ? 'Updating password...' : success ? 'Password updated' : 'Save new password'}
            </button>
          </form>
        ) : null}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
