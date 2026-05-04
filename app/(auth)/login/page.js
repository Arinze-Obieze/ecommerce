'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

/* ─── Password requirement row ─── */
function ReqRow({ met, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        background: met ? '#2E6417' : '#E0DAD0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, transform 0.2s',
        transform: met ? 'scale(1.1)' : 'scale(1)',
      }}>
        {met && <FiCheck size={9} color="#fff" strokeWidth={3.5} />}
      </div>
      <span style={{
        fontSize: 12,
        color: met ? '#2E6417' : '#999',
        fontWeight: met ? 600 : 400,
        transition: 'color 0.2s',
      }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Zova Cart Icon ─── */
function ZovaIcon({ size = 26, primaryColor = '#2E6417', accentColor = '#EC9C00' }) {
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 26 22" fill="none">
      <path d="M3 2H6L10 14H20" stroke={primaryColor} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 14L8 8H21L19 14" stroke={primaryColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="19" r="2" fill={accentColor} />
      <circle cx="17" cy="19" r="2" fill={accentColor} />
    </svg>
  );
}

/* ─── SVG Halftone dot pattern (brand signature) ─── */
function DotPattern() {
  return (
    <svg
      style={{ position: 'absolute', top: -40, right: -60, opacity: 0.15, pointerEvents: 'none' }}
      width={340} height={340} viewBox="0 0 340 340"
    >
      <defs>
        <pattern id="halftone" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.2" fill="#EC9C00" />
        </pattern>
        <radialGradient id="fade-mask" cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="dot-mask">
          <rect width="340" height="340" fill="url(#fade-mask)" />
        </mask>
      </defs>
      <rect width="340" height="340" fill="url(#halftone)" mask="url(#dot-mask)" />
    </svg>
  );
}

/* ─── Geometric star (brand motif) ─── */
function StarDeco() {
  return (
    <svg
      style={{ position: 'absolute', bottom: 130, right: 44, opacity: 0.1, pointerEvents: 'none' }}
      width={110} height={110} viewBox="0 0 120 120"
    >
      <path d="M60 0 L63 57 L120 60 L63 63 L60 120 L57 63 L0 60 L57 57 Z" fill="#EC9C00" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Main Login Page
───────────────────────────────────────── */
export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [logoError, setLogoError]     = useState(false);

  const reqs = {
    minLength:  password.length >= 8,
    hasUpper:   /[A-Z]/.test(password),
    hasLower:   /[a-z]/.test(password),
    hasNumber:  /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const passStrength   = Object.values(reqs).filter(Boolean).length;
  const strengthLabel  = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Perfect'][passStrength];
  const strengthColor  = ['#E0DAD0', '#EF4444', '#F97316', '#EC9C00', '#2E6417', '#1a4010'][passStrength];

  /* ── Auth helpers ── */
  const resolveRedirectTarget = async () => {
    const fallback = '/';
    for (let i = 0; i < 4; i++) {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) { await delay(200); continue; }
      const res  = await fetch('/api/auth/post-login-target', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (typeof json?.target === 'string' && json.target !== '/login') return json.target;
      await delay(200);
    }
    return fallback;
  };
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      const target = await resolveRedirectTarget();
      setSuccess(true);
      setTimeout(() => router.replace(target), 1800);
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  /* ── Shared input style ── */
  const inputStyle = (focused) => ({
    width: '100%',
    padding: '16px 16px 16px 50px',
    borderRadius: 14,
    border: `1.5px solid ${focused ? '#2E6417' : '#E0DAD0'}`,
    background: focused ? '#ffffff' : '#faf8f4',
    fontSize: 16,
    fontFamily: 'inherit',
    color: '#191B19',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border .18s, background .18s, box-shadow .18s',
    boxShadow: focused ? '0 0 0 4px rgba(46,100,23,0.1)' : 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .zova-login { font-family: 'Plus Jakarta Sans', sans-serif; }
        .zova-serif { font-family: 'DM Serif Display', serif; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); }  to { opacity:1; transform:none; } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); }  to { opacity:1; transform:none; } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.82); }       to { opacity:1; transform:scale(1); } }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes pulseRing {
          0%   { transform:scale(1);    opacity:0.5; }
          100% { transform:scale(1.65); opacity:0; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset:36; }
          to   { stroke-dashoffset:0; }
        }

        .f1 { animation: fadeUp .48s ease .05s both; }
        .f2 { animation: fadeUp .48s ease .12s both; }
        .f3 { animation: fadeUp .48s ease .19s both; }
        .f4 { animation: fadeUp .48s ease .26s both; }
        .f5 { animation: fadeUp .48s ease .33s both; }
        .f6 { animation: fadeUp .48s ease .40s both; }
        .f7 { animation: fadeUp .48s ease .47s both; }
        .f8 { animation: fadeUp .48s ease .54s both; }

        .social-btn:hover { background: #F5F1EA !important; border-color: #C8BFB0 !important; transform: translateY(-1px); }
        .submit-btn:hover:not(:disabled) { background: #214A10 !important; transform: translateY(-1.5px); box-shadow: 0 10px 32px rgba(46,100,23,0.38) !important; }
        .forgot-link:hover { text-decoration: underline; }
      `}</style>

      <div className="zova-login" style={{ display: 'flex', minHeight: '100vh', background: '#191B19' }}>

        {/* ── SUCCESS OVERLAY ── */}
        {success && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(245,241,234,0.96)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn .25s ease',
          }}>
            <div style={{ textAlign: 'center', animation: 'scaleIn .45s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 20px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(46,100,23,0.15)', animation: 'pulseRing 1.1s ease-out infinite' }} />
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#2E6417,#1a4010)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 12px 40px rgba(46,100,23,0.4)' }}>
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <path d="M9 19L16.5 26.5L29 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 36, strokeDashoffset: 0, animation: 'checkDraw .45s ease .2s both' }} />
                  </svg>
                </div>
              </div>
              <p className="zova-serif" style={{ fontSize: 34, color: '#191B19', margin: '0 0 8px', lineHeight: 1.1 }}>You're in!</p>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Taking you to the market…</p>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            LEFT — BRAND PANEL
        ════════════════════════════ */}
        <div style={{
          width: '42%', background: '#191B19',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '44px 48px',
          // Hide on small screens — add media query in global CSS if needed
        }}>

          <DotPattern />
          <StarDeco />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(46,100,23,0.85)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/brand/logo-white.svg" alt="ZOVA" width={36} height={30} />
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>ZOVA</span>
          </div>

          {/* Brand copy */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 0 24px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#EC9C00', textTransform: 'uppercase', marginBottom: 16 }}>
              Fashion Marketplace
            </p>
            <h2 className="zova-serif" style={{ fontSize: 44, lineHeight: 1.08, color: '#fff', marginBottom: 20 }}>
              Nigeria's<br />
              <em style={{ color: '#EC9C00' }}>Biggest</em><br />
              Marketplace.
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, maxWidth: 280, marginBottom: 0 }}>
              Shop the latest fashion and essentials from trusted, verified African sellers.
            </p>
          </div>

          {/* Trust badges */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Verified Stores', 'Fast Delivery', 'Buyer Protected'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '6px 12px', fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#EC9C00' }} />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — FORM PANEL
        ════════════════════════════ */}
        <div style={{
          width: '58%', background: '#F5F1EA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 56px', position: 'relative',
        }}>
          {/* Green top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(to right, #2E6417, #EC9C00)' }} />

          <div style={{ width: '100%', maxWidth: 480 }}>

            {/* Form logo */}
            <div className="f1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <div style={{ width: 52, height: 52, borderRadius: 13, background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!logoError ? (
                  <Image src="/brand/logo.svg" alt="ZOVA" width={34} height={28} onError={() => setLogoError(true)} />
                ) : (
                  <ZovaIcon size={28} primaryColor="#2E6417" accentColor="#EC9C00" />
                )}
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#191B19', letterSpacing: '-0.03em' }}>ZOVA</span>
            </div>

            {/* Headline */}
            <div className="f2" style={{ marginBottom: 32 }}>
              <h1 className="zova-serif" style={{ fontSize: 42, fontWeight: 400, color: '#191B19', margin: '0 0 10px', lineHeight: 1.1 }}>
                Welcome back.
              </h1>
              <p style={{ fontSize: 15, color: '#888', margin: 0, lineHeight: 1.5 }}>
                Sign in to your ZOVA account to continue
              </p>
            </div>

            <form onSubmit={handleLogin}>

              {/* Error */}
              {error && (
                <div style={{ padding: '13px 18px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 14, color: '#DC2626', fontWeight: 500, marginBottom: 20, animation: 'fadeDown .25s ease' }}>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="f3" style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555', marginBottom: 9 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <FiMail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                  <input
                    type="email" value={email} required autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="f4" style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555' }}>
                    Password
                  </label>
                  <Link href="/forgot-password" className="forgot-link" style={{ fontSize: 14, color: '#2E6417', fontWeight: 600, textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <FiLock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: passFocused ? '#2E6417' : '#aaa', transition: 'color .2s', pointerEvents: 'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'} value={password} required
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setTimeout(() => setPassFocused(false), 180)}
                    placeholder="Enter your password"
                    style={{ ...inputStyle(passFocused), paddingRight: 52 }}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 2, display: 'flex', alignItems: 'center' }}>
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= passStrength ? strengthColor : '#E0DAD0', transition: 'background .3s' }} />
                      ))}
                    </div>
                    {strengthLabel && (
                      <p style={{ fontSize: 12, color: strengthColor, fontWeight: 700, margin: 0 }}>{strengthLabel} password</p>
                    )}
                  </div>
                )}

                {/* Requirements */}
                {passFocused && password.length > 0 && (
                  <div style={{ marginTop: 12, padding: '14px 16px', borderRadius: 13, background: '#EAF3DE', border: '1px solid #B8D4A0', display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeDown .2s ease' }}>
                    <ReqRow met={reqs.minLength}  label="At least 8 characters" />
                    <ReqRow met={reqs.hasUpper}   label="One uppercase letter" />
                    <ReqRow met={reqs.hasLower}   label="One lowercase letter" />
                    <ReqRow met={reqs.hasNumber}  label="One number" />
                    <ReqRow met={reqs.hasSpecial} label="One special character (!@#…)" />
                  </div>
                )}
              </div>

              {/* Remember me */}
              <div className="f5"
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26, cursor: 'pointer' }}
                onClick={() => setRememberMe((v) => !v)}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${rememberMe ? '#2E6417' : '#D0C9BF'}`,
                  background: rememberMe ? '#2E6417' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}>
                  {rememberMe && <FiCheck size={13} color="#fff" strokeWidth={3.5} />}
                </div>
                <span style={{ fontSize: 15, color: '#555', userSelect: 'none' }}>Keep me signed in</span>
              </div>

              {/* Submit */}
              <div className="f6">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                  style={{
                    width: '100%', padding: '17px 0', border: 'none', borderRadius: 14,
                    fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    background: loading ? '#C8BFB0' : '#2E6417',
                    color: '#fff',
                    boxShadow: loading ? 'none' : '0 5px 20px rgba(46,100,23,0.28)',
                    transition: 'all .18s', letterSpacing: '-0.01em',
                  }}
                >
                  {loading ? (
                    <>
                      <svg style={{ animation: 'spin .8s linear infinite', flexShrink: 0 }} width={18} height={18} viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                        <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>Sign In &nbsp;<FiArrowRight size={16} /></>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="f7" style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#E0DAD0' }} />
                <span style={{ fontSize: 12, color: '#C0B8AE', fontWeight: 700, letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#E0DAD0' }} />
              </div>

              {/* Social buttons */}
              <div className="f7" style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'Google',   icon: <FaGoogle size={16} color="#EA4335" />,    onClick: handleGoogleLogin },
                  { label: 'Facebook', icon: <FaFacebookF size={16} color="#1877F2" />, onClick: () => {} },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={btn.onClick}
                    className="social-btn"
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                      padding: '14px 16px', borderRadius: 13, cursor: 'pointer',
                      border: '1.5px solid #E0DAD0', background: '#fff',
                      fontSize: 15, fontWeight: 600, fontFamily: 'inherit', color: '#191B19',
                      transition: 'all .15s',
                    }}
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>

              <p className="f8" style={{ textAlign: 'center', fontSize: 15, color: '#888', margin: 0 }}>
                New to ZOVA?{' '}
                <Link href="/signup" style={{ color: '#2E6417', fontWeight: 700, textDecoration: 'none' }}>
                  Create an account →
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}