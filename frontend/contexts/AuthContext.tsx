'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '@/lib/types';
import { setAuthTokens, removeAuthTokens, setUser, getUser, isAuthenticated as checkAuth } from '@/lib/auth';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = getUser();
    if (storedUser && checkAuth()) {
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ status: string; data: AuthResponse }>('/auth/login', {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data.data;
      setAuthTokens(accessToken, refreshToken);
      setUser(user);
      setUserState(user);
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signup = async (name: string, email: string, password: string, role: string = 'STUDENT') => {
    try {
      const response = await api.post<{ status: string; data: AuthResponse }>('/auth/signup', {
        name,
        email,
        password,
        role: role || 'STUDENT',
      });

      const { user, accessToken, refreshToken } = response.data.data;
      setAuthTokens(accessToken, refreshToken);
      setUser(user);
      setUserState(user);
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'Signup failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    removeAuthTokens();
    setUserState(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

