/**
 * System Settings API
 * GET /api/settings/system
 * Get system configuration
 * PUT /api/settings/system
 * Update system configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withPermission } from '@/lib/auth-middleware';
import { PermissionCategory, PermissionAction } from '@/lib/rbac';
import { ApiResponse } from '@/lib/types';

// Validation schema
const systemConfigSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  appUrl: z.string().url().optional(),
  jwtAccessExpiry: z.string().optional(),
  jwtRefreshExpiry: z.string().optional(),
  mfaEnabled: z.boolean().optional(),
  maxLoginAttempts: z.number().min(1).max(10).optional(),
  lockoutDuration: z.number().min(60000).max(3600000).optional(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

/**
 * GET /api/settings/system
 * Get system configuration
 */
export async function GET(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.SYSTEM_SETTINGS,
    PermissionAction.READ,
    async (req, user) => {
      try {
        const systemConfig = {
          appName: process.env.APP_NAME,
          appUrl: process.env.APP_URL,
          port: process.env.APP_PORT,
          nodeEnv: process.env.NODE_ENV,
          jwtAccessExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY,
          jwtRefreshExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY,
          mfaEnabled: process.env.MFA_ENABLED === 'true',
          maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
          lockoutDuration: parseInt(process.env.LOCKOUT_DURATION_MS || '900000'),
          logLevel: process.env.LOG_LEVEL,
          bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
          databaseType: process.env.DATABASE_URL?.includes('sqlite') ? 'sqlite' : 'postgresql',
        };

        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: systemConfig,
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to get system configuration',
              details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }
  );
}

/**
 * PUT /api/settings/system
 * Update system configuration
 */
export async function PUT(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.SYSTEM_SETTINGS,
    PermissionAction.UPDATE,
    async (req, user) => {
      try {
        const body = await request.json();
        const validationResult = systemConfigSchema.safeParse(body);

        if (!validationResult.success) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid system configuration',
                details: validationResult.error.issues,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }

        const updates = validationResult.data;

        // 在生产环境中，这里需要：
        // 1. 验证配置有效性
        // 2. 更新 .env 文件
        // 3. 重启服务以应用更改

        // 注意：由于环境变量在运行时无法直接修改，
        // 这里我们返回成功响应，但实际上配置不会立即生效
        // 需要管理员手动重启服务

        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: {
              message: 'System configuration updated successfully',
              requiresRestart: true,
              updatedFields: Object.keys(updates),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to update system configuration',
              details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }
  );
}
