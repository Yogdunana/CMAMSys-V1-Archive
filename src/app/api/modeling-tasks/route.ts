/**
 * Modeling Tasks API
 * GET /api/modeling-tasks - 获取建模任务列表
 * POST /api/modeling-tasks - 创建建模任务
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * GET: 获取建模任务列表
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
    }

    // 获取所有建模任务
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
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: tasks.map((task) => ({
          ...task,
          competitionName: task.competition?.name,
        })),
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
 */
export async function POST(request: NextRequest) {
  try {
    // 验证认证（开发模式下跳过）
    const isDev = process.env.NODE_ENV === 'development';

    let userId = '';

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

      userId = payload.userId;
    } else {
      // 开发模式下使用管理员 ID
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      userId = admin?.id || '';
    }

    const body = await request.json();
    const { name, description, problemType, competitionId, algorithm, approachNumber } = body;

    if (!name) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name is required',
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
        dataFilePath: `/data/${name.toLowerCase().replace(/\s+/g, '_')}/data.csv`,
        problemFilePath: `/data/${name.toLowerCase().replace(/\s+/g, '_')}/problem.pdf`,
        createdById: userId,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: task,
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
          message: 'Failed to create modeling task',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
