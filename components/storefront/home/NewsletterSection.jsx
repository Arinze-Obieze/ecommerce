'use client';

import React, { useState } from 'react';
import { FiMail, FiArrowRight, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useToast } from '@/contexts/toast/ToastContext';

export default function NewsletterSection() {
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
    <section className="w-full bg-(--zova-green-soft) text-(--zova-ink) py-8 md:py-10 border-y" style={{ borderColor: '#B8D4A0' }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-black mb-1 tracking-tight">
              Get Verified. <span className="text-(--zova-primary-action)">Save 10% Instantly.</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--zova-text-body)' }}>
              Join 10,000+ fashion-forward shoppers who trust ZOVA. No hype, just verified apparel.
            </p>
          </div>

          <div className="w-full max-w-md shrink-0">
            {status === 'success' ? (
              <div className="flex items-center gap-3 w-full bg-white px-4 py-3 rounded-[4px] border border-(--zova-success)">
                <FiCheckCircle className="w-5 h-5 text-(--zova-success)" />
                <span className="text-sm font-bold text-(--zova-success) flex-1">
                  You're verified! Check your inbox.
                </span>
                <button
                  type="button"
                  onClick={() => setStatus('')}
                  className="text-xs font-bold underline"
                >
                  Reset
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4" style={{ color: 'var(--zova-text-muted)' }} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-[4px] text-sm bg-white border border-(--zova-border) focus:outline-none focus:ring-2 focus:ring-(--zova-primary-action) focus:border-transparent transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="shrink-0 px-5 py-2.5 rounded-[4px] text-sm font-bold flex items-center justify-center gap-2 bg-(--zova-primary-action) transition-colors hover:bg-(--zova-primary-action-hover) disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ color: '#ffffff' }}
                >
                  {status === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify <FiArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}