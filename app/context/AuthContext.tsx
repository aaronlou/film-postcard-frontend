'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';

interface User {
  id: number;
  username: string;
  email?: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  location?: string;
  designCount: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, email?: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    username: string,
    password: string,
    email?: string,
    displayName?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, displayName }),
      });

      if (response.ok) {
        const userData = await response.json();
        // Auto login after registration
        return await login(username, password);
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.getUserProfile(user.username));
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        refreshUser,
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
