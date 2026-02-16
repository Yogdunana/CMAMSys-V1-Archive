/**
 * Authentication and Authorization Middleware
 * 认证和授权中间件
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import {
  hasPermission,
  hasAnyPermission,
  PermissionCategory,
  PermissionAction,
  canAccessRoute,
  PermissionError,
} from '@/lib/rbac';
import { UserRole } from '@/lib/types';

/**
 * Extract JWT token from request
 * 仅从 Authorization header 和 cookie 中提取 Token，不使用 URL 查询参数
 */
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const tokenCookie = request.cookies.get('accessToken');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Decode JWT token and get user info
 */
export async function decodeToken(request: NextRequest) {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Authentication Middleware
 * 验证用户身份
 */
export async function withAuth(
  request: NextRequest,
  callback: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  const user = await decodeToken(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  return callback(request, user);
}

/**
 * Authorization Middleware - Check specific permission
 * 验证用户权限
 */
export async function withPermission(
  request: NextRequest,
  category: PermissionCategory,
  action: PermissionAction,
  callback: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(request, async (req, user) => {
    if (!hasPermission(user.role, category, action)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Permission denied. Required: ${category}:${action}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    return callback(req, user);
  });
}

/**
 * Authorization Middleware - Check if user is admin
 * 验证用户是否为管理员
 */
export async function withAdmin(
  request: NextRequest,
  callback: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withPermission(request, PermissionCategory.SYSTEM_SETTINGS, PermissionAction.READ, callback);
}

/**
 * Authorization Middleware - Check multiple permissions
 * 验证用户是否拥有任一权限
 */
export async function withAnyPermission(
  request: NextRequest,
  permissions: Array<{ category: PermissionCategory; action: PermissionAction }>,
  callback: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(request, async (req, user) => {
    if (!hasAnyPermission(user.role, permissions)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Permission denied',
            requiredPermissions: permissions,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    return callback(req, user);
  });
}

/**
 * Authorization Middleware - Check route access
 * 验证用户是否可以访问特定路由
 */
export async function withRouteAccess(
  request: NextRequest,
  callback: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(request, async (req, user) => {
    const route = request.nextUrl.pathname;

    if (!canAccessRoute(user.role, route)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied to route: ${route}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    return callback(req, user);
  });
}

/**
 * Get user from request (for non-protected routes)
 */
export async function getUser(request: NextRequest) {
  return await decodeToken(request);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await decodeToken(request);
  return user !== null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const user = await decodeToken(request);
  return user?.role === UserRole.ADMIN;
}
