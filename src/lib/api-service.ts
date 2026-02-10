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
  modelingTasks: number;
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

export interface ModelingTask {
  id: string;
  name: string;
  description?: string;
  problemType: string;
  status: 'PENDING' | 'PREPROCESSING' | 'MODELING' | 'EVALUATING' | 'REPORTING' | 'COMPLETED' | 'FAILED';
  progress: number;
  algorithm?: string;
  approachNumber?: number;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  competitionId?: string;
  competitionName?: string;
  dataFilePath: string;
  problemFilePath: string;
  createdById: string;
  createdBy?: {
    id: string;
    username: string;
    email: string;
  };
  updatedById: string;
  updatedBy?: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateModelingTaskRequest {
  name: string;
  description?: string;
  problemType?: string;
  competitionId?: string;
  algorithm?: string;
  approachNumber?: number;
  priority?: string;
}

export interface UpdateModelingTaskRequest {
  name?: string;
  description?: string;
  status?: string;
  progress?: number;
  algorithm?: string;
  approachNumber?: number;
  priority?: string;
}

export const modelingTasksApi = {
  /**
   * 获取建模任务列表
   */
  async list(
    page: number = 1,
    limit: number = 20,
    status?: string,
    competitionId?: string
  ): Promise<ApiResponse<ModelingTask[]>> {
    return apiClient.get<ModelingTask[]>('/modeling-tasks', {
      queryParams: { page, limit, status, competitionId },
    });
  },

  /**
   * 获取建模任务详情
   */
  async get(id: string): Promise<ApiResponse<ModelingTask>> {
    return apiClient.get<ModelingTask>(`/modeling-tasks/${id}`);
  },

  /**
   * 创建建模任务
   */
  async create(data: CreateModelingTaskRequest): Promise<ApiResponse<ModelingTask>> {
    return apiClient.post<ModelingTask>('/modeling-tasks', data);
  },

  /**
   * 更新建模任务
   */
  async update(id: string, data: UpdateModelingTaskRequest): Promise<ApiResponse<ModelingTask>> {
    return apiClient.patch<ModelingTask>(`/modeling-tasks/${id}`, data);
  },

  /**
   * 删除建模任务
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/modeling-tasks/${id}`);
  },
};

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
  modelingTasks: modelingTasksApi,
  autoModeling: autoModelingApi,
};

export default api;
