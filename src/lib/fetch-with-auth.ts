/**
 * 带有 Token 验证的 fetch 函数
 * 自动处理 Token 过期情况，显示弹窗提示
 */

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

// 创建全局实例，不依赖 React Context
let showTokenExpiredCallback: ((reason?: 'unauthorized' | 'expired' | 'invalid') => void) | null = null;

export function setShowTokenExpiredCallback(callback: typeof showTokenExpiredCallback) {
  showTokenExpiredCallback = callback;
}

export async function fetchWithAuth<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  // 获取 Token
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

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
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    // 检查是否是 401 错误
    if (response.status === 401) {
      console.log('[fetchWithAuth] Unauthorized, showing token expired dialog');
      // 调用全局回调函数显示 Token 过期弹窗
      if (showTokenExpiredCallback) {
        showTokenExpiredCallback('unauthorized');
      }
      return {
        success: false,
        error: 'Unauthorized',
        details: '请重新登录',
      };
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
      const token = localStorage.getItem('accessToken');

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
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        const data = await response.json();

        // 检查是否是 401 错误
        if (response.status === 401) {
          console.log('[useFetchWithAuth] Unauthorized, showing token expired dialog');
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
