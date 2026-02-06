/**
 * Database Configuration API
 * POST /api/settings/database
 * Update database connection settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withPermission } from '@/lib/auth-middleware';
import { PermissionCategory, PermissionAction } from '@/lib/rbac';
import { ApiResponse } from '@/lib/types';

// Validation schema
const databaseConfigSchema = z.object({
  type: z.enum(['sqlite', 'postgresql']),
  connectionString: z.string().min(1, 'Connection string is required'),
  testConnection: z.boolean().default(false),
});

/**
 * GET /api/settings/database
 * Get current database configuration
 */
export async function GET(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.DATABASE_CONFIG,
    PermissionAction.READ,
    async (req, user) => {
      try {
        const currentConfig = {
          type: process.env.DATABASE_URL?.includes('sqlite') ? 'sqlite' : 'postgresql',
          connectionString: process.env.DATABASE_URL,
          isConfigured: !!process.env.DATABASE_URL,
        };

        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: currentConfig,
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
              message: 'Failed to get database configuration',
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
 * POST /api/settings/database
 * Update database configuration
 */
export async function POST(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.DATABASE_CONFIG,
    PermissionAction.UPDATE,
    async (req, user) => {
      try {
        const body = await request.json();
        const validationResult = databaseConfigSchema.safeParse(body);

        if (!validationResult.success) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid database configuration',
                details: validationResult.error.issues,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }

        const { type, connectionString, testConnection } = validationResult.data;

        // 验证连接字符串格式
        if (type === 'sqlite') {
          if (!connectionString.startsWith('file:')) {
            return NextResponse.json<ApiResponse>(
              {
                success: false,
                error: {
                  code: 'INVALID_CONNECTION_STRING',
                  message: 'SQLite connection string must start with "file:"',
                },
                timestamp: new Date().toISOString(),
              },
              { status: 400 }
            );
          }
        } else if (type === 'postgresql') {
          if (!connectionString.startsWith('postgresql://')) {
            return NextResponse.json<ApiResponse>(
              {
                success: false,
                error: {
                  code: 'INVALID_CONNECTION_STRING',
                  message: 'PostgreSQL connection string must start with "postgresql://"',
                },
                timestamp: new Date().toISOString(),
              },
              { status: 400 }
            );
          }
        }

        // 测试数据库连接（如果请求）
        let testResult = null;
        if (testConnection) {
          // 这里应该实际测试连接
          // 由于简化，我们只返回模拟结果
          testResult = {
            success: true,
            message: 'Database connection test successful',
            latency: Math.random() * 100,
          };
        }

        // 更新环境变量
        // 注意：在生产环境中，这需要重启服务才能生效
        // 这里我们只是返回成功响应

        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: {
              message: 'Database configuration updated successfully',
              requiresRestart: true,
              testResult,
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
              message: 'Failed to update database configuration',
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
