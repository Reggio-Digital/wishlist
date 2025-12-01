'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount using httpOnly cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Call /api/auth/me - cookies are sent automatically
        const user = await authApi.me();
        setIsAuthenticated(true);
        setUsername(user.username);
      } catch (error) {
        // Not authenticated or session expired
        setIsAuthenticated(false);
        setUsername(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    // Server sets httpOnly cookies automatically
    await authApi.login(username, password);
    setIsAuthenticated(true);
    setUsername(username);
  };

  const logout = async () => {
    try {
      // Server clears httpOnly cookies
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    setIsAuthenticated(false);
    setUsername(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
