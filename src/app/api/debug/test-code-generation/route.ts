import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 测试代码生成流程
 * POST /api/debug/test-code-generation
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

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少 taskId 参数' },
        { status: 400 }
      );
    }

    // 查询任务状态
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    // 检查代码生成状态
    const codeGenStatus = {
      hasCodeGeneration: !!task.codeGeneration,
      codeGenerationId: task.codeGeneration?.id,
      taskStatus: task.overallStatus,
      progress: task.progress,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      stuckCheck: {
        isStuck: false,
        reason: null as string | null,
      },
    };

    // 检查是否卡住
    const now = new Date();
    const lastUpdate = new Date(task.updatedAt);
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 60000;

    if (
      (task.overallStatus === 'CODING' || task.overallStatus === 'DISCUSSING') &&
      diffMinutes > 5
    ) {
      codeGenStatus.stuckCheck.isStuck = true;
      codeGenStatus.stuckCheck.reason = `任务已 ${diffMinutes.toFixed(1)} 分钟未更新`;
    }

    if (
      task.overallStatus === 'CODING' &&
      !task.codeGeneration &&
      diffMinutes > 2
    ) {
      codeGenStatus.stuckCheck.isStuck = true;
      codeGenStatus.stuckCheck.reason = `代码生成状态已超过 2 分钟未创建代码记录`;
    }

    return NextResponse.json({
      success: true,
      data: codeGenStatus,
    });
  } catch (error) {
    console.error('Test code generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '测试失败',
      },
      { status: 500 }
    );
  }
}
