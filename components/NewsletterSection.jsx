"use client";
import React, { useState } from 'react';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
  const { success } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate API call
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      success("You're subcribed! Check your inbox.");
      setEmail('');
    }, 1500);
  };

  return (
    <section className="bg-[#2E5C45] py-20 relative overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-10 -top-10 w-64 h-64 border-4 border-white rounded-full"></div>
        <div className="absolute right-20 bottom-10 w-48 h-48 border-4 border-white rounded-full"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <span className="inline-block px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
          Stay in the Loop
        </span>
        
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Unlock 10% Off Your First Order
        </h2>
        
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Join our newsletter to get exclusive deals, early access to new collections, and personalized recommendations.
        </p>

        {status === 'success' ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to the family! 🎉</h3>
            <p className="text-white/80">Check your inbox for your 10% off code.</p>
            <button 
              onClick={() => setStatus('')}
              className="mt-4 text-sm text-white underline hover:text-[#fbbf24]"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-11 pr-4 py-4 rounded-xl text-gray-900 border-none focus:ring-2 focus:ring-[#fbbf24] focus:outline-none shadow-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-8 py-4 bg-[#fbbf24] text-[#2E5C45] font-bold rounded-xl hover:bg-[#f59e0b] focus:ring-2 focus:ring-offset-2 focus:ring-[#f59e0b] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              {!status && <FiArrowRight className="w-5 h-5" />}
            </button>
          </form>
        )}
        
        <p className="mt-6 text-xs text-white/50">
          By subscribing, you agree to our Terms & Conditions and Privacy Policy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
