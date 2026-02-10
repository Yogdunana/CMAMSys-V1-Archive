/**
 * Modeling Tasks API v1
 * GET /api/v1/modeling-tasks - 获取建模任务列表
 * POST /api/v1/modeling-tasks - 创建建模任务
 *
 * @version 1.0.0
 * @route /api/v1/modeling-tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { verifyAccessToken } from '@/lib/jwt';
import { applyRateLimit, MiddlewarePresets } from '@/lib/rate-limit';
import { validateCSRFToken } from '@/lib/csrf';

/**
 * GET: 获取建模任务列表
 * 速率限制: general preset
 * 认证: Bearer Token
 */
export async function GET(request: NextRequest) {
  try {
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

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const competitionId = searchParams.get('competitionId');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (competitionId) {
      where.competitionId = competitionId;
    }

    // 获取总数和列表
    const [total, tasks] = await Promise.all([
      prisma.modelingTask.count({ where }),
      prisma.modelingTask.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: tasks.map((task) => ({
          ...task,
          competitionName: task.competition?.name,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
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
          message: 'Failed to fetch modeling tasks',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST: 创建建模任务
 * 速率限制: modelingTask preset
 * 认证: Bearer Token
 * CSRF Protection: Required
 */
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = await applyRateLimit({
      request,
      preset: 'modelingTask',
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
    const { name, description, problemType, competitionId, algorithm, approachNumber, priority } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name is required',
            details: {
              fields: ['name'],
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 创建建模任务
    const task = await prisma.modelingTask.create({
      data: {
        name,
        description,
        problemType: problemType || 'EVALUATION',
        status: 'PENDING',
        progress: 0,
        algorithm,
        approachNumber,
        competitionId,
        priority: priority || 'NORMAL',
        dataFilePath: `/data/${name.toLowerCase().replace(/\s+/g, '_')}/data.csv`,
        problemFilePath: `/data/${name.toLowerCase().replace(/\s+/g, '_')}/problem.pdf`,
        createdById: userId,
        updatedById: userId,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: task,
        message: 'Modeling task created successfully',
        timestamp: new Date().toISOString(),
      },
      {
        status: 201,
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
          message: 'Failed to create modeling task',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
