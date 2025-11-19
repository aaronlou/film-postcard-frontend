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
  xiaohongshu?: string;
  favoriteCamera?: string;
  favoriteLens?: string;
  favoritePhotographer?: string;
  designCount: number;
  photoCount?: number;
  // Storage quota fields
  userTier?: 'FREE' | 'BASIC' | 'PRO';
  storageUsed?: number;      // Bytes used
  storageLimit?: number;     // Total bytes allowed
  photoLimit?: number;       // Max photo count
  singleFileLimit?: number;  // Max bytes per file
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
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Refresh user data from backend to get latest tier info
      fetch(API_ENDPOINTS.getUserProfile(parsedUser.username))
        .then(res => res.ok ? res.json() : null)
        .then(userData => {
          if (userData) {
            setUser(userData);
            localStorage.setItem('user_data', JSON.stringify(userData));
            console.log('✅ User data refreshed with tier:', userData.userTier);
          }
        })
        .catch(err => console.error('Failed to refresh user on mount:', err));
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
        
        // Fetch full user profile to get tier info
        const profileRes = await fetch(API_ENDPOINTS.getUserProfile(username));
        if (profileRes.ok) {
          const userData = await profileRes.json();
          setUser(userData);
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(userData));
          console.log('✅ Login successful, user tier:', userData.userTier);
        } else {
          // Fallback to login response user data
          setUser(data.user);
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }
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
