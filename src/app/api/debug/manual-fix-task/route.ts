import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 手动修复任务状态（不需要认证，用于测试）
 * POST /api/debug/manual-fix-task
 */
export async function POST(request: NextRequest) {
  try {
    const { taskId, fixType } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少 taskId 参数' },
        { status: 400 }
      );
    }

    console.log(`[ManualFixTask] 开始修复任务 ${taskId}，类型: ${fixType}`);

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
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

    console.log(`[ManualFixTask] 当前状态:`, {
      overallStatus: task.overallStatus,
      discussionStatus: task.discussionStatus,
      validationStatus: task.validationStatus,
      codeGenerationId: task.codeGenerationId,
    });

    // 查询所有相关记录
    const codeGenerations = await prisma.codeGeneration.findMany({
      where: { autoTaskId: taskId },
    });

    const validations = await prisma.codeValidation.findMany({
      where: { autoTaskId: taskId },
    });

    console.log(`[ManualFixTask] 记录统计:`, {
      codeGenCount: codeGenerations.length,
      validationCount: validations.length,
    });

    // 执行修复
    if (fixType === 'reset-to-discussion') {
      console.log('[ManualFixTask] 执行 reset-to-discussion');

      // 删除所有代码生成记录
      if (codeGenerations.length > 0) {
        const deleteResult = await prisma.codeGeneration.deleteMany({
          where: { autoTaskId: taskId },
        });
        console.log(`[ManualFixTask] 删除了 ${deleteResult.count} 个代码生成记录`);
      }

      // 删除所有验证记录
      if (validations.length > 0) {
        const deleteResult = await prisma.codeValidation.deleteMany({
          where: { autoTaskId: taskId },
        });
        console.log(`[ManualFixTask] 删除了 ${deleteResult.count} 个验证记录`);
      }

      // 更新任务状态
      const updatedTask = await prisma.autoModelingTask.update({
        where: { id: taskId },
        data: {
          overallStatus: 'DISCUSSING',
          discussionStatus: 'IN_PROGRESS',
          validationStatus: 'SKIPPED',
          paperStatus: 'DRAFT',
          codeGenerationId: null,
          progress: 20,
          errorLog: null,
          updatedAt: new Date(),
        },
      });

      console.log('[ManualFixTask] 修复完成:', {
        newStatus: updatedTask.overallStatus,
        newProgress: updatedTask.progress,
      });

      return NextResponse.json({
        success: true,
        message: '已重置到讨论阶段',
        data: {
          taskId: updatedTask.id,
          overallStatus: updatedTask.overallStatus,
          progress: updatedTask.progress,
          updatedAt: updatedTask.updatedAt,
        },
      });
    }

    if (fixType === 'advance-to-coding') {
      console.log('[ManualFixTask] 执行 advance-to-coding');

      // 检查是否有讨论记录
      if (!task.discussionId) {
        return NextResponse.json(
          { success: false, error: '任务没有讨论记录，无法推进到编码阶段' },
          { status: 400 }
        );
      }

      // 更新任务状态
      const updatedTask = await prisma.autoModelingTask.update({
        where: { id: taskId },
        data: {
          overallStatus: 'CODING',
          discussionStatus: 'COMPLETED',
          validationStatus: 'SKIPPED',
          paperStatus: 'DRAFT',
          codeGenerationId: null,
          progress: 50,
          errorLog: null,
          updatedAt: new Date(),
        },
      });

      console.log('[ManualFixTask] 修复完成:', {
        newStatus: updatedTask.overallStatus,
        newProgress: updatedTask.progress,
      });

      return NextResponse.json({
        success: true,
        message: '已推进到编码阶段，可以开始生成代码',
        data: {
          taskId: updatedTask.id,
          overallStatus: updatedTask.overallStatus,
          progress: updatedTask.progress,
          updatedAt: updatedTask.updatedAt,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: '无效的修复类型' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[ManualFixTask] 修复失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '修复失败',
      },
      { status: 500 }
    );
  }
}
