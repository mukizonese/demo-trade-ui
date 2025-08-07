'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authErrorHandler } from '@/lib/auth-error-handler';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  is_active?: boolean;
  provider?: string; // 'email', 'google', etc.
}

interface SimpleAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  accountSuspended: boolean;
  authError: string | null;
  refreshUser: () => void;
  signOut: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// Auth API client for getting current user
const authApiClient = {
  getCurrentUser: async (): Promise<any> => {
    try {
      const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8050';
      const response = await fetch(`${authApiUrl}/api/auth/me`, {
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      // Use error handler instead of returning generic error
      authErrorHandler.handleAuthApiError(error, 'getCurrentUser');
      return {
        success: false,
        error: 'Failed to get user',
      };
    }
  },

  guestLogin: async (): Promise<any> => {
    try {
      const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8050';
      const response = await fetch(`${authApiUrl}/api/auth/guest-login`, {
        method: 'POST',
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      // Use error handler instead of returning generic error
      authErrorHandler.handleAuthApiError(error, 'guestLogin');
      return {
        success: false,
        error: 'Guest login failed',
      };
    }
  },
};

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountSuspended, setAccountSuspended] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [skipGuestLogin, setSkipGuestLogin] = useState(() => {
    // Initialize from localStorage to persist across page reloads
    if (typeof window !== 'undefined') {
      return localStorage.getItem('skipGuestLogin') === 'true';
    }
    return false;
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await authApiClient.getCurrentUser();
      if (response.success && response.user) {
        // Check if user is deactivated
        if (response.user.is_active === false) {
          setAccountSuspended(true);
          setUser(response.user);
          setSkipGuestLogin(false);
          localStorage.removeItem('skipGuestLogin');
        } else {
          setAccountSuspended(false);
          setUser(response.user);
          setSkipGuestLogin(false); // Reset skip flag when user is found
          localStorage.removeItem('skipGuestLogin'); // Clear from localStorage
        }
      } else if (!skipGuestLogin) {
        // Auto guest login if no user found and not skipping
        await autoGuestLogin();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (!skipGuestLogin) {
        await autoGuestLogin();
      }
    } finally {
      setLoading(false);
    }
  }, [skipGuestLogin]);

  const autoGuestLogin = useCallback(async () => {
    try {
      //console.log('🔄 Attempting auto guest login...');
      const result = await authApiClient.guestLogin();
      if (result.success && result.user) {
        console.log('✅ Auto guest login successful:', result.user);
        setUser(result.user);
      } else {
        console.log('❌ Auto guest login failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Auto guest login error:', error);
    }
  }, []);

  const refreshUser = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  const signOut = useCallback(async () => {
    try {
      const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8050';
      const response = await fetch(`${authApiUrl}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Set skip flag to prevent auto guest login
      setSkipGuestLogin(true);
      localStorage.setItem('skipGuestLogin', 'true'); // Persist in localStorage
      
      // Clear user state
      setUser(null);
      
      // Clear any local storage/cookies
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_user');
      
      // Clear auth cookies more aggressively for OAuth users
      const cookieDomain = process.env.NODE_ENV === 'production' ? '.mukizone.com' : '';
      const secure = process.env.NODE_ENV === 'production';
      const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
      
      // Clear auth_token cookie
      document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=${sameSite}${secure ? '; Secure' : ''}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;
      
      // Clear any other auth-related cookies
      document.cookie = `sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=${sameSite}${secure ? '; Secure' : ''}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;
      document.cookie = `sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=${sameSite}${secure ? '; Secure' : ''}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear user state even if API call fails
      setUser(null);
      setSkipGuestLogin(true);
      localStorage.setItem('skipGuestLogin', 'true'); // Persist in localStorage
      
      // Also clear cookies in error case
      const cookieDomain = process.env.NODE_ENV === 'production' ? '.mukizone.com' : '';
      const secure = process.env.NODE_ENV === 'production';
      const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
      
      document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=${sameSite}${secure ? '; Secure' : ''}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;
      document.cookie = `sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=${sameSite}${secure ? '; Secure' : ''}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;
      document.cookie = `sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=${sameSite}${secure ? '; Secure' : ''}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;
    }
  }, []);

  const loginAsGuest = useCallback(async () => {
    try {
      //console.log('🔄 Manual guest login...');
      const result = await authApiClient.guestLogin();
      if (result.success && result.user) {
        console.log('✅ Manual guest login successful:', result.user);
        setUser(result.user);
        setSkipGuestLogin(false); // Reset skip flag
        localStorage.removeItem('skipGuestLogin'); // Clear from localStorage
      } else {
        console.log('❌ Manual guest login failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Manual guest login error:', error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <SimpleAuthContext.Provider value={{ user, loading, accountSuspended, authError, refreshUser, signOut, loginAsGuest }}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
} 