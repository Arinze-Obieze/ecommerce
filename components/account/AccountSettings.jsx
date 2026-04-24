"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { FiSave, FiUser, FiLock } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/contexts/toast/ToastContext';

// Brand tokens — sourced from app/globals.css
const THEME = {
  green:       'var(--zova-primary-action)',
  greenDark:   'var(--zova-primary-action-hover)',
  greenTint:   'var(--zova-green-soft)',
  greenBorder: '#B8D4A0',
  white:       '#FFFFFF',
  pageBg:      'var(--zova-linen)',
  charcoal:    'var(--zova-ink)',
  medGray:     'var(--zova-text-body)',
  mutedText:   'var(--zova-text-muted)',
  border:      'var(--zova-border)',
  softGray:    'var(--zova-surface-alt)',
};

// ─── SHARED FIELD COMPONENTS ──────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: THEME.medGray, letterSpacing: '0.02em' }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: THEME.mutedText, margin: 0 }}>{hint}</p>}
  </div>
);

const Input = ({ disabled, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        padding: '11px 14px',
        fontSize: 14,
        color: disabled ? THEME.mutedText : THEME.charcoal,
        background: disabled ? THEME.softGray : THEME.white,
        border: `1.5px solid ${focused ? THEME.green : THEME.border}`,
        borderRadius: 10,
        outline: 'none',
        boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'text',
        transition: 'border-color 0.2s',
      }}
    />
  );
};

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }) => (
  <div
    style={{
      background: THEME.white,
      border: `1px solid ${THEME.border}`,
      borderRadius: 18,
      overflow: 'hidden',
    }}
  >
    {/* Section header */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '18px 24px',
        borderBottom: `1px solid ${THEME.border}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: THEME.greenTint,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} style={{ color: THEME.green }} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.015em' }}>
        {title}
      </h3>
    </div>

    {/* Section body */}
    <div style={{ padding: '22px 24px' }}>
      {children}
    </div>
  </div>
);

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse"
        style={{ height: 180, borderRadius: 18, background: THEME.softGray, border: `1px solid ${THEME.border}` }}
      />
    ))}
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AccountSettings() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [saveHov, setSaveHov]     = useState(false);
  const [formData, setFormData]   = useState({
    fullName: '', email: user?.email || '',
    phone: '',
    currentPassword: '', newPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const res  = await fetch('/api/account/profile', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Could not load profile');
        setFormData((prev) => ({
          ...prev,
          fullName: json?.data?.fullName || user?.user_metadata?.full_name || '',
          email:    json?.data?.email    || user?.email || '',
          phone:    json?.data?.phone    || '',
        }));
      } catch (e) {
        showError(e.message || 'Could not load profile settings');
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) loadProfile();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { showError('Full name is required'); return; }
    const wantsPwChange = formData.newPassword.trim().length > 0;
    if (wantsPwChange && !formData.currentPassword.trim()) { showError('Current password is required to set a new password'); return; }
    if (wantsPwChange && formData.newPassword.trim().length < 8) { showError('New password must be at least 8 characters'); return; }

    setIsSaving(true);
    try {
      const profileRes  = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: formData.fullName, phone: formData.phone }),
      });
      const profileJson = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileJson.error || 'Failed to save profile');

      const supabase = createClient();
      if (wantsPwChange) {
        const { error: reauthErr } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.currentPassword });
        if (reauthErr) throw new Error('Current password is incorrect');
        const { error: pwErr } = await supabase.auth.updateUser({ password: formData.newPassword, data: { full_name: formData.fullName } });
        if (pwErr) throw new Error(pwErr.message || 'Failed to update password');
      } else {
        await supabase.auth.updateUser({ data: { full_name: formData.fullName } });
      }

      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      success(wantsPwChange ? 'Profile and password updated' : 'Profile updated');
    } catch (err) {
      showError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Page header ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText, margin: 0, marginBottom: 4 }}>
          My Account
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.025em' }}>
          Account Settings
        </h2>
      </div>

      {isLoading ? <Skeleton /> : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Personal Details ── */}
          <Section icon={FiUser} title="Personal Details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-cols-1 md:grid-cols-2">
              <Field label="Full Name">
                <Input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </Field>
              <Field label="Email Address" hint="Email cannot be changed">
                <Input type="email" name="email" value={formData.email} disabled />
              </Field>
              <Field label="Phone Number">
                <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+234" />
              </Field>
            </div>
          </Section>

          {/* ── Security ── */}
          <Section icon={FiLock} title="Security">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-cols-1 md:grid-cols-2">
              <Field label="Current Password" hint="Required only when changing password">
                <Input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="••••••••" />
              </Field>
              <Field label="New Password" hint="Leave blank to keep current password">
                <Input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Min. 8 characters" />
              </Field>
            </div>
          </Section>

          {/* ── Submit ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSaving}
              onMouseEnter={() => setSaveHov(true)}
              onMouseLeave={() => setSaveHov(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 11,
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                color: THEME.white,
                background: isSaving ? THEME.mutedText : saveHov ? THEME.greenDark : THEME.green,
                opacity: isSaving ? 0.7 : 1,
                transition: 'background 0.2s',
              }}
            >
              <FiSave size={15} />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
