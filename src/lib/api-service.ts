/**
 * API Service Layer
 * API 服务层
 * 提供类型安全的 API 方法
 *
 * @version 1.0.0
 */

import apiClient from './api-client';
import type { ApiResponse } from './api-client';

// ============= Auth API =============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    isVerified: boolean;
    isMfaEnabled: boolean;
  };
}

export const authApi = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/logout');
  },

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  },
};

// ============= Dashboard API =============

export interface DashboardStats {
  activeCompetitions: number;
  teamMembers: number;
  aiRequests: number;
  aiProviders: number;
  totalTasks: number;
  completedTasks: number;
  successRate: string;
  avgProgress: number;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface Activity {
  id: string;
  type: 'problem' | 'task' | 'aiRequest';
  name: string;
  status?: string;
  progress?: number;
  competitionName?: string;
  createdBy?: string;
  provider?: string;
  responseTime?: number;
  createdAt: string;
  updatedAt?: string;
}

export const dashboardApi = {
  /**
   * 获取仪表盘统计数据
   */
  async getStats(days: number = 30): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/dashboard/stats', {
      queryParams: { days },
    });
  },

  /**
   * 获取最近活动
   */
  async getActivities(
    type: string = 'all',
    limit: number = 10
  ): Promise<ApiResponse<Activity[]>> {
    return apiClient.get<Activity[]>('/dashboard/activities', {
      queryParams: { type, limit },
    });
  },
};

// ============= User API =============

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  isMfaEnabled: boolean;
  avatar?: string;
  bio?: string;
  organization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username: string;
  bio?: string;
  organization?: string;
  avatar?: string;
}

export const userApi = {
  /**
   * 获取用户资料
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/user/profile');
  },

  /**
   * 更新用户资料
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/user/profile', data);
  },
};

// ============= AI Providers API =============

export interface AIProvider {
  id: string;
  name: string;
  type: string;
  apiKey: string;
  apiUrl: string;
  isActive: boolean;
  isDefault: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const aiProvidersApi = {
  /**
   * 获取 AI Provider 列表
   */
  async list(): Promise<ApiResponse<AIProvider[]>> {
    return apiClient.get<AIProvider[]>('/ai-providers');
  },

  /**
   * 获取 AI Provider 详情
   */
  async get(id: string): Promise<ApiResponse<AIProvider>> {
    return apiClient.get<AIProvider>(`/ai-providers/${id}`);
  },
};

// ============= Modeling Tasks API =============

// ============= Auto Modeling API =============

export interface StartAutoModelingRequest {
  competitionType: string;
  problemType: string;
  problemTitle: string;
  problemContent: string;
  paperFormat?: string;
  paperLanguage?: string;
}

export const autoModelingApi = {
  /**
   * 启动全自动化建模流程
   */
  async start(data: StartAutoModelingRequest): Promise<ApiResponse<{ taskId: string; message: string; tip: string }>> {
    return apiClient.post<{ taskId: string; message: string; tip: string }>('/auto-modeling/start', data);
  },
};

// ============= Export all APIs =============

export const api = {
  auth: authApi,
  dashboard: dashboardApi,
  user: userApi,
  aiProviders: aiProvidersApi,
  autoModeling: autoModelingApi,
};

export default api;
