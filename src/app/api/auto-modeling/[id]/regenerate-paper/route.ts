/**
 * 重新生成论文 API
 * POST /api/auto-modeling/[id]/regenerate-paper
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { OverallStatus, PaperFormat, PaperLanguage } from '@prisma/client';
import { generatePaper } from '@/services/paper-generation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 重新生成论文
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[RegeneratePaper] 开始重新生成论文');

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const decoded = await verifyAccessToken(token);
    console.log('[RegeneratePaper] decoded:', decoded);
    console.log('[RegeneratePaper] decoded.userId:', decoded?.userId);
    console.log('[RegeneratePaper] decoded type:', typeof decoded);
    console.log('[RegeneratePaper] decoded === null:', decoded === null);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;

    // 获取请求参数
    const { format, language } = await request.json();

    console.log(`[RegeneratePaper] 任务 ID: ${taskId}`);
    console.log(`[RegeneratePaper] 论文格式: ${format || 'MCM'}`);
    console.log(`[RegeneratePaper] 论文语言: ${language || 'ENGLISH'}`);

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

    console.log(`[RegeneratePaper] 当前状态:`, {
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
    const paperFormat = (format || PaperFormat.MCM) as PaperFormat;
    const paperLanguage = (language || PaperLanguage.CHINESE) as PaperLanguage;

    console.log(`[RegeneratePaper] 开始重新生成论文...`);

    // 删除现有论文
    if (task.paperId) {
      console.log(`[RegeneratePaper] 删除现有论文: ${task.paperId}`);
      await prisma.generatedPaper.delete({
        where: { id: task.paperId },
      }).catch((error) => {
        console.warn(`[RegeneratePaper] 删除论文失败:`, error);
      });
    }

    // 生成新论文
    const paper = await generatePaper(
      taskId,
      task.discussionId,
      discussionSummary,
      codeExecutionResult,
      paperFormat,
      paperLanguage,
      decoded.userId
    );

    console.log(`[RegeneratePaper] 论文生成成功:`, paper.id);

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

    console.log(`[RegeneratePaper] 任务已完成: ${taskId}`);

    return NextResponse.json({
      success: true,
      message: '论文重新生成成功',
      data: {
        taskId: taskId,
        paperId: paper.id,
        title: paper.title,
        format: paper.format,
        language: paper.language,
        wordCount: paper.wordCount,
        status: paper.status,
      },
    });
  } catch (error) {
    console.error('[RegeneratePaper] 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '重新生成论文失败',
      },
      { status: 500 }
    );
  }
}
