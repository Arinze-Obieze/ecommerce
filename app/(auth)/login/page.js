'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

// Brand tokens — sourced from app/globals.css CSS custom properties
const T = {
  green:       'var(--zova-primary-action)',
  greenDark:   'var(--zova-primary-action-hover)',
  greenDeep:   'var(--zova-primary-action-hover)',
  greenTint:   'var(--zova-green-soft)',
  greenBorder: '#B8D4A0',
  gold:        'var(--zova-accent-emphasis)',
  goldDark:    'var(--zova-warning)',
  charcoal:    'var(--zova-ink)',
  softGray:    'var(--zova-surface-alt)',
  pageBg:      'var(--zova-linen)',
  border:      'var(--zova-border)',
  medGray:     'var(--zova-text-body)',
  mutedText:   'var(--zova-text-muted)',
  white:       '#FFFFFF',
  red:         'var(--zova-error)',
  redLight:    '#FEF2F2',
};

// ─── SLIDES ───────────────────────────────────────────────────
const SLIDES = [
  {
    url:     'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1200&fit=crop&auto=format',
    caption: 'Discover Your\nStyle Today.',
    sub:     "Shop 2M+ looks from Nigeria's top sellers",
  },
  {
    url:     'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&h=1200&fit=crop&auto=format',
    caption: 'Fashion That\nFeels Like You.',
    sub:     'Curated pieces, delivered fast',
  },
  {
    url:     'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&h=1200&fit=crop&auto=format',
    caption: "Nigeria's Biggest\nMarketplace.",
    sub:     '50,000+ sellers. Every style. One place.',
  },
  {
    url:     'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1200&fit=crop&auto=format',
    caption: 'New Arrivals\nEvery Hour.',
    sub:     "Be first to wear tomorrow's trends",
  },
];

const FLOATERS = [
  { src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop', size: 68, top: '7%',  right: '-22px', rot: 6  },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=90&fit=crop',  size: 62, top: '32%', right: '-18px', rot: -5 },
  { src: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=120&h=120&fit=crop', size: 58, top: '58%', right: '-20px', rot: 4  },
  { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop', size: 64, top: '78%', right: '-16px', rot: -6 },
];

// ─── PASSWORD REQUIREMENT ROW ─────────────────────────────────
function ReqRow({ met, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        background: met ? T.green : T.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, transform 0.2s',
        transform: met ? 'scale(1.1)' : 'scale(1)',
      }}>
        {met && <FiCheck size={9} color="#fff" strokeWidth={3.5} />}
      </div>
      <span style={{ fontSize: 12, color: met ? T.greenDark : T.mutedText, fontWeight: met ? 600 : 400, transition: 'color 0.2s' }}>
        {label}
      </span>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [rememberMe, setRememberMe]       = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [passFocused, setPassFocused]     = useState(false);
  const [emailFocused, setEmailFocused]   = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [slide, setSlide]                 = useState(0);
  const [emailHov, setEmailHov]           = useState(false);
  const [passHov, setPassHov]             = useState(false);
  const [submitHov, setSubmitHov]         = useState(false);
  const [googleHov, setGoogleHov]         = useState(false);
  const [fbHov, setFbHov]                 = useState(false);
  const [remHov, setRemHov]               = useState(false);
  const [logoError, setLogoError]         = useState(false);

  const reqs = {
    minLength:  password.length >= 8,
    hasUpper:   /[A-Z]/.test(password),
    hasLower:   /[a-z]/.test(password),
    hasNumber:  /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const passStrength = Object.values(reqs).filter(Boolean).length;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide(s => (s + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) { setError(signInErr.message); setLoading(false); return; }
      const redirectRes  = await fetch('/api/auth/post-login-target', { cache: 'no-store' });
      const redirectJson = await redirectRes.json().catch(() => ({}));
      const target       = typeof redirectJson?.target === 'string' ? redirectJson.target : '/';
      setSuccess(true);
      setTimeout(() => router.push(target), 1800);
    } catch { setError('An unexpected error occurred'); setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } });
      if (error) throw error;
    } catch (err) { setError(err.message); setLoading(false); }
  };

  // strength: 0 gray | 1 red | 2 orange | 3 gold | 4 forest | 5 deep forest
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Perfect'][passStrength];
  const strengthColor = ['#E8E4DC', T.red, '#F97316', T.gold, T.green, T.greenDark][passStrength];

  const inputStyle = (focused, hovered, hasError) => ({
    width: '100%',
    padding: '13px 14px 13px 46px',
    borderRadius: 12,
    border: `1.5px solid ${hasError ? T.red : focused ? T.green : hovered ? T.greenBorder : T.border}`,
    background: hasError ? T.redLight : focused ? T.white : T.pageBg,
    fontSize: 14,
    color: T.charcoal,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.18s, background 0.18s, box-shadow 0.18s',
    boxShadow: focused ? `0 0 0 3.5px rgba(46,100,23,0.12)` : 'none',
  });

  return (
    <>
      <style>{`
                * { box-sizing: border-box; }
        .lp-root { font-family: var(--zova-font-sans); }
        
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); }   to { opacity:1; transform:none; } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-10px); }  to { opacity:1; transform:none; } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.82); }        to { opacity:1; transform:scale(1); } }
        @keyframes spin     { to   { transform:rotate(360deg); } }
        @keyframes pulseRing {
          0%   { transform:scale(1);    opacity:0.5; }
          100% { transform:scale(1.65); opacity:0;   }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset:36; }
          to   { stroke-dashoffset:0;  }
        }
        @keyframes slideCaption {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes floatBob {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }

        .fade-up-1 { animation: fadeUp 0.5s ease 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.5s ease 0.12s both; }
        .fade-up-3 { animation: fadeUp 0.5s ease 0.19s both; }
        .fade-up-4 { animation: fadeUp 0.5s ease 0.26s both; }
        .fade-up-5 { animation: fadeUp 0.5s ease 0.33s both; }
        .fade-up-6 { animation: fadeUp 0.5s ease 0.40s both; }
        .fade-up-7 { animation: fadeUp 0.5s ease 0.47s both; }
        .fade-up-8 { animation: fadeUp 0.5s ease 0.54s both; }
      `}</style>

      <div className="lp-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.pageBg }}>

        {/* ── SUCCESS OVERLAY ── */}
        {success && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(245,241,234,0.96)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.25s ease',
          }}>
            <div style={{ textAlign: 'center', animation: 'scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 20px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(46,100,23,0.15)', animation: 'pulseRing 1.1s ease-out infinite' }} />
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg,${T.green},${T.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: `0 12px 40px rgba(46,100,23,0.4)` }}>
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <path d="M9 19L16.5 26.5L29 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 36, strokeDashoffset: 0, animation: 'checkDraw 0.45s ease 0.2s both' }} />
                  </svg>
                </div>
              </div>
              <p className="serif" style={{ fontSize: 32, fontWeight: 700, color: T.charcoal, margin: '0 0 8px', lineHeight: 1.1 }}>You're in!</p>
              <p style={{ fontSize: 14, color: T.mutedText, margin: 0 }}>Taking you to the market…</p>
            </div>
          </div>
        )}

        {/* ══ LEFT — form panel ══ */}
        <div style={{
          flex: '0 0 min(468px, 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 52px', position: 'relative', overflowY: 'auto',
          background: T.white, zIndex: 2,
          boxShadow: '2px 0 32px rgba(46,100,23,0.07)',
        }}>
          {/* Gold top stripe */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, ${T.green}, ${T.gold})` }} />

          <div style={{ maxWidth: 360, width: '100%', margin: '0 auto', padding: '56px 0' }}>

            {/* Brand */}
            <div className="fade-up-1" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
              <div style={{
                width: 100, height: 100, borderRadius: 10,
                background: T.greenTint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px rgba(46,100,23,0.18)`,
                overflow: 'hidden',
              }}>
                {!logoError ? (
                  <Image src="/brand/logo.svg" alt="ZOVA" width={100} height={100} className="object-contain" onError={() => setLogoError(true)} />
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.green, fontFamily: "var(--zova-font-sans)" }}>Z</span>
                )}
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: T.charcoal, letterSpacing: '-0.04em', fontFamily: "var(--zova-font-sans)" }}>ZOVA</span>
            </div>

            {/* Headline */}
            <div className="fade-up-2" style={{ marginBottom: 36 }}>
              <h1 className="serif" style={{ fontSize: 40, fontWeight: 700, color: T.charcoal, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Welcome back.
              </h1>
              <p style={{ fontSize: 14.5, color: T.mutedText, margin: 0, fontWeight: 400 }}>
                Sign in to your ZOVA account to continue
              </p>
            </div>

            <form onSubmit={handleLogin}>

              {/* Error banner */}
              {error && (
                <div style={{ padding: '11px 16px', borderRadius: 11, background: T.redLight, border: `1px solid #FECACA`, fontSize: 13, color: T.red, fontWeight: 500, marginBottom: 18, animation: 'fadeDown 0.25s ease' }}>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="fade-up-3" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <FiMail size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: emailFocused ? T.green : T.mutedText, transition: 'color 0.2s', pointerEvents: 'none' }} />
                  <input
                    type="email" value={email} required autoComplete="email"
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onMouseEnter={() => setEmailHov(true)}
                    onMouseLeave={() => setEmailHov(false)}
                    placeholder="you@example.com"
                    style={inputStyle(emailFocused, emailHov, !!error)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="fade-up-4" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Password
                  </label>
                  <Link href="/forgot-password" style={{ fontSize: 12.5, color: T.green, fontWeight: 600, textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <FiLock size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: passFocused ? T.green : T.mutedText, transition: 'color 0.2s', pointerEvents: 'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'} value={password} required
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setTimeout(() => setPassFocused(false), 180)}
                    onMouseEnter={() => setPassHov(true)}
                    onMouseLeave={() => setPassHov(false)}
                    placeholder="Enter your password"
                    style={{ ...inputStyle(passFocused, passHov, !!error), paddingRight: 46 }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.mutedText, padding: 2, display: 'flex', alignItems: 'center' }}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 99,
                          background: i <= passStrength ? strengthColor : T.border,
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    {strengthLabel && (
                      <p style={{ fontSize: 11, color: strengthColor, fontWeight: 700, margin: 0, transition: 'color 0.3s' }}>
                        {strengthLabel} password
                      </p>
                    )}
                  </div>
                )}

                {/* Requirements */}
                {passFocused && password.length > 0 && (
                  <div style={{
                    marginTop: 10, padding: '12px 14px', borderRadius: 12,
                    background: T.greenTint, border: `1px solid ${T.greenBorder}`,
                    display: 'flex', flexDirection: 'column', gap: 7,
                    animation: 'fadeDown 0.2s ease',
                  }}>
                    <ReqRow met={reqs.minLength}  label="At least 8 characters" />
                    <ReqRow met={reqs.hasUpper}   label="One uppercase letter" />
                    <ReqRow met={reqs.hasLower}   label="One lowercase letter" />
                    <ReqRow met={reqs.hasNumber}  label="One number" />
                    <ReqRow met={reqs.hasSpecial} label="One special character (!@#…)" />
                  </div>
                )}
              </div>

              {/* Remember me */}
              <div className="fade-up-5"
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}
                onClick={() => setRememberMe(v => !v)}
                onMouseEnter={() => setRemHov(true)} onMouseLeave={() => setRemHov(false)}
              >
                <div style={{
                  width: 19, height: 19, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${rememberMe ? T.green : T.border}`,
                  background: rememberMe ? T.green : remHov ? T.softGray : T.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {rememberMe && <FiCheck size={11} color="#fff" strokeWidth={3.5} />}
                </div>
                <span style={{ fontSize: 13.5, color: T.medGray, userSelect: 'none', fontWeight: 400 }}>
                  Keep me signed in
                </span>
              </div>

              {/* Submit */}
              <div className="fade-up-6">
                <button type="submit" disabled={loading}
                  onMouseEnter={() => setSubmitHov(true)} onMouseLeave={() => setSubmitHov(false)}
                  style={{
                    width: '100%', padding: '14px', border: 'none', borderRadius: 13,
                    fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: loading ? T.border : submitHov ? T.greenDark : T.green,
                    color: loading ? T.mutedText : T.white,
                    boxShadow: !loading && submitHov ? `0 10px 30px rgba(46,100,23,0.35)` : !loading ? `0 5px 18px rgba(46,100,23,0.22)` : 'none',
                    transform: !loading && submitHov ? 'translateY(-1px)' : 'none',
                    transition: 'all 0.18s',
                    letterSpacing: '-0.01em',
                  }}>
                  {loading
                    ? <><svg style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} width={17} height={17} viewBox="0 0 17 17" fill="none">
                        <circle cx="8.5" cy="8.5" r="6" stroke="rgba(0,0,0,0.12)" strokeWidth="2.5" />
                        <path d="M8.5 2.5a6 6 0 016 6" stroke={T.medGray} strokeWidth="2.5" strokeLinecap="round" />
                      </svg>Signing in…</>
                    : <>Sign In &nbsp;<FiArrowRight size={15} /></>
                  }
                </button>
              </div>

              {/* Divider */}
              <div className="fade-up-7" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 11, color: '#CCC', fontWeight: 700, letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>

              {/* Social buttons */}
              <div className="fade-up-8" style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
                {[
                  { label: 'Google',   icon: <FaGoogle size={14} color="#EA4335" />,  onClick: handleGoogleLogin, hov: googleHov, setHov: setGoogleHov },
                  { label: 'Facebook', icon: <FaFacebookF size={14} color="#1877F2" />, onClick: () => {},         hov: fbHov,     setHov: setFbHov     },
                ].map(btn => (
                  <button key={btn.label} type="button" onClick={btn.onClick}
                    onMouseEnter={() => btn.setHov(true)} onMouseLeave={() => btn.setHov(false)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 16px', borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${T.border}`,
                      background: btn.hov ? T.softGray : T.white,
                      fontSize: 13.5, fontWeight: 600, color: T.charcoal,
                      transition: 'all 0.15s',
                      boxShadow: btn.hov ? '0 3px 10px rgba(46,100,23,0.08)' : 'none',
                      transform: btn.hov ? 'translateY(-1px)' : 'none',
                    }}>
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>

              {/* Sign up link */}
              <p style={{ textAlign: 'center', fontSize: 13.5, color: T.mutedText, margin: 0 }}>
                New to ZOVA?{' '}
                <Link href="/signup" style={{ color: T.green, fontWeight: 700, textDecoration: 'none' }}>
                  Create an account →
                </Link>
              </p>

            </form>
          </div>
        </div>

        {/* ══ RIGHT — fashion panel ══ */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
          {/* Slides */}
          {SLIDES.map((s, i) => (
            <img key={i} src={s.url} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === slide ? 1 : 0,
              transform: i === slide ? 'scale(1.03)' : 'scale(1)',
              transition: 'opacity 0.9s ease, transform 6s ease',
            }} />
          ))}

          {/* Gradient overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.12) 60%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />

          {/* Floating product thumbnails */}
          {mounted && FLOATERS.map((f, i) => (
            <div key={i} style={{
              position: 'absolute', right: 0, top: f.top, zIndex: 4,
              width: f.size, height: f.size, borderRadius: 12,
              overflow: 'hidden', border: '3px solid rgba(255,255,255,0.85)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
              transform: `translateX(30%) rotate(${f.rot}deg)`,
              animation: `floatBob ${3.8 + i * 0.6}s ease-in-out ${i * 0.5}s infinite`,
            }}>
              <img src={f.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ))}

          {/* Caption */}
          <div style={{ position: 'absolute', bottom: 48, left: 44, right: 44, zIndex: 5 }}>
            <div key={slide} style={{ animation: 'slideCaption 0.6s ease both' }}>
              <h2 className="serif" style={{
                fontSize: 44, fontWeight: 700, color: '#fff', margin: '0 0 10px',
                lineHeight: 1.12, letterSpacing: '-0.02em',
                textShadow: '0 2px 24px rgba(0,0,0,0.35)',
                whiteSpace: 'pre-line',
              }}>
                {SLIDES[slide].caption}
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', margin: '0 0 24px', fontWeight: 400 }}>
                {SLIDES[slide].sub}
              </p>
            </div>

            {/* Trust pills — gold dots */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {['50K+ Sellers', '2M+ Products', 'Fast Delivery', 'Buyer Protection'].map(tag => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold, boxShadow: `0 0 6px ${T.gold}` }} />
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{tag}</span>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', gap: 7, marginTop: 28 }}>
              {SLIDES.map((_, i) => (
                <div key={i} onClick={() => setSlide(i)} style={{
                  height: 3, borderRadius: 99, cursor: 'pointer',
                  width: i === slide ? 28 : 7,
                  background: i === slide ? T.gold : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.4s',
                }} />
              ))}
            </div>
          </div>

          {/* ZOVA brand — top right */}
          <div style={{ position: 'absolute', top: 32, right: 36, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden',
            }}>
              {!logoError ? (
                <Image src="/brand/logo.svg" alt="ZOVA" width={50} height={50} className="object-contain" onError={() => setLogoError(true)} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Z</span>
              )}
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.03em' }}>ZOVA</span>
          </div>
        </div>

      </div>
    </>
  );
}
