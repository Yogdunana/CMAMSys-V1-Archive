/**
 * RBAC (Role-Based Access Control) Permission System
 * 权限定义和检查
 */

import { UserRole } from '@/lib/types';

/**
 * Permission Categories
 */
export enum PermissionCategory {
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
  DATABASE_CONFIG = 'DATABASE_CONFIG',
  COMPETITION_MANAGEMENT = 'COMPETITION_MANAGEMENT',
  MODELING = 'MODELING',
  REPORTS = 'REPORTS',
  AI_PROVIDERS = 'AI_PROVIDERS',
  AUDIT_LOGS = 'AUDIT_LOGS',
}

/**
 * Permission Actions
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
}

/**
 * Resource Types
 */
export enum ResourceType {
  USER = 'user',
  COMPETITION = 'competition',
  MODELING_TASK = 'modeling_task',
  AI_PROVIDER = 'ai_provider',
  SYSTEM_SETTING = 'system_setting',
  AUDIT_LOG = 'audit_log',
  REPORT = 'report',
}

/**
 * Role Permissions Configuration
 * 定义每个角色可以执行的操作
 */
export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    [key in PermissionCategory]?: PermissionAction[];
  }
> = {
  // 管理员：拥有所有权限
  [UserRole.ADMIN]: {
    [PermissionCategory.USER_MANAGEMENT]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ],
    [PermissionCategory.SYSTEM_SETTINGS]: [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ],
    [PermissionCategory.DATABASE_CONFIG]: [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ],
    [PermissionCategory.COMPETITION_MANAGEMENT]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ],
    [PermissionCategory.MODELING]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ],
    [PermissionCategory.REPORTS]: [
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
      PermissionAction.EXPORT,
    ],
    [PermissionCategory.AI_PROVIDERS]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ],
    [PermissionCategory.AUDIT_LOGS]: [
      PermissionAction.READ,
      PermissionAction.EXPORT,
    ],
  },

  // 团队负责人：可以管理团队成员、创建竞赛和建模任务
  [UserRole.TEAM_LEAD]: {
    [PermissionCategory.USER_MANAGEMENT]: [
      PermissionAction.READ,
      PermissionAction.UPDATE, // 仅更新团队成员信息
    ],
    [PermissionCategory.COMPETITION_MANAGEMENT]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ],
    [PermissionCategory.MODELING]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ],
    [PermissionCategory.REPORTS]: [
      PermissionAction.READ,
      PermissionAction.EXPORT,
    ],
  },

  // 团队成员：可以查看和参与竞赛、建模任务
  [UserRole.TEAM_MEMBER]: {
    [PermissionCategory.COMPETITION_MANAGEMENT]: [PermissionAction.READ],
    [PermissionCategory.MODELING]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ],
    [PermissionCategory.REPORTS]: [PermissionAction.READ, PermissionAction.EXPORT],
  },

  // 普通用户：最基础的权限
  [UserRole.USER]: {
    [PermissionCategory.COMPETITION_MANAGEMENT]: [PermissionAction.READ],
    [PermissionCategory.REPORTS]: [PermissionAction.READ],
  },
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  category: PermissionCategory,
  action: PermissionAction
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const categoryPermissions = rolePermissions[category];
  if (!categoryPermissions) return false;

  return categoryPermissions.includes(action);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Array<{ category: PermissionCategory; action: PermissionAction }>
): boolean {
  return permissions.some((p) => hasPermission(userRole, p.category, p.action));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Array<{ category: PermissionCategory; action: PermissionAction }>
): boolean {
  return permissions.every((p) => hasPermission(userRole, p.category, p.action));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): {
  category: PermissionCategory;
  actions: PermissionAction[];
}[] {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return [];

  return Object.entries(rolePermissions).map(([category, actions]) => ({
    category: category as PermissionCategory,
    actions: actions as PermissionAction[],
  }));
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // 管理员可以访问所有路由
  if (userRole === UserRole.ADMIN) return true;

  // 非管理员用户的路由限制
  // 系统设置路由（仅管理员）
  if (route.startsWith('/settings/system')) {
    return false;
  }

  // 数据库配置路由（仅管理员）
  if (route.startsWith('/settings/database')) {
    return false;
  }

  // 审计日志路由（仅管理员）
  if (route.startsWith('/audit')) {
    return false;
  }

  // AI Providers 配置（仅管理员）
  if (route.startsWith('/dashboard/ai-providers')) {
    return false;
  }

  return true;
}

/**
 * Permission Guard Error
 */
export class PermissionError extends Error {
  constructor(
    message: string,
    public category: PermissionCategory,
    public action: PermissionAction,
    public requiredRole: UserRole
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}
