/**
 * Modeling Task Start API
 * POST /api/modeling-tasks/[id]/start - 启动任务
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * POST: 启动任务
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    // 验证任务是否存在
    const task = await prisma.modelingTask.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
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

    // 检查任务状态
    if (['PREPROCESSING', 'MODELING', 'EVALUATING', 'REPORTING'].includes(task.status)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: 'Task is already running',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 更新任务状态
    const updatedTask = await prisma.modelingTask.update({
      where: { id: params.id },
      data: {
        status: 'PREPROCESSING',
        startedAt: new Date(),
        progress: 0,
        errorMessage: null,
      },
    });

    // TODO: 这里应该触发后台任务执行器
    // 例如: taskExecutor.startTask(params.id)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedTask,
        message: 'Task started successfully',
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
          message: 'Failed to start task',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
