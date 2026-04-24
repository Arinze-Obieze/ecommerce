'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

// Brand tokens — sourced from app/globals.css CSS custom properties
const T = {
  green:       'var(--zova-primary-action)',
  greenDark:   'var(--zova-primary-action-hover)',
  greenDeep:   'var(--zova-text-strong)',
  greenTint:   'var(--zova-green-soft)',
  greenBorder: '#B8D4A0',
  charcoal:    'var(--zova-ink)',
  softGray:    'var(--zova-surface-alt)',
  pageBg:      'var(--zova-linen)',
  border:      'var(--zova-border)',
  medGray:     'var(--zova-text-body)',
  mutedText:   'var(--zova-text-muted)',
  white:       '#FFFFFF',
  red:         'var(--zova-error)',
  redLight:    '#FEF2F2',
  gold:        'var(--zova-accent-emphasis)',
};

// ─────────────────────────────────────────────────────────────
// PANEL IMAGES — right side fashion slideshow
// ─────────────────────────────────────────────────────────────
const SLIDES = [
  {
    url:     'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1200&fit=crop&auto=format',
    caption: 'Join 500K+\nSmart Shoppers.',
    sub:     'Fashion, beauty and lifestyle — all in one place',
  },
  {
    url:     'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&h=1200&fit=crop&auto=format',
    caption: 'Discover Styles\nMade for You.',
    sub:     'Personalised picks from Nigeria\'s top sellers',
  },
  {
    url:     'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=1200&fit=crop&auto=format',
    caption: 'Shop. Save.\nRepeat.',
    sub:     'Exclusive deals for ZOVA members every day',
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function ReqPill({ met, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100,
      background: met ? T.greenTint : T.softGray,
      color: met ? T.greenDark : T.mutedText,
      border: `1px solid ${met ? T.greenBorder : 'transparent'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: met ? T.green : '#DDD',
        transition: 'background 0.2s',
      }} />
      {label}
    </span>
  );
}

function FieldWrap({ label, icon, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', zIndex: 1 }}>
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

function sanitizePhoneInput(value) {
  return String(value || '').replace(/[^\d+\s()-]/g, '');
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                  = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [passFocused, setPassFocused]     = useState(false);
  const [slide, setSlide]                 = useState(0);
  const [mounted, setMounted]             = useState(false);
  const [submitHov, setSubmitHov]         = useState(false);
  const [agreeTerms, setAgreeTerms]       = useState(false);
  const [logoError, setLogoError]         = useState(false);

  // Field focus states
  const [foc, setFoc] = useState({});
  const [hov, setHov] = useState({});

  const focusField  = (k) => setFoc(p => ({ ...p, [k]: true }));
  const blurField   = (k) => setFoc(p => ({ ...p, [k]: false }));
  const enterField  = (k) => setHov(p => ({ ...p, [k]: true }));
  const leaveField  = (k) => setHov(p => ({ ...p, [k]: false }));

  const reqs = {
    minLength:  password.length >= 8,
    hasUpper:   /[A-Z]/.test(password),
    hasLower:   /[a-z]/.test(password),
    hasNumber:  /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const passStrength   = Object.values(reqs).filter(Boolean).length;
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const strengthMeta   = [
    { label: '',        color: T.border },
    { label: 'Weak',    color: T.red },
    { label: 'Fair',    color: '#F97316' },
    { label: 'Good',    color: T.gold },
    { label: 'Strong',  color: T.green },
    { label: 'Perfect', color: T.greenDark },
  ][passStrength];

  useEffect(() => { setMounted(true); }, []);

  // Auto-advance panel
  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create account'); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch { setError('An unexpected error occurred'); setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const inputStyle = (key, extra = {}) => ({
    width: '100%',
    padding: '13px 14px 13px 44px',
    borderRadius: 12,
    border: `1.5px solid ${foc[key] ? T.green : hov[key] ? T.greenBorder : T.border}`,
    background: foc[key] ? T.white : T.softGray,
    fontSize: 14,
    color: T.charcoal,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.18s, background 0.18s, box-shadow 0.18s',
    boxShadow: foc[key] ? `0 0 0 3.5px rgba(46,100,23,0.13)` : 'none',
    ...extra,
  });

  return (
    <>
      <style>{`
                * { box-sizing: border-box; }
        .sp-root  { font-family: var(--zova-font-sans); }
        
        @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.82); } to { opacity:1; transform:scale(1); } }
        @keyframes spin     { to { transform:rotate(360deg); } }
        @keyframes pulseRing {
          0%   { transform:scale(1);   opacity:0.5; }
          100% { transform:scale(1.6); opacity:0; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset:36; }
          to   { stroke-dashoffset:0; }
        }
        @keyframes slideCaption {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:none; }
        }

        .fu-1  { animation: fadeUp 0.48s ease 0.04s both; }
        .fu-2  { animation: fadeUp 0.48s ease 0.10s both; }
        .fu-3  { animation: fadeUp 0.48s ease 0.16s both; }
        .fu-4  { animation: fadeUp 0.48s ease 0.22s both; }
        .fu-5  { animation: fadeUp 0.48s ease 0.28s both; }
        .fu-6  { animation: fadeUp 0.48s ease 0.34s both; }
        .fu-7  { animation: fadeUp 0.48s ease 0.40s both; }
        .fu-8  { animation: fadeUp 0.48s ease 0.46s both; }
        .fu-9  { animation: fadeUp 0.48s ease 0.52s both; }
        .fu-10 { animation: fadeUp 0.48s ease 0.58s both; }

        /* Hide scrollbar but keep scrolling */
        .sp-scroll::-webkit-scrollbar { width: 0; }
        .sp-scroll { scrollbar-width: none; }

      `}</style>

      <div className="sp-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.pageBg }}>

        {/* ── SUCCESS OVERLAY ── */}
        {success && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.25s ease',
          }}>
            <div style={{ textAlign: 'center', animation: 'scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 20px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(46,100,23,0.18)', animation: 'pulseRing 1.1s ease-out infinite' }} />
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg,${T.green},${T.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: `0 12px 40px rgba(46,100,23,0.4)` }}>
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <path d="M9 19L16.5 26.5L29 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 36, strokeDashoffset: 0, animation: 'checkDraw 0.45s ease 0.2s both' }} />
                  </svg>
                </div>
              </div>
              <p className="serif" style={{ fontSize: 32, fontWeight: 700, color: T.charcoal, margin: '0 0 8px', lineHeight: 1.1 }}>Account created!</p>
              <p style={{ fontSize: 14, color: T.mutedText, margin: 0 }}>Redirecting to sign in…</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            LEFT — form panel
        ══════════════════════════════════════════ */}
        <div className="sp-scroll" style={{
          flex: '0 0 min(520px, 100%)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto', position: 'relative',
          background: T.white, zIndex: 2,
          boxShadow: '2px 0 32px rgba(0,0,0,0.06)',
        }}>
          {/* Green top stripe */}
          <div style={{ position: 'sticky', top: 0, height: 3, background: `linear-gradient(to right, ${T.green}, ${T.greenDark})`, zIndex: 10, flexShrink: 0 }} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 52px' }}>
            <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>

              {/* Brand with custom icon */}
              <div className="fu-1" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                <div style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 10, 
                  background: `linear-gradient(135deg,${T.greenTint},${T.greenTint})`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: `0 4px 12px rgba(46,100,23,0.3)`,
                  overflow: 'hidden'
                }}>
                  {!logoError ? (
                    <Image
                      src="/brand/logo.svg"
                      alt="ZOVA"
                      width={100}
                      height={100}
                      className="object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "var(--zova-font-sans)" }}>Z</span>
                  )}
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: T.charcoal, letterSpacing: '-0.04em' }}>ZOVA</span>
              </div>

              {/* Headline */}
              <div className="fu-2" style={{ marginBottom: 32 }}>
                <h1 className="serif" style={{ fontSize: 38, fontWeight: 700, color: T.charcoal, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Create your<br />account.
                </h1>
                <p style={{ fontSize: 14, color: T.mutedText, margin: 0 }}>Join millions of shoppers on ZOVA</p>
              </div>

              <form onSubmit={handleSignup}>
                {/* Error */}
                {error && (
                  <div style={{ padding: '11px 16px', borderRadius: 11, background: T.redLight, border: '1px solid #FECACA', fontSize: 13, color: T.red, fontWeight: 500, marginBottom: 18, animation: 'fadeDown 0.25s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiX size={14} style={{ flexShrink: 0 }} /> {error}
                  </div>
                )}

                {/* Social first — reduces form fatigue */}
                <div className="fu-3" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Google',   icon: <FaGoogle size={14} color="#EA4335" />,  onClick: handleGoogleSignup, k: 'google' },
                    { label: 'Facebook', icon: <FaFacebookF size={14} color="#1877F2" />, onClick: () => {},          k: 'fb' },
                  ].map(btn => (
                    <button key={btn.k} type="button" onClick={btn.onClick}
                      onMouseEnter={() => enterField(btn.k)} onMouseLeave={() => leaveField(btn.k)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '11px 12px', borderRadius: 12, cursor: 'pointer',
                        border: `1.5px solid ${T.border}`,
                        background: hov[btn.k] ? T.softGray : T.white,
                        fontSize: 13.5, fontWeight: 600, color: T.charcoal,
                        transition: 'all 0.15s',
                        boxShadow: hov[btn.k] ? '0 3px 10px rgba(0,0,0,0.07)' : 'none',
                        transform: hov[btn.k] ? 'translateY(-1px)' : 'none',
                      }}>
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                  <span style={{ fontSize: 11, color: '#CCC', fontWeight: 700, letterSpacing: '0.1em' }}>OR SIGN UP WITH EMAIL</span>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                </div>

                {/* ── 2-col grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 14px' }}>

                  {/* Full Name */}
                  <div className="fu-4" style={{ gridColumn: '1 / -1' }}>
                    <FieldWrap label="Full Name" icon={<FiUser size={15} color={foc.name ? T.green : T.mutedText} style={{ transition: 'color 0.2s' }} />}>
                      <input type="text" value={fullName} required placeholder="Chidi Okonkwo"
                        onChange={e => setFullName(e.target.value)}
                        onFocus={() => focusField('name')} onBlur={() => blurField('name')}
                        onMouseEnter={() => enterField('name')} onMouseLeave={() => leaveField('name')}
                        style={inputStyle('name')} />
                    </FieldWrap>
                  </div>

                  {/* Email */}
                  <div className="fu-5" style={{ gridColumn: '1 / -1' }}>
                    <FieldWrap label="Email Address" icon={<FiMail size={15} color={foc.email ? T.green : T.mutedText} style={{ transition: 'color 0.2s' }} />}>
                      <input type="email" value={email} required placeholder="you@example.com"
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => focusField('email')} onBlur={() => blurField('email')}
                        onMouseEnter={() => enterField('email')} onMouseLeave={() => leaveField('email')}
                        style={inputStyle('email')} />
                    </FieldWrap>
                  </div>

                  {/* Phone */}
                  <div className="fu-6" style={{ gridColumn: '1 / -1' }}>
                    <FieldWrap label="Phone" icon={<FiPhone size={15} color={foc.phone ? T.green : T.mutedText} style={{ transition: 'color 0.2s' }} />}>
                      <input type="tel" inputMode="numeric" pattern="[0-9+()\\-\\s]*" value={phone} placeholder="+234 801 234 5678"
                        onChange={e => setPhone(sanitizePhoneInput(e.target.value))}
                        onFocus={() => focusField('phone')} onBlur={() => blurField('phone')}
                        onMouseEnter={() => enterField('phone')} onMouseLeave={() => leaveField('phone')}
                        style={inputStyle('phone')} />
                    </FieldWrap>
                  </div>

                  {/* Password */}
                  <div className="fu-7" style={{ gridColumn: '1 / -1' }}>
                    <FieldWrap label="Password" icon={<FiLock size={15} color={foc.pass ? T.green : T.mutedText} style={{ transition: 'color 0.2s' }} />}>
                      <input type={showPass ? 'text' : 'password'} value={password} required placeholder="Create a password"
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => { focusField('pass'); setPassFocused(true); }}
                        onBlur={() => { blurField('pass'); setTimeout(() => setPassFocused(false), 180); }}
                        onMouseEnter={() => enterField('pass')} onMouseLeave={() => leaveField('pass')}
                        style={inputStyle('pass', { paddingRight: 46 })} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.mutedText, padding: 2, display: 'flex', alignItems: 'center' }}>
                        {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </FieldWrap>

                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= passStrength ? strengthMeta.color : T.border, transition: 'background 0.3s' }} />
                          ))}
                        </div>
                        {strengthMeta.label && <p style={{ fontSize: 11, color: strengthMeta.color, fontWeight: 700, margin: 0 }}>{strengthMeta.label} password</p>}
                      </div>
                    )}

                    {/* Req pills — on focus */}
                    {passFocused && password.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, animation: 'fadeDown 0.2s ease' }}>
                        <ReqPill met={reqs.minLength}  label="8+ chars" />
                        <ReqPill met={reqs.hasUpper}   label="Uppercase" />
                        <ReqPill met={reqs.hasLower}   label="Lowercase" />
                        <ReqPill met={reqs.hasNumber}  label="Number" />
                        <ReqPill met={reqs.hasSpecial} label="Symbol" />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="fu-8" style={{ gridColumn: '1 / -1' }}>
                    <FieldWrap label="Confirm Password"
                      icon={
                        confirmPassword.length > 0
                          ? passwordsMatch
                            ? <FiCheck size={15} color={T.green} />
                            : <FiX size={15} color={T.red} />
                          : <FiLock size={15} color={foc.confirm ? T.green : T.mutedText} style={{ transition: 'color 0.2s' }} />
                      }>
                      <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} required placeholder="Repeat your password"
                        onChange={e => setConfirmPassword(e.target.value)}
                        onFocus={() => focusField('confirm')} onBlur={() => blurField('confirm')}
                        onMouseEnter={() => enterField('confirm')} onMouseLeave={() => leaveField('confirm')}
                        style={{
                          ...inputStyle('confirm', { paddingRight: 46 }),
                          borderColor: confirmPassword.length > 0 ? (passwordsMatch ? T.green : T.red) : foc.confirm ? T.green : hov.confirm ? T.greenBorder : T.border,
                          background:  confirmPassword.length > 0 ? (passwordsMatch ? T.greenTint : T.redLight) : foc.confirm ? T.white : T.softGray,
                          boxShadow:   confirmPassword.length > 0 ? (passwordsMatch ? `0 0 0 3px rgba(46,100,23,0.12)` : `0 0 0 3px rgba(229,57,53,0.1)`) : foc.confirm ? `0 0 0 3.5px rgba(46,100,23,0.13)` : 'none',
                        }} />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.mutedText, padding: 2, display: 'flex', alignItems: 'center' }}>
                        {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </FieldWrap>
                    {confirmPassword.length > 0 && (
                      <p style={{ fontSize: 11.5, fontWeight: 600, margin: '6px 0 0', color: passwordsMatch ? T.greenDark : T.red, animation: 'fadeDown 0.2s ease' }}>
                        {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="fu-9" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '20px 0 22px', cursor: 'pointer' }}
                  onClick={() => setAgreeTerms(v => !v)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    border: `2px solid ${agreeTerms ? T.green : T.border}`,
                    background: agreeTerms ? T.green : T.white,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {agreeTerms && <FiCheck size={10} color="#fff" strokeWidth={3.5} />}
                  </div>
                  <span style={{ fontSize: 12.5, color: T.medGray, lineHeight: 1.5, userSelect: 'none' }}>
                    I agree to ZOVA's{' '}
                    <Link href="/terms" style={{ color: T.green, fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" style={{ color: T.green, fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
                  </span>
                </div>

                {/* CTA */}
                <div className="fu-10">
                  <button type="submit" disabled={loading || !agreeTerms}
                    onMouseEnter={() => setSubmitHov(true)} onMouseLeave={() => setSubmitHov(false)}
                    style={{
                      width: '100%', padding: 14, border: 'none', borderRadius: 13,
                      fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      cursor: loading || !agreeTerms ? 'not-allowed' : 'pointer',
                      background: loading || !agreeTerms ? T.border : submitHov ? T.greenDark : T.green,
                      color: loading || !agreeTerms ? T.mutedText : T.white,
                      boxShadow: !loading && agreeTerms && submitHov ? `0 10px 30px rgba(46,100,23,0.4)` : !loading && agreeTerms ? `0 5px 18px rgba(46,100,23,0.28)` : 'none',
                      transform: !loading && agreeTerms && submitHov ? 'translateY(-1px)' : 'none',
                      transition: 'all 0.18s',
                      marginBottom: 20,
                    }}>
                    {loading
                      ? <><svg style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} width={17} height={17} viewBox="0 0 17 17" fill="none">
                          <circle cx="8.5" cy="8.5" r="6" stroke="rgba(0,0,0,0.18)" strokeWidth="2.5" />
                          <path d="M8.5 2.5a6 6 0 016 6" stroke={T.medGray} strokeWidth="2.5" strokeLinecap="round" />
                        </svg>Creating account…</>
                      : <>Create Account &nbsp;<FiArrowRight size={15} /></>
                    }
                  </button>
                </div>

                {/* Sign in */}
                <p style={{ textAlign: 'center', fontSize: 13.5, color: T.mutedText, margin: 0 }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: T.green, fontWeight: 700, textDecoration: 'none' }}>
                    Sign in →
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — fashion imagery panel
        ══════════════════════════════════════════ */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', minHeight: '100vh' }}>
          {SLIDES.map((s, i) => (
            <img key={i} src={s.url} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === slide ? 1 : 0,
              transform: i === slide ? 'scale(1.04)' : 'scale(1)',
              transition: 'opacity 0.9s ease, transform 6.5s ease',
            }} />
          ))}

          {/* Overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.12) 60%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />

          {/* Caption */}
          <div style={{ position: 'absolute', bottom: 48, left: 44, right: 44, zIndex: 5 }}>
            <div key={slide} style={{ animation: 'slideCaption 0.6s ease both' }}>
              <h2 className="serif" style={{
                fontSize: 44, fontWeight: 700, color: '#fff', margin: '0 0 10px',
                lineHeight: 1.12, letterSpacing: '-0.02em',
                textShadow: '0 2px 24px rgba(0,0,0,0.35)', whiteSpace: 'pre-line',
              }}>
                {SLIDES[slide].caption}
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', margin: '0 0 24px', fontWeight: 400 }}>
                {SLIDES[slide].sub}
              </p>
            </div>

            {/* Trust pills */}
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 24 }}>
              {['500K+ Members','Free Delivery on Orders','Buyer Protection','Easy Returns'].map(tag => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{tag}</span>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', gap: 7 }}>
              {SLIDES.map((_, i) => (
                <div key={i} onClick={() => setSlide(i)} style={{
                  height: 3, borderRadius: 99, cursor: 'pointer',
                  width: i === slide ? 28 : 7,
                  background: i === slide ? T.green : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.4s',
                }} />
              ))}
            </div>
          </div>

          {/* ZOVA brand top-right with custom icon */}
          <div style={{ position: 'absolute', top: 32, right: 36, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 60, 
              height: 60, 
              borderRadius: 9, 
              background: 'rgba(255,255,255,0.15)', 
              backdropFilter: 'blur(8px)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px solid rgba(255,255,255,0.2)',
              overflow: 'hidden'
            }}>
              {!logoError ? (
                <Image
                  src="/brand/logo.svg"
                  alt="ZOVA"
                  width={50}
                  height={50}
                  className="object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Z</span>
              )}
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.03em' }}>ZOVA</span>
          </div>

          {/* Step indicators — shows signup is quick */}
          <div style={{ position: 'absolute', top: 32, left: 44, zIndex: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {['Info','Password','Done'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i === 0 ? T.green : 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: `1.5px solid ${i === 0 ? T.green : 'rgba(255,255,255,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.45)' }}>{step}</span>
                  {i < 2 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.2)' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
