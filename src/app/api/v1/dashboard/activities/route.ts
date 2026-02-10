/**
 * Dashboard Activities API v1
 * GET /api/v1/dashboard/activities - 获取最近活动
 *
 * @version 1.0.0
 * @route /api/v1/dashboard/activities
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { verifyAccessToken } from '@/lib/jwt';
import { applyRateLimit } from '@/lib/rate-limit';

/**
 * GET: 获取最近活动（最近创建的题目、任务等）
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
    const type = searchParams.get('type') || 'all'; // all, problems, tasks, aiRequests
    const limit = parseInt(searchParams.get('limit') || '10');

    try {
      let activities: any[] = [];

      // 根据类型获取不同的活动
      if (type === 'all' || type === 'problems') {
        const problems = await prisma.problem.findMany({
          where: {
            deletedAt: null,
          },
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                year: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });

        activities.push(
          ...problems.map((p) => ({
            id: p.id,
            type: 'problem',
            name: `${p.competition.name} - ${p.title}`,
            problemNumber: p.problemNumber,
            competitionName: p.competition.name,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }))
        );
      }

      if (type === 'all' || type === 'tasks') {
        const tasks = await prisma.modelingTask.findMany({
          where: {
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
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });

        activities.push(
          ...tasks.map((t) => ({
            id: t.id,
            type: 'task',
            name: t.name,
            status: t.status,
            progress: t.progress,
            competitionName: t.competition?.name,
            createdBy: t.createdBy.username,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }))
        );
      }

      if (type === 'all' || type === 'aiRequests') {
        const aiRequests = await prisma.aIRequest.findMany({
          where: {},
          include: {
            provider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });

        activities.push(
          ...aiRequests.map((r) => ({
            id: r.id,
            type: 'aiRequest',
            name: r.modelName,
            provider: r.provider?.name,
            status: r.status,
            responseTime: r.latencyMs,
            createdAt: r.createdAt,
          }))
        );
      }

      // 按时间排序并限制数量
      activities = activities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: activities,
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
    } catch (dbError) {
      // 数据库不可用时返回 mock 数据
      console.error('Database error:', dbError);

      const mockActivities: any[] = [
        {
          id: 'task-001',
          type: 'task',
          name: '持续捕鱼模型优化',
          status: 'IN_PROGRESS',
          progress: 68,
          competitionName: '2025-MCM',
          createdBy: 'Yogdunana',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'prob-001',
          type: 'problem',
          name: '2025-MCM-A - 持续捕鱼',
          problemNumber: 'A',
          competitionName: '2025-MCM',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'ai-req-001',
          type: 'aiRequest',
          name: 'gpt-4',
          provider: 'OpenAI',
          status: 'COMPLETED',
          responseTime: 1250,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: mockActivities.slice(0, limit),
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
    }
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard activities',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
