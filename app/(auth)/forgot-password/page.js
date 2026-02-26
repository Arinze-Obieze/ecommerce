'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
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

  return (
    <div className="login-page h-screen w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/bg_big.jpeg')`,
          }}
        />
        <div className="absolute inset-0 bg-black/40 transition-colors duration-500" />
      </div>

      <div className="relative z-10 w-full max-w-md p-4 flex flex-col justify-center h-full">
        {/* Main Card */}
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 animate-slideUp w-full max-h-full overflow-y-auto">
          {/* Back to Login */}
          <Link href="/login" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6 text-sm">
            <FiArrowLeft className="mr-2" /> Back to Login
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fadeIn drop-shadow-lg">
              Forgot Password
            </h1>
            <p className="text-white/80 animate-fadeIn animation-delay-200 text-sm sm:text-base">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/50 p-3 sm:p-4 text-white text-sm text-center animate-shake">
                <FiX className="inline mr-2" />
                {error}
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-400/50 p-3 sm:p-4 text-white text-sm text-center animate-fadeIn">
                <FiCheck className="inline mr-2 text-xl" />
                <span className="block mt-1 font-medium">Reset link sent!</span>
                <span className="text-xs text-green-100 opacity-90 mt-1 block">
                    Please check your email. Link expires soon.
                </span>
              </div>
            )}

            {/* Email Field */}
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="w-5 h-5 text-white/60" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl 
                    focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 
                    transition-all duration-300 text-white placeholder-white/50 hover:bg-white/25"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="relative w-full py-3.5 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 
                text-base sm:text-lg overflow-hidden group mt-4 sm:mt-8"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending link...
                  </>
                ) : (
                  success ? 'Link Sent' : 'Send Reset Link'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
