// Auth Client Integration for demo-trade-ui
// This file handles communication with the centralized auth service

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  message?: string;
}

// Auth Client API
export const authClient = {
  // Get current user from auth service
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to get user',
        };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  // Redirect to auth client for sign in
  signIn: (redirectTo?: string) => {
    const authUrl = `${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/signin`;
    const params = new URLSearchParams();
    if (redirectTo) {
      params.set('redirectTo', redirectTo);
    }
    params.set('source', 'demo-trade-ui');
    
    window.location.href = `${authUrl}?${params.toString()}`;
  },

  // Redirect to auth client for sign up
  signUp: (redirectTo?: string) => {
    const authUrl = `${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/signup`;
    const params = new URLSearchParams();
    if (redirectTo) {
      params.set('redirectTo', redirectTo);
    }
    params.set('source', 'demo-trade-ui');
    
    window.location.href = `${authUrl}?${params.toString()}`;
  },

  // Redirect to auth client for profile management
  profile: () => {
    const authUrl = `${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/profile`;
    const params = new URLSearchParams();
    params.set('source', 'demo-trade-ui');
    params.set('redirectTo', window.location.href);
    
    window.location.href = `${authUrl}?${params.toString()}`;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    // Clear any local storage/cookies
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
    
    // Redirect to home page
    window.location.href = '/';
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await authClient.getCurrentUser();
      return response.success && !!response.user;
    } catch (error) {
      return false;
    }
  },

  // Get user role
  getUserRole: async (): Promise<string | null> => {
    try {
      const response = await authClient.getCurrentUser();
      return response.success && response.user ? response.user.role : null;
    } catch (error) {
      return null;
    }
  },
};

// Utility functions
export const getRoleDisplayText = (role: string): string => {
  switch (role) {
    case 'guest':
      return 'Guest user with limited access';
    case 'trader':
      return 'Trader with full trading access';
    case 'aitrader':
      return 'AI Trader with advanced features';
    case 'admin':
      return 'Administrator with full access';
    default:
      return 'Unknown role';
  }
};

export const canTrade = (role: string): boolean => {
  return ['trader', 'aitrader', 'admin'].includes(role);
}; 