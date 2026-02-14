import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 跳过代码验证，直接进入论文生成阶段
 * POST /api/debug/skip-validation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[SkipValidation] 开始跳过验证');

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

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

    console.log(`[SkipValidation] 任务 ID: ${taskId}`);

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        overallStatus: true,
        codeGenerationId: true,
        progress: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    if (!task.codeGenerationId) {
      return NextResponse.json(
        { success: false, error: '任务没有代码生成记录，无法跳过验证' },
        { status: 400 }
      );
    }

    console.log(`[SkipValidation] 当前状态:`, {
      overallStatus: task.overallStatus,
      progress: task.progress,
      codeGenerationId: task.codeGenerationId,
    });

    // 更新代码生成状态为 SUCCESS
    await prisma.codeGeneration.update({
      where: { id: task.codeGenerationId },
      data: {
        executionStatus: 'SUCCESS',
      },
    });

    // 更新任务状态，直接进入论文生成阶段
    const updatedTask = await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: 'VALIDATING',
        validationStatus: 'SKIPPED',
        paperStatus: 'DRAFT',
        progress: 70,
        updatedAt: new Date(),
      },
    });

    console.log(`[SkipValidation] 任务已更新为论文生成阶段:`, {
      overallStatus: updatedTask.overallStatus,
      progress: updatedTask.progress,
    });

    return NextResponse.json({
      success: true,
      message: '已跳过代码验证，进入论文生成阶段',
      data: {
        taskId: updatedTask.id,
        overallStatus: updatedTask.overallStatus,
        progress: updatedTask.progress,
      },
    });
  } catch (error) {
    console.error('[SkipValidation] 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '跳过验证失败',
      },
      { status: 500 }
    );
  }
}
