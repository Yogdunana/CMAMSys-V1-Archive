/**
 * Dashboard Stats API v1
 * GET /api/v1/dashboard/stats - 获取仪表盘统计数据
 *
 * @version 1.0.0
 * @route /api/v1/dashboard/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { verifyAccessToken } from '@/lib/jwt';
import { applyRateLimit } from '@/lib/rate-limit';

/**
 * GET: 获取仪表盘统计数据
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
    const days = parseInt(searchParams.get('days') || '30');

    try {
      // 并行查询所有统计数据
      const [
        activeCompetitions,
        modelingTasks,
        teamMembers,
        aiRequests,
        aiProviders,
        totalTasks,
        completedTasks,
        avgProgress,
      ] = await Promise.all([
        // 活跃竞赛
        prisma.competition.count({
          where: {
            status: {
              in: ['DRAFT', 'IN_PROGRESS'],
            },
            deletedAt: null,
          },
        }),
        // 进行中的建模任务
        prisma.modelingTask.count({
          where: {
            status: {
              in: ['PENDING', 'PREPROCESSING', 'MODELING', 'EVALUATING', 'REPORTING'],
            },
            deletedAt: null,
          },
        }),
        // 团队成员
        prisma.user.count({
          where: {
            deletedAt: null,
          },
        }),
        // AI 请求（最近 N 天）
        prisma.aIRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            },
          },
        }),
        // 激活的 AI Provider
        prisma.aIProvider.count({
          where: {
            isActive: true,
          },
        }),
        // 总任务数
        prisma.modelingTask.count({
          where: {
            deletedAt: null,
          },
        }),
        // 完成的任务数
        prisma.modelingTask.count({
          where: {
            status: 'COMPLETED',
            deletedAt: null,
          },
        }),
        // 平均进度
        prisma.modelingTask.aggregate({
          where: {
            deletedAt: null,
            status: {
              in: ['PENDING', 'PREPROCESSING', 'MODELING', 'EVALUATING', 'REPORTING'],
            },
          },
          _avg: {
            progress: true,
          },
        }),
      ]);

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            activeCompetitions,
            modelingTasks,
            teamMembers,
            aiRequests,
            aiProviders,
            totalTasks,
            completedTasks,
            successRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0',
            avgProgress: avgProgress._avg.progress || 0,
            period: {
              days,
              startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date().toISOString(),
            },
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
    } catch (dbError) {
      // 数据库不可用时返回 mock 数据
      console.error('Database error:', dbError);

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            activeCompetitions: 3,
            modelingTasks: 12,
            teamMembers: 8,
            aiRequests: 1234,
            aiProviders: 5,
            totalTasks: 45,
            completedTasks: 33,
            successRate: '73.3',
            avgProgress: 68,
            period: {
              days,
              startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date().toISOString(),
            },
            _mock: true,
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
    }
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard stats',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
