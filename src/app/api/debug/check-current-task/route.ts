import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 检查当前任务状态（不需要认证，用于调试）
 * GET /api/debug/check-current-task
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

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
        validations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    const now = new Date();
    const lastUpdate = task.updatedAt;
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 60000;

    let isStuck = false;
    let stuckReason: string | null = null;

    // 检查是否卡住
    if (
      (task.overallStatus === 'CODING' || task.overallStatus === 'DISCUSSING') &&
      diffMinutes > 10
    ) {
      isStuck = true;
      stuckReason = `任务已 ${diffMinutes.toFixed(1)} 分钟未更新`;
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        taskTitle: task.problemTitle,
        overallStatus: task.overallStatus,
        discussionStatus: task.discussionStatus,
        validationStatus: task.validationStatus,
        paperStatus: task.paperStatus,
        progress: task.progress,
        hasCodeGeneration: !!task.codeGeneration,
        hasValidation: task.validations.length > 0,
        lastValidationStatus: task.validations[0]?.status || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        minutesSinceUpdate: diffMinutes,
        isStuck,
        stuckReason,
        errorLog: task.errorLog,
      },
    });
  } catch (error) {
    console.error('[CheckCurrentTask] 检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '检查失败',
      },
      { status: 500 }
    );
  }
}
