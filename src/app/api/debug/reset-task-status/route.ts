import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/lib/jwt';

const prisma = new PrismaClient();

/**
 * 强制重置任务状态（用于任务卡住时）
 * POST /api/debug/reset-task-status
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    const { taskId, newStatus } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少 taskId 参数' },
        { status: 400 }
      );
    }

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
        discussion: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    let updates: any = {
      updatedAt: new Date(),
    };

    // 根据新状态更新任务
    switch (newStatus) {
      case 'READY':
        updates.overallStatus = 'READY';
        updates.discussionStatus = 'NOT_STARTED';
        updates.validationStatus = 'NOT_STARTED';
        updates.paperStatus = 'NOT_STARTED';
        updates.progress = 0;
        updates.errorLog = null;
        break;

      case 'DISCUSSING':
        updates.overallStatus = 'DISCUSSING';
        updates.discussionStatus = 'IN_PROGRESS';
        updates.progress = 20;
        updates.errorLog = null;
        break;

      case 'CODING':
        updates.overallStatus = 'CODING';
        updates.discussionStatus = 'COMPLETED';
        updates.progress = 50;
        updates.errorLog = null;
        break;

      case 'VALIDATING':
        updates.overallStatus = 'CODING';
        updates.validationStatus = 'PENDING';
        updates.progress = 70;
        updates.errorLog = null;
        break;

      case 'PAPER':
        updates.overallStatus = 'PAPER';
        updates.discussionStatus = 'COMPLETED';
        updates.validationStatus = 'PASSED';
        updates.paperStatus = 'GENERATING';
        updates.progress = 80;
        updates.errorLog = null;
        break;

      case 'COMPLETED':
        updates.overallStatus = 'COMPLETED';
        updates.discussionStatus = 'COMPLETED';
        updates.validationStatus = 'PASSED';
        updates.paperStatus = 'COMPLETED';
        updates.progress = 100;
        updates.errorLog = null;
        break;

      case 'FAILED':
        updates.overallStatus = 'FAILED';
        updates.errorLog = '用户手动标记为失败';
        break;

      default:
        return NextResponse.json(
          { success: false, error: '无效的状态值' },
          { status: 400 }
        );
    }

    // 更新任务
    const updatedTask = await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: `任务状态已重置为 ${newStatus}`,
      data: {
        id: updatedTask.id,
        overallStatus: updatedTask.overallStatus,
        progress: updatedTask.progress,
        updatedAt: updatedTask.updatedAt,
      },
    });
  } catch (error) {
    console.error('[ResetTaskStatus] 重置任务状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '重置失败',
      },
      { status: 500 }
    );
  }
}
