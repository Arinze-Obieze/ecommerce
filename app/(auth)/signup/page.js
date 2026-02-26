'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password requirements validation
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });

  useEffect(() => {
    setIsPageLoading(false);
  }, []);

  useEffect(() => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      passwordsMatch: password && confirmPassword && password === confirmPassword,
    });
  }, [password, confirmPassword]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, state, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      setSignupSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="login-page h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
        <div className="w-full max-w-2xl p-4 sm:p-8 space-y-6 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page h-screen w-full relative overflow-hidden flex items-center justify-center">
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

      <div className="relative z-10 w-full max-w-2xl p-4 overflow-hidden h-full flex flex-col justify-center">
        {/* Success Animation Overlay */}
        {signupSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 shadow-2xl animate-scaleIn">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-checkmark">
                <FiCheck className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-800">Account Created!</h3>
              <p className="text-gray-600 text-center mt-2">Redirecting to login...</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl p-4 sm:p-8 border border-white/20 animate-slideUp w-full max-h-[96vh] sm:max-h-full overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 animate-fadeIn drop-shadow-lg">
              Create Account
            </h1>
            <p className="text-white/80 animate-fadeIn animation-delay-200 text-sm sm:text-base">
              Join ShopHub today
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/50 p-3 text-white text-xs sm:text-sm text-center animate-shake">
                <FiX className="inline mr-2" />
                {error}
              </div>
            )}

            {/* Two Column Layout for Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Full Name */}
              <div className="relative group">
                <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2 text-left">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl 
                      focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 
                      transition-all duration-300 text-white placeholder-white/50 hover:bg-white/25"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative group">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2 text-left">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl 
                      focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 
                      transition-all duration-300 text-white placeholder-white/50 hover:bg-white/25"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="relative group">
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2 text-left">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl 
                      focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 
                      transition-all duration-300 text-white placeholder-white/50 hover:bg-white/25"
                  />
                </div>
              </div>

              {/* State */}
              <div className="relative group">
                <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2 text-left">
                  State
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  </div>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="California"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl 
                      focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 
                      transition-all duration-300 text-white placeholder-white/50 hover:bg-white/25"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative group">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2 text-left">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiLock className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setTimeout(() => setPasswordFocused(false), 200)}
                    placeholder="Enter your password"
                    className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl 
                      focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 
                      transition-all duration-300 text-white placeholder-white/50 hover:bg-white/25"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-1 transition-colors duration-300"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>

                {/* Password Requirements Popover */}
                {passwordFocused && password && (
                  <div className="absolute z-20 mt-1 sm:mt-2 w-full p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 animate-slideDown max-h-[150px] overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3">Password Requirements:</p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {[
                        { key: 'minLength', label: 'At least 8 characters' },
                        { key: 'hasUpperCase', label: 'One uppercase letter' },
                        { key: 'hasLowerCase', label: 'One lowercase letter' },
                        { key: 'hasNumber', label: 'One number' },
                        { key: 'hasSpecialChar', label: 'One special character' },
                      ].map((req) => (
                        <div key={req.key} className="flex items-center gap-2 text-[10px] sm:text-xs">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                            passwordRequirements[req.key] ? 'bg-green-500 scale-100' : 'bg-gray-300 scale-90'
                          }`}>
                            {passwordRequirements[req.key] && (
                              <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className={`transition-colors duration-300 ${
                            passwordRequirements[req.key] ? 'text-green-600 font-medium' : 'text-gray-500'
                          }`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2 text-left">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiLock className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                      passwordRequirements.passwordsMatch && confirmPassword ? 'text-green-400' : 'text-white/60'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white/20 backdrop-blur-sm border-2 rounded-xl 
                      focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 
                      transition-all duration-300 text-white placeholder-white/50 hover:bg-white/25
                      ${passwordRequirements.passwordsMatch && confirmPassword ? 'border-green-400/50' : 'border-white/30'}`}
                    required
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                      {passwordRequirements.passwordsMatch ? (
                        <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                      ) : (
                        <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 
                text-base sm:text-lg overflow-hidden group mt-4 sm:mt-6"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-transparent text-white/70 font-medium">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handleGoogleSignup}
                type="button"
                className="flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm
                  border-2 border-white/30 rounded-xl text-white font-medium text-sm sm:text-base
                  hover:bg-white/30 hover:border-white/50 transition-all duration-300 
                  hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaGoogle className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 bg-[#3b5998] hover:bg-[#2d4373] 
                  text-white rounded-xl font-medium text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg 
                  transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaFacebookF className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Facebook</span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
              <span className="text-white/70">Already have an account? </span>
              <Link
                href="/login"
                className="text-white font-bold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      {/* Required CSS to hide scrollbar but allow scrolling on small devices if necessary */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}} />
    </div>
  );
}
