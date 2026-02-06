/**
 * Modeling Task Pause API
 * POST /api/modeling-tasks/[id]/pause - 暂停任务
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * POST: 暂停任务
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
    if (
!['PREPROCESSING', 'MODELING', 'EVALUATING', 'REPORTING'].includes(task.status)
) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: 'Task is not running',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 更新任务状态为 PENDING
    const updatedTask = await prisma.modelingTask.update({
      where: { id: params.id },
      data: {
        status: 'PENDING',
      },
    });

    // TODO: 这里应该通知任务执行器暂停
    // 例如: taskExecutor.pauseTask(params.id)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedTask,
        message: 'Task paused successfully',
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
          message: 'Failed to pause task',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
