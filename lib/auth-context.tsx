'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const user = await authApi.me(token);
          setAccessToken(token);
          setUsername(user.username);
        } catch (error) {
          // Token invalid, try to refresh
          try {
            const { accessToken: newToken } = await authApi.refresh();
            localStorage.setItem('accessToken', newToken);
            const user = await authApi.me(newToken);
            setAccessToken(newToken);
            setUsername(user.username);
          } catch {
            localStorage.removeItem('accessToken');
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const { accessToken: token } = await authApi.login(username, password);
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
    setUsername(username);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUsername(null);
    router.push('/admin/login');
  };

  const refreshToken = async () => {
    const { accessToken: newToken } = await authApi.refresh();
    localStorage.setItem('accessToken', newToken);
    setAccessToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isLoading,
        accessToken,
        username,
        login,
        logout,
        refreshToken,
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
