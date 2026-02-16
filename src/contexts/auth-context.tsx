'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api-service';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  isMfaEnabled: boolean;
  avatar?: string;
  bio?: string;
  organization?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Check token validity periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(async () => {
      await refreshAuth();
    }, 14 * 60 * 1000); // Check every 14 minutes (tokens expire in 15 minutes)

    return () => clearInterval(checkInterval);
  }, [isAuthenticated]);

  async function loadAuthState() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (accessToken && refreshToken && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);

        // Verify token is still valid
        await verifyToken(accessToken);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyToken(token: string): Promise<boolean> {
    try {
      // 先本地验证 token 是否过期
      const { verifyAccessToken, isJWTSignatureError } = await import('@/lib/jwt');
      const payload = await verifyAccessToken(token);

      if (!payload) {
        // Token 无效或过期，尝试刷新
        console.log('[AuthContext] Token invalid, attempting refresh...');
        const refreshSuccess = await refreshAuth();
        return refreshSuccess;
      }

      // Token 本地有效，再验证服务器端
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // 服务器端验证失败，尝试刷新
        console.log('[AuthContext] Server verification failed, attempting refresh...');
        const refreshSuccess = await refreshAuth();
        return refreshSuccess;
      }

      return true;
    } catch (error: any) {
      console.error('[AuthContext] Token verification failed:', error);

      // 如果是签名验证失败，触发自定义事件并退出登录
      if (isJWTSignatureError(error)) {
        console.log('[AuthContext] JWT signature verification failed');
        // 触发自定义事件，让 UI 显示友好的对话框
        window.dispatchEvent(new CustomEvent('jwt-signature-error'));
        // 退出登录
        logout();
        return false;
      }

      // 其他错误，尝试刷新
      const refreshSuccess = await refreshAuth();
      return refreshSuccess;
    }
  }

  async function refreshAuth() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        logout();
        return;
      }

      // 使用新的 API 客户端
      const result = await api.auth.refreshToken(refreshToken);

      if (result.success && result.data) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setUser(result.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      logout();
    }
  }

  function login(accessToken: string, refreshToken: string, userData: User) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);

    // Redirect to login page if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/login';
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshAuth,
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
