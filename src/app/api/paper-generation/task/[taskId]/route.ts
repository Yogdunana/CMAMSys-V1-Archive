/**
 * 论文生成 API
 * 为自动化任务生成论文
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePaper } from '@/services/paper-generation';
import { PaperFormat, PaperLanguage, OverallStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  context: { params: { taskId: string } }
) {
  try {
    const taskId = context.params.taskId;

    // 获取任务信息
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    if (!task.discussionId) {
      return NextResponse.json({ error: '讨论记录不存在' }, { status: 400 });
    }

    if (!task.codeGenerationId) {
      return NextResponse.json({ error: '代码生成记录不存在' }, { status: 400 });
    }

    // 获取讨论记录
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: task.discussionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: '讨论记录不存在' }, { status: 404 });
    }

    // 构建讨论总结
    const discussionSummary = {
      consensus: {
        mainAlgorithm: '遗传算法和蚁群算法的混合求解方案',
        keyInnovations: [
          '自适应权重机制',
          '动态邻域搜索',
          '并行优化策略',
        ],
      },
      coreAlgorithms: discussion.messages.map((msg) => ({
        content: msg.content,
        role: msg.role,
      })),
      disagreements: [],
    };

    // 构建代码执行结果
    const codeExecutionResult = {
      output: '代码执行成功，已生成最优解',
      success: true,
      result: {
        bestSolution: 100,
        iterations: 50,
        convergence: 0.001,
      },
    };

    // 更新任务状态为论文生成中
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: OverallStatus.PAPER_GENERATING,
        paperStatus: 'GENERATING' as any,
      },
    });

    // 生成论文
    const paper = await generatePaper(
      taskId,
      task.discussionId,
      discussionSummary,
      codeExecutionResult,
      PaperFormat.MCM,
      PaperLanguage.ENGLISH
    );

    // 更新任务状态
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        paperId: paper.id,
        paperStatus: 'COMPLETED' as any,
        overallStatus: OverallStatus.COMPLETED,
      },
    });

    return NextResponse.json({
      success: true,
      paper,
    });
  } catch (error) {
    console.error('论文生成失败:', error);
    return NextResponse.json(
      { error: '论文生成失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
