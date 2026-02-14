/**
 * Dashboard Activities API
 * GET /api/dashboard/activities - 获取最近活动
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * GET: 获取最近活动（最近创建的自动化建模任务）
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
      // 获取最近创建的自动化建模任务
      const tasks = await prisma.autoModelingTask.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: tasks.map(t => ({
            id: t.id,
            name: t.problemTitle,
            problemNumber: '', // 自动化任务没有问题编号
            competitionName: t.competitionType,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          })),
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
            message: 'Failed to fetch dashboard activities from database',
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
          message: 'Failed to fetch dashboard activities',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
