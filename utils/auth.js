'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from './supabase/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  // Memoized logout function
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      return { success: true };
    } catch (err) {
      setError(err);
      console.error('Logout error:', err);
      return { success: false, error: err };
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    let subscription;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          console.error('Auth initialization error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const setupAuthListener = () => {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;
          
          console.log('Auth state changed:', event);
          setUser(session?.user ?? null);
          setLoading(false);
          setError(null);
        }
      );
      
      return authSubscription;
    };

    // Initialize auth and set up listener
    initializeAuth();
    subscription = setupAuthListener();

    // Cleanup
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Optional: Add login helper function
  const login = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }, [supabase]);

  // Optional: Add signup helper function
  const signup = useCallback(async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }, [supabase]);

  return { 
    user, 
    loading, 
    error, 
    logout,
    login,
    signup,
    isAuthenticated: !!user 
  };
}