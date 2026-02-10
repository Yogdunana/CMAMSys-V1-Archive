/**
 * Modeling Task Detail API v1
 * GET /api/v1/modeling-tasks/[id] - 获取任务详情
 * PATCH /api/v1/modeling-tasks/[id] - 更新任务
 * DELETE /api/v1/modeling-tasks/[id] - 删除任务
 *
 * @version 1.0.0
 * @route /api/v1/modeling-tasks/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { verifyAccessToken } from '@/lib/jwt';
import { applyRateLimit, MiddlewarePresets } from '@/lib/rate-limit';
import { validateCSRFToken } from '@/lib/csrf';

/**
 * GET: 获取任务详情
 * 速率限制: general preset
 * 认证: Bearer Token
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    // 应用速率限制
    const rateLimitResult = await applyRateLimit({
      request,
      preset: 'general',
    });

    if (rateLimitResult.blocked) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            details: rateLimitResult,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>(
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

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const task = await prisma.modelingTask.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          ...task,
          competitionName: task.competition?.name,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'X-API-Version': 'v1',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch task details',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH: 更新任务
 * 速率限制: general preset
 * 认证: Bearer Token
 * CSRF Protection: Required
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    // 应用速率限制
    const rateLimitResult = await applyRateLimit({
      request,
      preset: 'general',
    });

    if (rateLimitResult.blocked) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            details: rateLimitResult,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 验证 CSRF Token
    const csrfResult = await validateCSRFToken({
      request,
      strict: true,
    });

    if (!csrfResult.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid CSRF token',
            details: csrfResult,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>(
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

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    const body = await request.json();
    const { name, description, status, progress, algorithm, approachNumber, priority } = body;

    // 更新任务
    const task = await prisma.modelingTask.update({
      where: {
        id: params.id,
        deletedAt: null,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(algorithm && { algorithm }),
        ...(approachNumber !== undefined && { approachNumber }),
        ...(priority && { priority }),
        updatedById: userId,
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: task,
        message: 'Task updated successfully',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'X-API-Version': 'v1',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update task',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 删除任务（软删除）
 * 速率限制: general preset
 * 认证: Bearer Token
 * CSRF Protection: Required
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    // 应用速率限制
    const rateLimitResult = await applyRateLimit({
      request,
      preset: 'general',
    });

    if (rateLimitResult.blocked) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            details: rateLimitResult,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 验证 CSRF Token
    const csrfResult = await validateCSRFToken({
      request,
      strict: true,
    });

    if (!csrfResult.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid CSRF token',
            details: csrfResult,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>(
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

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // 软删除任务
    await prisma.modelingTask.update({
      where: {
        id: params.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Task deleted successfully',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'X-API-Version': 'v1',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete task',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
