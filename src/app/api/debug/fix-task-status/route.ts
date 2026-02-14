import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/lib/jwt';

const prisma = new PrismaClient();

/**
 * 修复任务状态（用于状态不一致的情况）
 * POST /api/debug/fix-task-status
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

    const { taskId, fixType } = await request.json();

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
        validations: true,
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

    let message = '';

    // 根据修复类型执行不同的修复策略
    switch (fixType) {
      case 'sync-to-actual': {
        // 根据实际记录同步状态
        if (!task.codeGeneration && task.codeGenerationId) {
          updates.codeGenerationId = null;
          message = '清除了无效的 codeGenerationId';
        }

        if (task.codeGeneration && !task.codeGenerationId) {
          updates.codeGenerationId = task.codeGeneration.id;
          message = '更新了 codeGenerationId';
        }

        if (task.validations.length === 0 && task.validationStatus === 'PASSED') {
          updates.validationStatus = 'NOT_STARTED';
          message += ', 重置了 validationStatus';
        }

        if (!task.codeGeneration && task.overallStatus === 'CODING') {
          updates.overallStatus = 'DISCUSSING';
          updates.progress = 40;
          message += ', 重置了 overallStatus 到 DISCUSSING';
        }

        if (!task.discussion && task.discussionStatus === 'COMPLETED') {
          updates.discussionStatus = 'NOT_STARTED';
          message += ', 重置了 discussionStatus';
        }

        if (!message) {
          message = '任务状态已同步，无需修复';
        }
        break;
      }

      case 'reset-to-discussion': {
        // 重置到讨论阶段
        updates.overallStatus = 'DISCUSSING';
        updates.discussionStatus = 'IN_PROGRESS';
        updates.validationStatus = 'NOT_STARTED';
        updates.paperStatus = 'NOT_STARTED';
        updates.codeGenerationId = null;
        updates.progress = 20;
        updates.errorLog = null;
        message = '已重置到讨论阶段';

        // 删除代码生成记录
        if (task.codeGenerationId) {
          await prisma.codeGeneration.delete({
            where: { id: task.codeGenerationId },
          });
        }
        break;
      }

      case 'reset-to-coding': {
        // 重置到编码阶段
        if (!task.discussion) {
          return NextResponse.json(
            {
              success: false,
              error: '任务没有讨论记录，无法重置到编码阶段',
            },
            { status: 400 }
          );
        }

        updates.overallStatus = 'CODING';
        updates.discussionStatus = 'COMPLETED';
        updates.validationStatus = 'NOT_STARTED';
        updates.paperStatus = 'NOT_STARTED';
        updates.progress = 50;
        updates.errorLog = null;
        message = '已重置到编码阶段，请手动重新生成代码';

        // 删除代码生成和验证记录
        await prisma.$transaction([
          prisma.codeGeneration.deleteMany({
            where: { autoTaskId: taskId },
          }),
          prisma.codeValidation.deleteMany({
            where: { autoTaskId: taskId },
          }),
        ]);
        break;
      }

      case 'reset-to-validation': {
        // 重置到验证阶段
        if (!task.codeGeneration) {
          return NextResponse.json(
            {
              success: false,
              error: '任务没有代码生成记录，无法重置到验证阶段',
            },
            { status: 400 }
          );
        }

        updates.overallStatus = 'CODING';
        updates.discussionStatus = 'COMPLETED';
        updates.validationStatus = 'PENDING';
        updates.progress = 70;
        updates.errorLog = null;
        message = '已重置到验证阶段';

        // 删除验证记录
        await prisma.codeValidation.deleteMany({
          where: { autoTaskId: taskId },
        });
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: '无效的修复类型' },
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
      message: message || '任务状态已修复',
      data: {
        taskId: updatedTask.id,
        overallStatus: updatedTask.overallStatus,
        discussionStatus: updatedTask.discussionStatus,
        validationStatus: updatedTask.validationStatus,
        codeGenerationId: updatedTask.codeGenerationId,
        progress: updatedTask.progress,
        updatedAt: updatedTask.updatedAt,
      },
    });
  } catch (error) {
    console.error('[FixTaskStatus] 修复任务状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '修复失败',
      },
      { status: 500 }
    );
  }
}
