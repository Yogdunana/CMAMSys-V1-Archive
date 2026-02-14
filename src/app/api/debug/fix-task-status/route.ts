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

    console.log(`[FixTaskStatus] 开始修复任务 ${taskId}，类型: ${fixType}`);

    // 查询任务（不包含关联，避免查询错误）
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        taskId: true,
        problemTitle: true,
        overallStatus: true,
        discussionStatus: true,
        validationStatus: true,
        paperStatus: true,
        codeGenerationId: true,
        discussionId: true,
        progress: true,
        errorLog: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    // 查询所有相关记录
    const codeGenerations = await prisma.codeGeneration.findMany({
      where: { autoTaskId: taskId },
    });

    const validations = await prisma.codeValidation.findMany({
      where: { autoTaskId: taskId },
    });

    const discussion = task.discussionId
      ? await prisma.groupDiscussion.findUnique({
          where: { id: task.discussionId },
          select: { id: true },
        })
      : null;

    console.log(`[FixTaskStatus] 当前状态:`, {
      overallStatus: task.overallStatus,
      discussionStatus: task.discussionStatus,
      validationStatus: task.validationStatus,
      codeGenerationId: task.codeGenerationId,
      hasDiscussion: !!discussion,
      codeGenCount: codeGenerations.length,
      validationCount: validations.length,
    });

    let updates: any = {
      updatedAt: new Date(),
    };

    let message = '';
    let deletedCodeGens = 0;
    let deletedValidations = 0;

    // 根据修复类型执行不同的修复策略
    switch (fixType) {
      case 'sync-to-actual': {
        // 根据实际记录同步状态
        console.log('[FixTaskStatus] 执行 sync-to-actual 修复');

        if (task.codeGenerationId && codeGenerations.length === 0) {
          updates.codeGenerationId = null;
          message = '清除了无效的 codeGenerationId';
          console.log('[FixTaskStatus] 清除无效的 codeGenerationId');
        }

        if (!task.codeGenerationId && codeGenerations.length > 0) {
          updates.codeGenerationId = codeGenerations[0].id;
          message = '更新了 codeGenerationId';
          console.log('[FixTaskStatus] 更新 codeGenerationId');
        }

        if (task.validationStatus === 'PASSED' && validations.length === 0) {
          updates.validationStatus = 'SKIPPED';
          message += (message ? ', ' : '') + '重置了 validationStatus';
          console.log('[FixTaskStatus] 重置 validationStatus');
        }

        if (task.overallStatus === 'CODING' && codeGenerations.length === 0) {
          updates.overallStatus = 'DISCUSSING';
          updates.progress = 20;
          message += (message ? ', ' : '') + '重置了 overallStatus 到 DISCUSSING';
          console.log('[FixTaskStatus] 重置 overallStatus');
        }

        if (task.discussionStatus === 'COMPLETED' && !discussion) {
          updates.discussionStatus = 'IN_PROGRESS';
          message += (message ? ', ' : '') + '重置了 discussionStatus';
          console.log('[FixTaskStatus] 重置 discussionStatus');
        }

        if (!message) {
          message = '任务状态已同步，无需修复';
        }
        break;
      }

      case 'reset-to-discussion': {
        // 重置到讨论阶段
        console.log('[FixTaskStatus] 执行 reset-to-discussion 修复');

        updates.overallStatus = 'DISCUSSING';
        updates.discussionStatus = 'IN_PROGRESS';
        updates.validationStatus = 'SKIPPED';
        updates.paperStatus = 'DRAFT';
        updates.codeGenerationId = null;
        updates.progress = 20;
        updates.errorLog = null;
        message = '已重置到讨论阶段';

        // 删除所有代码生成记录
        if (codeGenerations.length > 0) {
          const deleteResult = await prisma.codeGeneration.deleteMany({
            where: { autoTaskId: taskId },
          });
          deletedCodeGens = deleteResult.count;
          console.log(`[FixTaskStatus] 删除了 ${deletedCodeGens} 个代码生成记录`);
        }

        // 删除所有验证记录
        if (validations.length > 0) {
          const deleteResult = await prisma.codeValidation.deleteMany({
            where: { autoTaskId: taskId },
          });
          deletedValidations = deleteResult.count;
          console.log(`[FixTaskStatus] 删除了 ${deletedValidations} 个验证记录`);
        }

        break;
      }

      case 'reset-to-coding': {
        // 重置到编码阶段
        console.log('[FixTaskStatus] 执行 reset-to-coding 修复');

        if (!discussion) {
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
        updates.validationStatus = 'SKIPPED';
        updates.paperStatus = 'DRAFT';
        updates.codeGenerationId = null;
        updates.progress = 50;
        updates.errorLog = null;
        message = '已重置到编码阶段，请手动重新生成代码';

        // 删除所有代码生成记录
        if (codeGenerations.length > 0) {
          const deleteResult = await prisma.codeGeneration.deleteMany({
            where: { autoTaskId: taskId },
          });
          deletedCodeGens = deleteResult.count;
          console.log(`[FixTaskStatus] 删除了 ${deletedCodeGens} 个代码生成记录`);
        }

        // 删除所有验证记录
        if (validations.length > 0) {
          const deleteResult = await prisma.codeValidation.deleteMany({
            where: { autoTaskId: taskId },
          });
          deletedValidations = deleteResult.count;
          console.log(`[FixTaskStatus] 删除了 ${deletedValidations} 个验证记录`);
        }

        break;
      }

      case 'reset-to-validation': {
        // 重置到验证阶段
        console.log('[FixTaskStatus] 执行 reset-to-validation 修复');

        if (codeGenerations.length === 0) {
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

        // 删除所有验证记录
        if (validations.length > 0) {
          const deleteResult = await prisma.codeValidation.deleteMany({
            where: { autoTaskId: taskId },
          });
          deletedValidations = deleteResult.count;
          console.log(`[FixTaskStatus] 删除了 ${deletedValidations} 个验证记录`);
        }

        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: '无效的修复类型' },
          { status: 400 }
        );
    }

    // 更新任务
    console.log('[FixTaskStatus] 更新任务状态:', updates);
    const updatedTask = await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: updates,
    });

    console.log('[FixTaskStatus] 修复完成:', {
      message,
      deletedCodeGens,
      deletedValidations,
      newStatus: updatedTask.overallStatus,
      newProgress: updatedTask.progress,
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
        deletedCodeGens,
        deletedValidations,
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
