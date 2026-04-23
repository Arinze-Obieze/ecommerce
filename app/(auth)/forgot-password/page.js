'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiCheck, FiMail } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

const T = {
  green: '#2E6417',
  greenDark: '#245213',
  greenDeep: '#191B19',
  greenTint: '#EDF5E6',
  greenBorder: '#B8D4A0',
  charcoal: '#111111',
  softGray: '#F5F5F5',
  pageBg: '#F9FAFB',
  border: '#E8E8E8',
  medGray: '#666666',
  mutedText: '#999999',
  white: '#FFFFFF',
  red: '#E53935',
  redLight: '#FEF2F2',
};

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1200&fit=crop&auto=format',
    caption: 'Reset Fast.\nGet Back To Shopping.',
    sub: 'We will send a secure recovery link to your inbox in a moment.',
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&auto=format',
    caption: 'Your Account,\nProtected.',
    sub: 'Quick password recovery with the same polished experience as the rest of your account flow.',
  },
];

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailHovered, setEmailHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((current) => (current + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
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
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 14px 13px 46px',
    borderRadius: 12,
    border: `1.5px solid ${error ? T.red : emailFocused ? T.green : emailHovered ? T.greenBorder : T.border}`,
    background: error ? T.redLight : emailFocused ? T.white : T.softGray,
    fontSize: 14,
    fontFamily: 'inherit',
    color: T.charcoal,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.18s, background 0.18s, box-shadow 0.18s',
    boxShadow: emailFocused ? '0 0 0 3.5px rgba(46,100,23,0.13)' : 'none',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }
        .fp-root { font-family: 'Outfit', sans-serif; }
        .serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 36; }
          to { stroke-dashoffset: 0; }
        }

        .fu-1 { animation: fadeUp 0.48s ease 0.04s both; }
        .fu-2 { animation: fadeUp 0.48s ease 0.10s both; }
        .fu-3 { animation: fadeUp 0.48s ease 0.16s both; }
        .fu-4 { animation: fadeUp 0.48s ease 0.22s both; }
        .fu-5 { animation: fadeUp 0.48s ease 0.28s both; }
        .fu-6 { animation: fadeUp 0.48s ease 0.34s both; }
      `}</style>

      <div className="fp-root" style={{ display: 'flex', minHeight: '100vh', background: T.pageBg }}>
        {success && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div style={{ textAlign: 'center', animation: 'scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 20px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(46,100,23,0.18)', animation: 'pulseRing 1.1s ease-out infinite' }} />
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 12px 40px rgba(46,100,23,0.4)' }}>
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <path
                      d="M9 19L16.5 26.5L29 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ strokeDasharray: 36, strokeDashoffset: 0, animation: 'checkDraw 0.45s ease 0.2s both' }}
                    />
                  </svg>
                </div>
              </div>
              <p className="serif" style={{ fontSize: 32, fontWeight: 700, color: T.charcoal, margin: '0 0 8px', lineHeight: 1.1 }}>
                Check your inbox
              </p>
              <p style={{ fontSize: 14, color: T.mutedText, margin: 0 }}>
                We sent a secure reset link to {email}.
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            flex: '0 0 min(468px, 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 52px',
            background: T.white,
            minHeight: '100vh',
          }}
          className="max-md:flex-[1_1_100%] max-md:px-6 max-md:py-10"
        >
          <div style={{ width: '100%', maxWidth: 364, margin: '0 auto' }}>
            <div className="fu-1" style={{ marginBottom: 34 }}>
              <Link
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
              >
                {!logoError ? (
                  <Image
                    src="/brand/logo.png"
                    alt="Zova"
                    width={118}
                    height={34}
                    priority
                    style={{ width: '118px', height: 'auto' }}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="serif" style={{ fontSize: 28, fontWeight: 700, color: T.charcoal }}>Zova</span>
                )}
              </Link>
            </div>

            <div className="fu-2" style={{ marginBottom: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 100,
                  background: T.greenTint,
                  border: `1px solid ${T.greenBorder}`,
                  color: T.greenDeep,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Account recovery
              </span>
            </div>

            <div className="fu-3" style={{ marginBottom: 30 }}>
              <h1 className="serif" style={{ fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.04em', color: T.charcoal, margin: '0 0 12px' }}>
                Forgot your password?
              </h1>
              <p style={{ margin: 0, color: T.medGray, fontSize: 14, lineHeight: 1.7 }}>
                Enter the email tied to your account and we will send you a reset link so you can get back in quickly.
              </p>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error ? (
                <div
                  className="fu-4"
                  style={{
                    borderRadius: 14,
                    background: T.redLight,
                    border: `1px solid rgba(229,57,53,0.18)`,
                    padding: '12px 14px',
                    color: T.red,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div className="fu-4" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label htmlFor="email" style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                    <FiMail size={18} color={error ? T.red : emailFocused ? T.green : '#999'} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onMouseEnter={() => setEmailHovered(true)}
                    onMouseLeave={() => setEmailHovered(false)}
                    placeholder="you@example.com"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="fu-5"
                onMouseEnter={() => setSubmitHovered(true)}
                onMouseLeave={() => setSubmitHovered(false)}
                style={{
                  marginTop: 6,
                  border: 'none',
                  borderRadius: 12,
                  background: loading || success ? '#b7c7c0' : submitHovered ? T.greenDark : T.green,
                  color: T.white,
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '14px 18px',
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
                  boxShadow: loading || success ? 'none' : '0 10px 24px rgba(46,100,23,0.22)',
                  transform: loading || success ? 'none' : submitHovered ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                {loading ? 'Sending reset link...' : success ? 'Link sent' : 'Send Reset Link'}
              </button>
            </form>

            <div className="fu-6" style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  color: T.charcoal,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <FiArrowLeft size={15} />
                Back to login
              </Link>
              <p style={{ margin: 0, color: T.mutedText, fontSize: 12, lineHeight: 1.7 }}>
                Remembered your password? You can return to sign in right away.
              </p>
            </div>
          </div>
        </div>

        <div
          className="max-md:hidden"
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            overflow: 'hidden',
            background: '#DDEBE4',
          }}
        >
          {SLIDES.map((item, index) => (
            <div
              key={item.url}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: slide === index ? 1 : 0,
                transition: 'opacity 0.8s ease',
                backgroundImage: `linear-gradient(180deg, rgba(10,61,46,0.10) 0%, rgba(10,61,46,0.58) 100%), url('${item.url}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}

          <div style={{ position: 'absolute', inset: 0, padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {SLIDES.map((item, index) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => setSlide(index)}
                    style={{
                      width: slide === index ? 30 : 8,
                      height: 8,
                      borderRadius: 999,
                      border: 'none',
                      background: slide === index ? T.white : 'rgba(255,255,255,0.42)',
                      cursor: 'pointer',
                      transition: 'all 0.28s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ maxWidth: 520, color: T.white }}>
              <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.88 }}>
                Account recovery
              </p>
              <h2 className="serif" style={{ margin: 0, fontSize: 76, lineHeight: 0.9, letterSpacing: '-0.05em', whiteSpace: 'pre-line' }}>
                {mounted ? SLIDES[slide].caption : SLIDES[0].caption}
              </h2>
              <p style={{ margin: '18px 0 0', maxWidth: 420, fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.88)' }}>
                {mounted ? SLIDES[slide].sub : SLIDES[0].sub}
              </p>

              <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {['Secure email reset', 'Fast account access', 'Same clean auth flow'].map((pill) => (
                  <span
                    key={pill}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <FiCheck size={14} />
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
