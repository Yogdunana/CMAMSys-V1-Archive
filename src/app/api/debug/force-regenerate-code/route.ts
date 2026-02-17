import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/lib/jwt';

const prisma = new PrismaClient();

/**
 * 强制删除代码生成记录并重新生成
 * POST /api/debug/force-regenerate-code
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

    // 使用事务删除旧代码并重置状态
    const result = await prisma.$transaction(async (tx) => {
      // 删除代码生成记录
      await tx.codeGeneration.deleteMany({
        where: { autoTaskId: taskId },
      });

      // 删除代码验证记录
      await tx.codeValidation.deleteMany({
        where: { autoTaskId: taskId },
      });

      // 重置任务状态
      const task = await tx.autoModelingTask.update({
        where: { id: taskId },
        data: {
          overallStatus: 'CODING',
          discussionStatus: 'COMPLETED',
          validationStatus: 'PENDING',
          paperStatus: 'DRAFT',
          codeGenerationId: null,
          progress: 50,
          errorLog: null,
          updatedAt: new Date(),
        },
      });

      return task;
    });

    return NextResponse.json({
      success: true,
      message: '已删除旧代码并重置任务状态，请手动重新生成代码',
      data: {
        taskId: result.id,
        status: result.overallStatus,
        progress: result.progress,
      },
    });
  } catch (error) {
    console.error('[ForceRegenerateCode] 强制重新生成代码失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '操作失败',
      },
      { status: 500 }
    );
  }
}
