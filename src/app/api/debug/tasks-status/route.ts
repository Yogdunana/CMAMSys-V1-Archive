import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/lib/jwt';

const prisma = new PrismaClient();

/**
 * 查看所有任务状态（调试用）
 * GET /api/debug/tasks-status
 */
export async function GET(request: NextRequest) {
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

    // 查询所有任务
    const tasks = await prisma.autoModelingTask.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        codeGeneration: true,
        validations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    const tasksWithStatus = tasks.map((task) => {
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

      return {
        id: task.id,
        taskId: task.taskId,
        problemTitle: task.problemTitle,
        overallStatus: task.overallStatus,
        discussionStatus: task.discussionStatus,
        validationStatus: task.validationStatus,
        paperStatus: task.paperStatus,
        progress: task.progress,
        hasCodeGeneration: !!task.codeGeneration,
        codeValidationCount: task.validations.length,
        lastValidationStatus: task.validations[0]?.status || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        minutesSinceUpdate: diffMinutes,
        isStuck,
        stuckReason,
        errorLog: task.errorLog,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        total: tasks.length,
        stuckCount: tasksWithStatus.filter((t) => t.isStuck).length,
        tasks: tasksWithStatus,
      },
    });
  } catch (error) {
    console.error('Tasks status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '查询失败',
      },
      { status: 500 }
    );
  }
}
