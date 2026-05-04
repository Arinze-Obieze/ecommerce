import SignupPage from '@/features/auth/SignupPage';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

function ReqPill({ met, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100,
      background: met ? 'var(--zova-green-soft)' : 'var(--zova-surface-alt)',
      color: met ? 'var(--zova-primary-action-hover)' : 'var(--zova-text-muted)',
      border: `1px solid ${met ? '#B8D4A0' : 'transparent'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: met ? 'var(--zova-primary-action)' : '#DDD', transition: 'background 0.2s' }} />
      {label}
    </span>
  );
}

function FieldWrap({ label, icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', zIndex: 1 }}>{icon}</div>
        {children}
      </div>
    </div>
  );
}

function sanitizePhoneInput(value) {
  return String(value || '').replace(/[^\d+\s()-]/g, '');
}

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [passFocused, setPassFocused]         = useState(false);
  const [submitHov, setSubmitHov]             = useState(false);
  const [agreeTerms, setAgreeTerms]           = useState(false);
  const [logoError, setLogoError]             = useState(false);

  const [foc, setFoc] = useState({});
  const [hov, setHov] = useState({});
  const focusField = (k) => setFoc(p => ({ ...p, [k]: true }));
  const blurField  = (k) => setFoc(p => ({ ...p, [k]: false }));
  const enterField = (k) => setHov(p => ({ ...p, [k]: true }));
  const leaveField = (k) => setHov(p => ({ ...p, [k]: false }));

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
    { label: '',        color: 'var(--zova-border)' },
    { label: 'Weak',    color: 'var(--zova-error)' },
    { label: 'Fair',    color: '#F97316' },
    { label: 'Good',    color: 'var(--zova-accent-emphasis)' },
    { label: 'Strong',  color: 'var(--zova-primary-action)' },
    { label: 'Perfect', color: 'var(--zova-primary-action-hover)' },
  ][passStrength];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, email, phone, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create account'); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch { setError('An unexpected error occurred'); setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } });
      if (error) throw error;
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const inputStyle = (key, extra = {}) => ({
    width: '100%', padding: '13px 14px 13px 44px', borderRadius: 12,
    border: `1.5px solid ${foc[key] ? 'var(--zova-primary-action)' : hov[key] ? '#B8D4A0' : 'var(--zova-border)'}`,
    background: foc[key] ? '#FFFFFF' : 'var(--zova-surface-alt)',
    fontSize: 14, color: 'var(--zova-ink)', outline: 'none', boxSizing: 'border-box',
    transition: 'border 0.18s, background 0.18s, box-shadow 0.18s',
    boxShadow: foc[key] ? '0 0 0 3.5px rgba(46,100,23,0.13)' : 'none',
    ...extra,
  });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .sp-root { font-family: var(--zova-font-sans); }
        .sp-scroll::-webkit-scrollbar { width: 0; }
        .sp-scroll { scrollbar-width: none; }
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
      `}</style>

      <div className="sp-root" style={{
        minHeight: '100vh',
        background: '#F5F1EA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 16px',
      }}>

        {/* SUCCESS OVERLAY */}
        {success && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(245,241,234,0.96)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.25s ease',
          }}>
            <div style={{ textAlign: 'center', animation: 'scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 20px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(46,100,23,0.18)', animation: 'pulseRing 1.1s ease-out infinite' }} />
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,var(--zova-primary-action),var(--zova-primary-action-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 12px 40px rgba(46,100,23,0.4)' }}>
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <path d="M9 19L16.5 26.5L29 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 36, strokeDashoffset: 0, animation: 'checkDraw 0.45s ease 0.2s both' }} />
                  </svg>
                </div>
              </div>
              <p className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--zova-ink)', margin: '0 0 8px', lineHeight: 1.1 }}>Account created!</p>
              <p style={{ fontSize: 14, color: 'var(--zova-text-muted)', margin: 0 }}>Redirecting to sign in…</p>
            </div>
          </div>
        )}

        {/* FORM CARD */}
        <div className="sp-scroll" style={{
          width: '100%', maxWidth: 500,
          background: '#FFFFFF', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(46,100,23,0.10)',
          position: 'relative', overflow: 'hidden',
          overflowY: 'auto', maxHeight: 'calc(100vh - 64px)',
        }}>
          {/* Green top stripe */}
          <div style={{ position: 'sticky', top: 0, height: 3, background: 'linear-gradient(to right, var(--zova-primary-action), var(--zova-primary-action-hover))', zIndex: 10, flexShrink: 0 }} />

          <div style={{ padding: '48px 48px 52px' }}>

            {/* Brand */}
            <div className="fu-1" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: 'var(--zova-green-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(46,100,23,0.18)', overflow: 'hidden',
              }}>
                {!logoError ? (
                  <Image src="/brand/logo.svg" alt="ZOVA" width={38} height={38} className="object-contain" onError={() => setLogoError(true)} />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--zova-primary-action)' }}>Z</span>
                )}
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#191B19', letterSpacing: '-0.04em' }}>ZOVA</span>
            </div>

            {/* Headline */}
            <div className="fu-2" style={{ marginBottom: 28 }}>
              <h1 className="serif" style={{ fontSize: 34, fontWeight: 700, color: '#191B19', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Create your<br />account.
              </h1>
              <p style={{ fontSize: 14, color: 'var(--zova-text-muted)', margin: 0 }}>Join millions of shoppers on ZOVA</p>
            </div>

            <form onSubmit={handleSignup}>

              {error && (
                <div style={{ padding: '11px 16px', borderRadius: 11, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: 'var(--zova-error)', fontWeight: 500, marginBottom: 18, animation: 'fadeDown 0.25s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiX size={14} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              {/* Social */}
              <div className="fu-3" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Google',   icon: <FaGoogle size={14} color="#EA4335" />,    onClick: handleGoogleSignup, k: 'google' },
                  { label: 'Facebook', icon: <FaFacebookF size={14} color="#1877F2" />, onClick: () => {},           k: 'fb' },
                ].map(btn => (
                  <button key={btn.k} type="button" onClick={btn.onClick}
                    onMouseEnter={() => enterField(btn.k)} onMouseLeave={() => leaveField(btn.k)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 12px', borderRadius: 12, cursor: 'pointer',
                      border: '1.5px solid var(--zova-border)',
                      background: hov[btn.k] ? 'var(--zova-surface-alt)' : '#FFFFFF',
                      fontSize: 13.5, fontWeight: 600, color: 'var(--zova-ink)',
                      transition: 'all 0.15s',
                      boxShadow: hov[btn.k] ? '0 3px 10px rgba(0,0,0,0.07)' : 'none',
                      transform: hov[btn.k] ? 'translateY(-1px)' : 'none',
                    }}>
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--zova-border)' }} />
                <span style={{ fontSize: 11, color: '#CCC', fontWeight: 700, letterSpacing: '0.1em' }}>OR SIGN UP WITH EMAIL</span>
                <div style={{ flex: 1, height: 1, background: 'var(--zova-border)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Full Name */}
                <div className="fu-4">
                  <FieldWrap label="Full Name" icon={<FiUser size={15} color={foc.name ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)'} style={{ transition: 'color 0.2s' }} />}>
                    <input type="text" value={fullName} required placeholder="Chidi Okonkwo"
                      onChange={e => setFullName(e.target.value)}
                      onFocus={() => focusField('name')} onBlur={() => blurField('name')}
                      onMouseEnter={() => enterField('name')} onMouseLeave={() => leaveField('name')}
                      style={inputStyle('name')} />
                  </FieldWrap>
                </div>

                {/* Email */}
                <div className="fu-5">
                  <FieldWrap label="Email Address" icon={<FiMail size={15} color={foc.email ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)'} style={{ transition: 'color 0.2s' }} />}>
                    <input type="email" value={email} required placeholder="you@example.com"
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => focusField('email')} onBlur={() => blurField('email')}
                      onMouseEnter={() => enterField('email')} onMouseLeave={() => leaveField('email')}
                      style={inputStyle('email')} />
                  </FieldWrap>
                </div>

                {/* Phone */}
                <div className="fu-6">
                  <FieldWrap label="Phone" icon={<FiPhone size={15} color={foc.phone ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)'} style={{ transition: 'color 0.2s' }} />}>
                    <input type="tel" inputMode="numeric" pattern="[0-9+()\\-\\s]*" value={phone} placeholder="+234 801 234 5678"
                      onChange={e => setPhone(sanitizePhoneInput(e.target.value))}
                      onFocus={() => focusField('phone')} onBlur={() => blurField('phone')}
                      onMouseEnter={() => enterField('phone')} onMouseLeave={() => leaveField('phone')}
                      style={inputStyle('phone')} />
                  </FieldWrap>
                </div>

                {/* Password */}
                <div className="fu-7">
                  <FieldWrap label="Password" icon={<FiLock size={15} color={foc.pass ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)'} style={{ transition: 'color 0.2s' }} />}>
                    <input type={showPass ? 'text' : 'password'} value={password} required placeholder="Create a password"
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => { focusField('pass'); setPassFocused(true); }}
                      onBlur={() => { blurField('pass'); setTimeout(() => setPassFocused(false), 180); }}
                      onMouseEnter={() => enterField('pass')} onMouseLeave={() => leaveField('pass')}
                      style={inputStyle('pass', { paddingRight: 46 })} />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zova-text-muted)', padding: 2, display: 'flex', alignItems: 'center' }}>
                      {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </FieldWrap>
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= passStrength ? strengthMeta.color : 'var(--zova-border)', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      {strengthMeta.label && <p style={{ fontSize: 11, color: strengthMeta.color, fontWeight: 700, margin: 0 }}>{strengthMeta.label} password</p>}
                    </div>
                  )}
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
                <div className="fu-8">
                  <FieldWrap label="Confirm Password"
                    icon={
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? <FiCheck size={15} color="var(--zova-primary-action)" />
                          : <FiX size={15} color="var(--zova-error)" />
                        : <FiLock size={15} color={foc.confirm ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)'} style={{ transition: 'color 0.2s' }} />
                    }>
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} required placeholder="Repeat your password"
                      onChange={e => setConfirmPassword(e.target.value)}
                      onFocus={() => focusField('confirm')} onBlur={() => blurField('confirm')}
                      onMouseEnter={() => enterField('confirm')} onMouseLeave={() => leaveField('confirm')}
                      style={{
                        ...inputStyle('confirm', { paddingRight: 46 }),
                        borderColor: confirmPassword.length > 0 ? (passwordsMatch ? 'var(--zova-primary-action)' : 'var(--zova-error)') : foc.confirm ? 'var(--zova-primary-action)' : hov.confirm ? '#B8D4A0' : 'var(--zova-border)',
                        background:  confirmPassword.length > 0 ? (passwordsMatch ? 'var(--zova-green-soft)' : '#FEF2F2') : foc.confirm ? '#FFFFFF' : 'var(--zova-surface-alt)',
                        boxShadow:   confirmPassword.length > 0 ? (passwordsMatch ? '0 0 0 3px rgba(46,100,23,0.12)' : '0 0 0 3px rgba(229,57,53,0.1)') : foc.confirm ? '0 0 0 3.5px rgba(46,100,23,0.13)' : 'none',
                      }} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zova-text-muted)', padding: 2, display: 'flex', alignItems: 'center' }}>
                      {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </FieldWrap>
                  {confirmPassword.length > 0 && (
                    <p style={{ fontSize: 11.5, fontWeight: 600, margin: '6px 0 0', color: passwordsMatch ? 'var(--zova-primary-action-hover)' : 'var(--zova-error)', animation: 'fadeDown 0.2s ease' }}>
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
                  border: `2px solid ${agreeTerms ? 'var(--zova-primary-action)' : 'var(--zova-border)'}`,
                  background: agreeTerms ? 'var(--zova-primary-action)' : '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {agreeTerms && <FiCheck size={10} color="#fff" strokeWidth={3.5} />}
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--zova-text-body)', lineHeight: 1.5, userSelect: 'none' }}>
                  I agree to ZOVA's{' '}
                  <Link href="/terms" style={{ color: 'var(--zova-primary-action)', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" style={{ color: 'var(--zova-primary-action)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
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
                    background: loading || !agreeTerms ? 'var(--zova-border)' : submitHov ? 'var(--zova-primary-action-hover)' : 'var(--zova-primary-action)',
                    color: loading || !agreeTerms ? 'var(--zova-text-muted)' : '#FFFFFF',
                    boxShadow: !loading && agreeTerms && submitHov ? '0 10px 30px rgba(46,100,23,0.4)' : !loading && agreeTerms ? '0 5px 18px rgba(46,100,23,0.28)' : 'none',
                    transform: !loading && agreeTerms && submitHov ? 'translateY(-1px)' : 'none',
                    transition: 'all 0.18s', marginBottom: 20,
                  }}>
                  {loading
                    ? <><svg style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} width={17} height={17} viewBox="0 0 17 17" fill="none">
                        <circle cx="8.5" cy="8.5" r="6" stroke="rgba(0,0,0,0.18)" strokeWidth="2.5" />
                        <path d="M8.5 2.5a6 6 0 016 6" stroke="var(--zova-text-body)" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>Creating account…</>
                    : <>Create Account &nbsp;<FiArrowRight size={15} /></>
                  }
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--zova-text-muted)', margin: 0 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--zova-primary-action)', fontWeight: 700, textDecoration: 'none' }}>
                  Sign in →
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}
