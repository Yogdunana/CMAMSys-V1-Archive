/**
 * Dashboard Stats API
 * GET /api/dashboard/stats - 获取仪表盘统计数据
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * GET: 获取仪表盘统计数据
 */
export async function GET(request: NextRequest) {
  try {
    // 验证认证（开发模式下跳过）
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
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
    }

    try {
      // 统计活跃竞赛
      const activeCompetitions = await prisma.competition.count({
        where: {
          status: {
            in: ['DRAFT', 'IN_PROGRESS'],
          },
        },
      });

      // 统计自动化建模任务（非完成状态）
      const modelingTasks = await prisma.autoModelingTask.count({
        where: {
          overallStatus: {
            in: ['PENDING', 'DISCUSSING', 'CODING', 'VALIDATING', 'RETRYING', 'PAPER_GENERATING'],
          },
        },
      });

      // 统计团队成员（所有非删除用户）
      const teamMembers = await prisma.user.count({
        where: {
          deletedAt: null,
        },
      });

      // 统计 AI 请求总数
      const aiRequests = await prisma.aIRequest.count({});

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            activeCompetitions,
            modelingTasks,
            teamMembers,
            aiRequests,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (dbError) {
      // 数据库不可用时返回错误
      console.error('Database error:', dbError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch dashboard stats from database',
            details: isDev ? String(dbError) : undefined,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
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
