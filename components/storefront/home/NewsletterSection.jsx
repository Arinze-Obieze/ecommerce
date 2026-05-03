"use client";
import React, { useState } from 'react';
import { FiMail, FiArrowRight, FiX, FiGift, FiChevronLeft, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '@/contexts/toast/ToastContext';

// Brand tokens — sourced from app/globals.css


const NewsletterSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('');
  const [btnHov, setBtnHov] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      success("You're subscribed! Check your inbox.");
      setEmail('');
    }, 1500);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Collapsed Tab ── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 px-2 py-4 rounded-l-xl shadow-xl transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-1/2"
          style={{ backgroundColor: 'var(--zova-primary-action)', color: '#FFFFFF' }}
        >
          <FiGift className="w-4 h-4" />
          <span
            className="text-[11px] font-black tracking-[0.2em] uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            VERIFIED
          </span>
          <FiChevronLeft className="w-4 h-4 opacity-60" />
        </button>
      )}

      {/* ── Sidebar Panel ── */}
      <div
        className="fixed top-1/2 left-1/2 z-50 w-[380px] max-w-[94vw] rounded-2xl overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          boxShadow: '0 25px 60px rgba(46,100,23,0.16)',
          transform: isOpen
            ? 'translate(-50%, -50%)'
            : 'translate(-50%, -50%) scale(0.95)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          border: `1px solid ${'var(--zova-border)'}`,
        }}
      >

        {/* ── Header ── */}
        <div
          className="relative px-7 pt-6 pb-6"
          style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${'var(--zova-border)'}` }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ backgroundColor: 'var(--zova-linen)', color: '#666' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-linen)')}
          >
            <FiX className="w-3.5 h-3.5" />
          </button>

          {/* Badge */}
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border mb-4"
            style={{
              backgroundColor: 'var(--zova-green-soft)',
              borderColor: '#B8D4A0',
              color: 'var(--zova-primary-action)',
            }}
          >
            <FiShield className="w-3 h-3" style={{ color: 'var(--zova-primary-action)' }} />
            ZOVA VERIFIED
          </span>

          {/* Headline — "Only verified" highlighted in Gold */}
          <h2
            className="text-[26px] font-black leading-[1.15] mb-2"
            style={{ color: 'var(--zova-ink)', letterSpacing: '-0.025em' }}
          >
            No hype.{' '}
            <span
              className="px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--zova-accent-emphasis)', color: '#FFFFFF' }}
            >
              Only verified
            </span>
            {' '}clothing.
          </h2>

          <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--zova-text-body)' }}>
            <FiCheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--zova-primary-action)' }} />
            Join 10,000+ shoppers who trust ZOVA
          </p>

          {/* ZOVA Acronym strip */}
          <div
            className="grid grid-cols-4 gap-2 mt-5 p-3 rounded-xl"
            style={{ background: 'var(--zova-linen)', border: `1px solid ${'var(--zova-border)'}` }}
          >
            {[
              { letter: 'Z', word: 'Zero'         },
              { letter: 'O', word: 'Overpromises'  },
              { letter: 'V', word: 'Verified'      },
              { letter: 'A', word: 'Apparel'       },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-base font-black"
                  style={{ color: i === 2 ? 'var(--zova-accent-emphasis)' : 'var(--zova-ink)' }}
                >
                  {item.letter}
                </div>
                <div className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: 'var(--zova-text-muted)' }}>
                  {item.word}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-7 py-6" style={{ backgroundColor: '#FFFFFF' }}>

          {/* Trust perks */}
          <div className="space-y-2.5 mb-6">
            {[
              { text: 'Every seller is vetted & verified',  highlight: 'verified'    },
              { text: 'Real reviews from real buyers',       highlight: 'Real'        },
              { text: 'Authenticity guaranteed',             highlight: 'guaranteed'  },
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{ backgroundColor: `${'var(--zova-primary-action)'}18`, color: 'var(--zova-primary-action)' }}
                >
                  ✓
                </span>
                <span className="text-sm" style={{ color: 'var(--zova-ink)' }}>
                  {perk.text.split(perk.highlight).map((part, index, arr) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < arr.length - 1 && (
                        <span className="font-bold" style={{ color: 'var(--zova-primary-action)' }}>
                          {perk.highlight}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            ))}
          </div>

          {/* Form or Success */}
          {status === 'success' ? (
            <div
              className="rounded-xl p-5 text-center border"
              style={{ backgroundColor: 'var(--zova-green-soft)', borderColor: '#B8D4A0' }}
            >
              <div
                className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--zova-primary-action)' }}
              >
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--zova-primary-action)' }}>
                You're verified! ✅
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--zova-text-muted)' }}>
                Check your inbox — your 10% off code is waiting.
              </p>
              <p className="text-[10px] mt-2 italic" style={{ color: 'var(--zova-text-muted)' }}>
                No spam, only verified deals.
              </p>
              <button
                type="button"
                onClick={() => setStatus('')}
                className="mt-3 text-xs underline"
                style={{ color: 'var(--zova-primary-action)' }}
              >
                Use another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4" style={{ color: 'var(--zova-text-muted)' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-3 py-3.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--zova-border)',
                    color: 'var(--zova-ink)',
                    '--tw-ring-color': 'var(--zova-primary-action)',
                  }}
                  required
                />
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <FiShield className="w-3 h-3" style={{ color: 'var(--zova-text-muted)' }} />
                <span className="text-[10px]" style={{ color: 'var(--zova-text-muted)' }}>
                  Your email is protected — never shared
                </span>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                style={{
                  backgroundColor: btnHov ? 'var(--zova-primary-action-hover)' : 'var(--zova-primary-action)',
                  color: '#FFFFFF',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={() => setBtnHov(true)}
                onMouseLeave={() => setBtnHov(false)}
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>Get Verified & Save 10% <FiArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          <p className="mt-4 text-[10px] text-center" style={{ color: 'var(--zova-text-muted)' }}>
            By subscribing you agree to our Terms & Privacy Policy.
            No overpromises — just verified apparel.
          </p>
        </div>
      </div>
    </>
  );
};

export default NewsletterSidebar;