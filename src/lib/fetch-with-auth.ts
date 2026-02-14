/**
 * 带有 Token 验证的 fetch 函数
 * 自动处理 Token 过期情况，尝试刷新 Token
 */

import { verifyAccessToken } from '@/lib/jwt';
import { useTokenExpired } from '@/contexts/token-expired-context';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export interface FetchResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// 全局刷新锁，防止并发刷新
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

/**
 * 尝试刷新 Token
 */
async function attemptTokenRefresh(): Promise<string | null> {
  // 如果已经在刷新，等待刷新完成
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.log('[attemptTokenRefresh] No refresh token found');
      return null;
    }

    console.log('[attemptTokenRefresh] Attempting to refresh token...');

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.log('[attemptTokenRefresh] Refresh failed with status:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      // 保存新的 tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);

      console.log('[attemptTokenRefresh] Token refreshed successfully');

      // 通知所有等待的请求
      onRefreshed(data.data.accessToken);

      return data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('[attemptTokenRefresh] Failed to refresh token:', error);
    return null;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 清除所有认证 token 并重定向到登录页
 */
export function clearAuthAndRedirect() {
  if (typeof window !== 'undefined') {
    console.log('[clearAuthAndRedirect] 清除所有认证信息');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 重定向到登录页
    window.location.href = '/auth/login';
  }
}

// 创建全局实例，不依赖 React Context
let showTokenExpiredCallback: ((reason?: 'unauthorized' | 'expired' | 'invalid' | 'invalid_signature') => void) | null = null;

export function setShowTokenExpiredCallback(callback: typeof showTokenExpiredCallback) {
  showTokenExpiredCallback = callback;
}

export async function fetchWithAuth<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  // 获取 Token
  let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // 设置请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // 如果需要认证且有 token，添加 Authorization 头
  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // 如果收到 401 错误，尝试刷新 Token
    if (response.status === 401 && !skipAuth) {
      console.log('[fetchWithAuth] Received 401, attempting token refresh...');

      const newToken = await attemptTokenRefresh();

      if (newToken) {
        console.log('[fetchWithAuth] Token refreshed, retrying request...');

        // 使用新的 token 重试请求
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      } else {
        console.log('[fetchWithAuth] Token refresh failed, showing expired dialog');

        // 刷新失败，显示过期弹窗
        if (showTokenExpiredCallback) {
          showTokenExpiredCallback('expired');
        }

        return {
          success: false,
          error: 'Unauthorized',
          details: '请重新登录',
        };
      }
    }

    const data = await response.json();

    // 如果重试后还是 401，显示过期弹窗
    if (response.status === 401) {
      console.log('[fetchWithAuth] Retry failed, showing expired dialog');

      if (showTokenExpiredCallback) {
        showTokenExpiredCallback('unauthorized');
      }

      return {
        success: false,
        error: 'Unauthorized',
        details: '请重新登录',
      };
    }

    // 检查是否是 JWT 签名验证失败
    if (response.status === 401 || response.status === 403) {
      if (data.details && typeof data.details === 'string') {
        if (data.details.includes('JWSSignatureVerificationFailed') ||
            data.details.includes('signature verification failed')) {
          console.log('[fetchWithAuth] JWT signature verification failed');

          if (showTokenExpiredCallback) {
            showTokenExpiredCallback('invalid_signature');
          }

          return {
            success: false,
            error: 'Invalid token signature',
            details: 'Token签名验证失败，请清除所有Token并重新登录',
          };
        }
      }
    }

    return data as FetchResponse<T>;
  } catch (error) {
    console.error('[fetchWithAuth] Request failed:', error);
    return {
      success: false,
      error: '请求失败',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * React Hook 版本的 fetchWithAuth
 * 在组件中使用时会自动集成 Token 过期弹窗
 */
export function useFetchWithAuth() {
  const { showTokenExpired } = useTokenExpired();

  // 初始化全局回调
  if (typeof window !== 'undefined') {
    setShowTokenExpiredCallback(showTokenExpired);
  }

  return {
    fetchWithAuth: async <T = any>(url: string, options: FetchOptions = {}) => {
      const { skipAuth = false, ...fetchOptions } = options;

      // 获取 Token
      let token = localStorage.getItem('accessToken');

      // 设置请求头
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };

      // 如果需要认证且有 token，添加 Authorization 头
      if (!skipAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        let response = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        // 如果收到 401 错误，尝试刷新 Token
        if (response.status === 401 && !skipAuth) {
          console.log('[useFetchWithAuth] Received 401, attempting token refresh...');

          const newToken = await attemptTokenRefresh();

          if (newToken) {
            console.log('[useFetchWithAuth] Token refreshed, retrying request...');

            // 使用新的 token 重试请求
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...fetchOptions,
              headers,
            });
          } else {
            console.log('[useFetchWithAuth] Token refresh failed, showing expired dialog');

            // 刷新失败，显示过期弹窗
            showTokenExpired('expired');

            return {
              success: false,
              error: 'Unauthorized',
              details: '请重新登录',
            };
          }
        }

        const data = await response.json();

        // 如果重试后还是 401，显示过期弹窗
        if (response.status === 401) {
          console.log('[useFetchWithAuth] Retry failed, showing expired dialog');

          showTokenExpired('unauthorized');

          return {
            success: false,
            error: 'Unauthorized',
            details: '请重新登录',
          };
        }

        return data as FetchResponse<T>;
      } catch (error) {
        console.error('[useFetchWithAuth] Request failed:', error);
        return {
          success: false,
          error: '请求失败',
          details: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  };
}
