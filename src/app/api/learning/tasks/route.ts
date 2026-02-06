/**
 * Video Learning Tasks API
 * GET /api/learning/tasks - 获取学习任务列表
 * POST /api/learning/tasks - 创建学习任务
 * POST /api/learning/tasks/pause - 暂停学习
 * POST /api/learning/tasks/resume - 恢复学习
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/types';

// Validation schema
const createTaskSchema = z.object({
  bvid: z.string(),
  taskType: z.enum(['auto', 'manual', 'on_demand']).optional(),
  taskSource: z.string().optional(),
});

const pauseLearningSchema = z.object({
  reason: z.string().optional(),
});

const resumeLearningSchema = z.object({
  maxTasks: z.number().int().min(1).max(10).optional(),
});

/**
 * GET: 获取学习任务列表
 */
export async function GET(request: NextRequest) {
  try {
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const taskType = searchParams.get('taskType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 构建查询条件
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (taskType) {
      where.taskType = taskType;
    }

    // 查询任务
    const tasks = await prisma.videoLearningTask.findMany({
      where,
      include: {
        video: {
          select: {
            bvid: true,
            title: true,
            author: true,
            duration: true,
            viewCount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 获取总数
    const total = await prisma.videoLearningTask.count({ where });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          tasks,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
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
          message: 'Failed to fetch learning tasks',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST: 创建学习任务
 */
export async function POST(request: NextRequest) {
  try {
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

    // 解析和验证请求体
    const body = await request.json();
    const validationResult = createTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid task data',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { bvid, taskType = 'manual', taskSource = 'manual_add' } = validationResult.data;

    // 检查视频是否存在
    let video = await prisma.bilibiliVideo.findUnique({
      where: { bvid },
    });

    if (!video) {
      // 创建视频记录（需要从 B 站获取视频信息，这里暂时创建空记录）
      video = await prisma.bilibiliVideo.create({
        data: {
          bvid,
          title: '待获取',
          author: '待获取',
          duration: 0,
          learningStatus: 'pending',
        },
      });
    }

    // 创建学习任务
    const task = await prisma.videoLearningTask.create({
      data: {
        videoId: video.id,
        taskType,
        taskSource,
        status: 'pending',
      },
      include: {
        video: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: task,
        message: 'Learning task created successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create learning task',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
