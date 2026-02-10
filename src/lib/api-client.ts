/**
 * API Client for CMAMSys
 * CMAMSys API 客户端
 * 支持 v1 API 版本，自动处理 CSRF Token 和错误处理
 *
 * @version 1.0.0
 */

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipCSRF?: boolean;
  queryParams?: Record<string, any>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private csrfToken: string | null = null;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || '/api/v1';
    this.timeout = config.timeout || 30000;
  }

  /**
   * 初始化 CSRF Token
   */
  async initCSRFToken(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/csrf-token`);
      const data: ApiResponse<{ token: string }> = await response.json();

      if (data.success && data.data?.token) {
        this.csrfToken = data.data.token;
        localStorage.setItem('csrfToken', this.csrfToken);
      }
    } catch (error) {
      console.error('Failed to initialize CSRF token:', error);
    }
  }

  /**
   * 获取 CSRF Token
   */
  private getCSRFToken(): string | null {
    // 优先使用内存中的 token
    if (this.csrfToken) {
      return this.csrfToken;
    }

    // 从 localStorage 获取
    const token = localStorage.getItem('csrfToken');
    if (token) {
      this.csrfToken = token;
      return token;
    }

    return null;
  }

  /**
   * 获取访问令牌
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * 构建完整 URL
   */
  private buildURL(endpoint: string, queryParams?: Record<string, any>): string {
    let url = `${this.baseURL}${endpoint}`;

    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const paramString = params.toString();
      if (paramString) {
        url += `?${paramString}`;
      }
    }

    return url;
  }

  /**
   * 构建请求头
   */
  private buildHeaders(options: RequestOptions): Headers {
    const headers = new Headers(options.headers);

    // 设置默认 Content-Type
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    // 添加认证头
    if (!options.skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // 添加 CSRF Token
    if (!options.skipCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
      }
    }

    return headers;
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data: ApiResponse<T> = await response.json();

      // 处理速率限制
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

        throw {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '请求过于频繁，请稍后再试',
          retryAfter: delay,
        };
      }

      // 处理认证错误
      if (response.status === 401) {
        // 尝试刷新令牌
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          throw { code: 'TOKEN_REFRESHED', message: '令牌已刷新' };
        }
      }

      // 处理 CSRF 错误
      if (response.status === 403 && data.error?.code === 'CSRF_TOKEN_INVALID') {
        // 重新获取 CSRF Token
        await this.initCSRFToken();
      }

      return data;
    }

    // 处理非 JSON 响应
    return {
      success: response.ok,
      data: (await response.text()) as any,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 刷新访问令牌
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data: ApiResponse<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }> = await response.json();

      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  /**
   * 发起请求
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, options.queryParams);
    const headers = this.buildHeaders(options);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          code: 'TIMEOUT',
          message: '请求超时',
        };
      }

      throw error;
    }
  }

  /**
   * GET 请求
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST 请求
   */
  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH 请求
   */
  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// 创建默认实例
const apiClient = new ApiClient();

// 在应用启动时初始化 CSRF Token
if (typeof window !== 'undefined') {
  apiClient.initCSRFToken();
}

export default apiClient;
export { ApiClient, type ApiResponse, type RequestOptions };
