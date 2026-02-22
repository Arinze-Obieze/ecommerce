'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import AuthTemplate from '@/components/AuthTemplate';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const { data: adminMembership, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('id, role, is_active')
        .eq('user_id', signInData?.user?.id || '')
        .eq('is_active', true)
        .maybeSingle();

      if (!adminCheckError && adminMembership) {
        router.push('/admin');
        return;
      }

      // Redirect buyers to home page on successful login
      router.push('/');
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
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

  return (
    <AuthTemplate title="Welcome to ShopHub!">
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="border-r border-gray-300 pr-2 mr-2 text-gray-500 font-medium flex items-center gap-1">
                <FiMail className="w-4 h-4" />
              </span>
            </div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800 placeholder-gray-400"
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="w-4 h-4 text-gray-400" />
            </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#2E5C45] hover:bg-[#254a38] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-gray-600 hover:text-green-700 text-sm font-medium">
            Forgot password?
          </Link>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300/60"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/0 backdrop-blur-md text-gray-500 font-medium bg-[#fcfcfc]">OR</span>
        </div>
      </div>

      {/* Social Logins */}
      <div className="space-y-3">
        <button onClick={handleGoogleLogin} type="button" className="w-full flex items-center justify-center gap-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
          <FaGoogle className="text-red-500 w-5 h-5" />
          Continue with Google
        </button>
        <button className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#3b5998] text-white rounded-lg font-medium hover:bg-[#2d4373] transition-colors shadow-sm">
          <FaFacebookF className="w-5 h-5" />
          Continue with Facebook
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/signup" className="text-green-700 font-bold hover:underline">Sign Up</Link>
      </div>
    </AuthTemplate>
  );
}
