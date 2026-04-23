'use client';

import { useAuth } from '@/utils/auth/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if not loading, no user, and not already redirecting
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      // Store the current path to redirect back after login
      const redirectPath = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectPath}`);
    }
  }, [user, loading, router, pathname, isRedirecting]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Authentication Error</div>
          <p className="text-gray-600">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If no user and not loading (redirect should happen)
  if (!user) {
    return null;
  }

  return children;
}