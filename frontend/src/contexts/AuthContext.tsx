import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'counsellor' | 'admin';
  avatar?: string;
  isVerified?: boolean;
  professional?: any;
  personal?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | { requiresVerification: boolean; email: string }>;
  register: (name: string, email: string, password: string, role?: User['role']) => Promise<User>;
  verifyOTP: (email: string, otp: string) => Promise<User>;
  googleLogin: (credential: string, isAccessToken?: boolean) => Promise<User>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ message: string }>;
  updateProfile: (payload: { name?: string; avatar?: string; professional?: any; personal?: any }) => Promise<User>;
  refreshProfile: () => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'mindcare_user';
const TOKEN_STORAGE_KEY = 'mindcare_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  const persistSession = (payload: { _id?: string; id?: string; name: string; email: string; role: User['role']; avatar?: string; isVerified?: boolean; token: string }) => {
    const nextUser: User = {
      id: payload._id || payload.id || payload.email,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      avatar: payload.avatar,
      isVerified: payload.isVerified,
      professional: (payload as any).professional,
      personal: (payload as any).personal,
    };

    setUser(nextUser);
    setToken(payload.token);
    return nextUser;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.requiresVerification) {
        return data;
      }

      return persistSession(data);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: User['role'] = 'student') => {
    setIsLoading(true);
    try {
      const data = await apiRequest<any>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (data.message && !data.token) {
        return data;
      }

      return persistSession(data);
    } finally {
      setIsLoading(false);
    }
  };


  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ _id: string; name: string; email: string; role: User['role']; avatar?: string; isVerified?: boolean; token: string }>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      return persistSession(data);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credential: string, isAccessToken: boolean = false) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ _id: string; name: string; email: string; role: User['role']; avatar?: string; isVerified?: boolean; token: string }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credential, isAccessToken }),
      });

      return persistSession(data);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return null;

    const profile = await apiRequest<{ _id: string; name: string; email: string; role: User['role']; avatar?: string; isVerified?: boolean }>('/api/auth/me', {
      method: 'GET',
      token,
    });

    const nextUser: User = {
      id: profile._id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      isVerified: profile.isVerified,
    };
    setUser(nextUser);
    return nextUser;
  };

  const updateProfile = async (payload: { name?: string; avatar?: string; professional?: any; personal?: any }) => {
    if (!token) throw new Error('Please sign in first.');

    const profile = await apiRequest<{ _id: string; name: string; email: string; role: User['role']; avatar?: string; isVerified?: boolean }>('/api/auth/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    });

    const nextUser: User = {
      id: profile._id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      isVerified: profile.isVerified,
      professional: (profile as any).professional,
      personal: (profile as any).personal,
    };
    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    if (!token) return;
    refreshProfile().catch(() => {
      setUser(null);
      setToken(null);
    });
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        verifyOTP, 
        googleLogin, 
        forgotPassword, 
        resetPassword, 
        updateProfile,
        refreshProfile,
        logout, 
        isLoading, 
        token,
        isAuthenticated: !!token && !!user
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
