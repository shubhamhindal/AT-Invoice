'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('token');
    if (saved) {
      setToken(saved);
      document.cookie = `auth_token=${saved}; path=/; max-age=604800`;
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    sessionStorage.setItem('token', newToken);
    document.cookie = `auth_token=${newToken}; path=/; max-age=604800`;
    setToken(newToken);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    document.cookie = 'auth_token=; path=/; max-age=0';
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};