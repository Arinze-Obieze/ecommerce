'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import AuthFooter from '@/components/AuthFooter';

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
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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

      setSuccess(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setState('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat bg-[url('/bg.jpeg')] md:bg-[url('/bg_big.jpeg')]"
    >
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10 w-full max-w-2xl mx-auto">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ShopHub</h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">Create your account</p>
        </div>

        {/* Form Container */}
        <div className="w-full p-6 md:p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm text-center">{error}</div>}
            {success && <div className="rounded-md bg-green-50 p-3 text-green-700 text-sm text-center">Account created! Redirecting to login...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="border-r border-gray-300 pr-2 mr-2 text-gray-500 font-medium flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                  </span>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="border-r border-gray-300 pr-2 mr-2 text-gray-500 font-medium flex items-center gap-1">
                    <FiMail className="w-4 h-4" />
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="border-r border-gray-300 pr-2 mr-2 text-gray-500 font-medium flex items-center gap-1">
                     <FiPhone className="w-4 h-4" />
                  </span>
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* State */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="border-r border-gray-300 pr-2 mr-2 text-gray-500 font-medium flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                  </span>
                </div>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <FiLock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800 placeholder-gray-400"
                  required
                />
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <FiLock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2E5C45] hover:bg-[#254a38] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-6"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account? <Link href="/login" className="text-green-700 font-bold hover:underline">Sign In</Link>
          </div>
        </div>

        {/* Footer Section */}
        <AuthFooter />
      </main>
    </div>
  );
}
