/**
 * 生成论文 API
 * POST /api/auto-modeling/[id]/generate-paper
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { OverallStatus, PaperFormat, PaperLanguage } from '@prisma/client';
import { generatePaper } from '@/services/paper-generation';
import { selectOptimalProvider } from '@/services/auto-provider-selector';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 生成论文
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GeneratePaper] 开始生成论文');

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

    const { id: taskId } = await params;

    console.log(`[GeneratePaper] 任务 ID: ${taskId}`);

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        discussion: true,
        codeGeneration: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    if (!task.discussionId) {
      return NextResponse.json(
        { success: false, error: '任务没有讨论记录，无法生成论文' },
        { status: 400 }
      );
    }

    if (!task.codeGenerationId) {
      return NextResponse.json(
        { success: false, error: '任务没有代码生成记录，无法生成论文' },
        { status: 400 }
      );
    }

    console.log(`[GeneratePaper] 当前状态:`, {
      overallStatus: task.overallStatus,
      discussionStatus: task.discussionStatus,
      validationStatus: task.validationStatus,
      paperStatus: task.paperStatus,
      progress: task.progress,
    });

    // 获取讨论总结
    const discussionSummary = task.discussion?.summary || {};

    // 获取代码执行结果
    const codeExecutionResult = {
      output: task.codeGeneration?.executionOutput || '代码执行成功',
      success: task.codeGeneration?.executionStatus === 'SUCCESS',
      executionTime: task.codeGeneration?.executionTimeMs || 0,
    };

    // 确定论文格式和语言
    const paperFormat = PaperFormat.MCM; // 默认为美赛格式
    const paperLanguage = PaperLanguage.CHINESE; // 默认为中文

    console.log(`[GeneratePaper] 开始生成论文...`);

    // 检查是否已有论文记录
    const existingPaper = await prisma.generatedPaper.findUnique({
      where: { autoTaskId: taskId },
    });

    if (existingPaper) {
      console.log(`[GeneratePaper] 论文已存在: ${existingPaper.id}`);

      // 更新任务状态为完成
      await prisma.autoModelingTask.update({
        where: { id: taskId },
        data: {
          paperStatus: 'COMPLETED',
          overallStatus: OverallStatus.COMPLETED,
          progress: 100,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: '论文已完成',
        data: {
          taskId: taskId,
          paperId: existingPaper.id,
          paperStatus: 'COMPLETED',
        },
      });
    }

    // 异步生成论文
    setImmediate(async () => {
      try {
        console.log(`[GeneratePaper] 异步生成论文中...`);

        const paper = await generatePaper(
          taskId,
          task.discussionId,
          discussionSummary,
          codeExecutionResult,
          paperFormat,
          paperLanguage,
          decoded.userId
        );

        console.log(`[GeneratePaper] 论文生成成功:`, paper.id);

        // 更新任务状态
        await prisma.autoModelingTask.update({
          where: { id: taskId },
          data: {
            paperId: paper.id,
            paperStatus: 'COMPLETED',
            overallStatus: OverallStatus.COMPLETED,
            progress: 100,
            updatedAt: new Date(),
          },
        });

        console.log(`[GeneratePaper] 任务已完成: ${taskId}`);
      } catch (error) {
        console.error('[GeneratePaper] 论文生成失败:', error);

        // 更新任务状态为失败
        await prisma.autoModelingTask.update({
          where: { id: taskId },
          data: {
            paperStatus: 'FAILED',
            overallStatus: OverallStatus.FAILED,
            errorLog: error instanceof Error ? error.message : '论文生成失败',
            updatedAt: new Date(),
          },
        });
      }
    });

    // 立即返回响应
    return NextResponse.json({
      success: true,
      message: '论文生成已启动，请稍后查看结果',
      data: {
        taskId: taskId,
        currentStatus: task.overallStatus,
        paperFormat,
        paperLanguage,
      },
    });
  } catch (error) {
    console.error('[GeneratePaper] 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成论文失败',
      },
      { status: 500 }
    );
  }
}
