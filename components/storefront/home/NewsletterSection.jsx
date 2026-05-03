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
    <section className="w-full bg-(--zova-onyx) text-(--zova-linen) py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-(--zova-onyx) bg-(--zova-gold) rounded-sm mb-6">
              <FiShield className="w-3.5 h-3.5" />
              ZOVA VIP Access
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
              Get Verified. <br className="hidden sm:block" />
              <span className="text-(--zova-gold)">Save 10% Instantly.</span>
            </h2>
            
            <p className="text-lg text-(--zova-linen)/80 mb-8 max-w-xl">
              Join 10,000+ fashion-forward shoppers who trust ZOVA. No hype, no overpromises — just verified apparel and early access to drops.
            </p>

            <div className="space-y-3">
              {[
                { text: 'Every seller is vetted & verified',  highlight: 'verified'    },
                { text: 'Real reviews from real buyers',       highlight: 'Real'        },
                { text: 'Authenticity guaranteed',             highlight: 'guaranteed'  },
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-3">
                  <FiCheckCircle className="w-5 h-5 text-(--zova-gold) shrink-0" />
                  <span className="text-sm font-medium">
                    {perk.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              {status === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-(--zova-gold) flex items-center justify-center">
                    <FiCheckCircle className="w-7 h-7 text-(--zova-onyx)" />
                  </div>
                  <p className="text-xl font-bold text-white mb-2">
                    You're verified!
                  </p>
                  <p className="text-sm text-(--zova-linen)/80 mb-6">
                    Check your inbox — your 10% off code and VIP access are ready.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('')}
                    className="text-sm font-bold text-(--zova-gold) hover:underline"
                  >
                    Use another email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-2">Claim Your Welcome Offer</h3>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-white/40" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-(--zova-gold) focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-(--zova-gold) text-(--zova-onyx) hover:bg-(--zova-gold)/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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

                  <p className="text-xs text-center text-(--zova-linen)/60 pt-2">
                    By subscribing, you agree to our Terms & Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}