/**
 * Learning Control API
 * POST /api/learning/control/start - 启动学习
 * POST /api/learning/control/stop - 停止学习
 * GET /api/learning/control/status - 获取学习状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import {
  autoSearchAndCreateTasks,
  executeLearningTask,
} from '@/services/bilibili-learning';

/**
 * POST: 启动学习
 */
export async function POST(request: NextRequest) {
  try {
    // 验证认证（开发模式下跳过）
    const isDev = process.env.NODE_ENV === 'development';
    let payload = null;

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

      const token = authHeader.substring(7);
      payload = await verifyAccessToken(token);

      if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Admin access required',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    }

    // 获取请求参数
    const body = await request.json();
    const { action } = body;

    if (action === 'auto_search') {
      // 自动搜索并创建学习任务
      const tasks = await autoSearchAndCreateTasks();

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            tasksCreated: tasks.length,
            tasks,
          },
          message: `Successfully created ${tasks.length} learning tasks`,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else if (action === 'execute_task') {
      // 执行指定的学习任务
      const { taskId, aiProviderId } = body;

      if (!taskId || !aiProviderId) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'taskId and aiProviderId are required',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const task = await executeLearningTask(taskId, aiProviderId);

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: task,
          message: 'Learning task executed successfully',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid action. Use "auto_search" or "execute_task"',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to control learning',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET: 获取学习状态
 */
export async function GET(request: NextRequest) {
  try {
    // 验证认证（开发模式下跳过）
    const isDev = process.env.NODE_ENV === 'development';
    let payload = null;

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

      const token = authHeader.substring(7);
      payload = await verifyAccessToken(token);

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
    }

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

    // 获取学习配置
    const config = await prisma.learningConfig.findFirst();

    // 获取任务统计
    const taskStats = await prisma.videoLearningTask.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // 获取视频统计
    const videoStats = await prisma.bilibiliVideo.groupBy({
      by: ['learningStatus'],
      _count: {
        id: true,
      },
    });

    // 获取知识库统计
    const knowledgeStats = await prisma.knowledgeBaseEntry.count({
      where: {
        status: 'active',
      },
    });

    // 获取最近的学习日志
    const recentLogs = await prisma.learningLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // 构建统计数据
    const stats = {
      totalTasks: taskStats.reduce((sum, stat) => sum + stat._count.id, 0),
      tasksByStatus: taskStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      totalVideos: videoStats.reduce((sum, stat) => sum + stat._count.id, 0),
      videosByStatus: videoStats.reduce((acc, stat) => {
        acc[stat.learningStatus] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      totalKnowledge: knowledgeStats,
      autoLearningEnabled: config?.autoLearningEnabled ?? false,
      recentLogs,
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: stats,
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
          message: 'Failed to get learning status',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
