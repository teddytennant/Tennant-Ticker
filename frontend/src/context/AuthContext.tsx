import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Global auth state to prevent multiple initializations across re-renders
window.__AUTH_STATUS = window.__AUTH_STATUS ?? {
  initialized: false,
  authenticated: false,
};

// Check if token exists in localStorage - only run once
const getStoredAuthStatus = (): boolean => {
  // Only run the actual localStorage check once per session
  if (!window.__AUTH_STATUS.initialized) {
    try {
      const token = localStorage.getItem('auth_token');
      window.__AUTH_STATUS.authenticated = token === 'authenticated';
      window.__AUTH_STATUS.initialized = true;
      
      console.log('Auth token check (once):', 
        window.__AUTH_STATUS.authenticated ? 'Authenticated' : 'Not authenticated');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      window.__AUTH_STATUS.authenticated = false;
      window.__AUTH_STATUS.initialized = true;
    }
  }
  
  return window.__AUTH_STATUS.authenticated;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use synchronous state initialization to avoid re-renders during hydration
  const [isAuthenticated, setIsAuthenticated] = useState(getStoredAuthStatus());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authStateUpdated = useRef(false);
  
  // Track if auth state change was from our own code
  const handleAuthChange = useCallback((newState: boolean) => {
    if (newState === isAuthenticated) return; // Don't update if same value
    
    authStateUpdated.current = true;
    window.__AUTH_STATUS.authenticated = newState;
    setIsAuthenticated(newState);
  }, [isAuthenticated]);

  // Login function - validates password server-side
  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      const isValid = response.ok && data.authenticated === true;

      if (isValid) {
        localStorage.setItem('auth_token', data.token || 'authenticated');
        handleAuthChange(true);

        // Get the redirect path from URL or default to home
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirect') || '/';
        navigate(redirectTo);
      }

      return isValid;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, [handleAuthChange, navigate, location]);

  // Logout function
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('auth_token');
      handleAuthChange(false);
      navigate('/login');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }, [handleAuthChange, navigate]);

  // Deeply memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [isAuthenticated, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}