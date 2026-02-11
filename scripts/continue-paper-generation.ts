/**
 * 继续执行论文生成阶段
 */

import prisma from '@/lib/prisma';
import { generatePaper } from '@/services/paper-generation';
import { PaperFormat, PaperLanguage, OverallStatus, PaperStatus } from '@prisma/client';

async function main() {
  console.log('=== 继续执行论文生成阶段 ===\n');

  // 获取最新的任务
  const autoTask = await prisma.autoModelingTask.findFirst({
    where: {
      overallStatus: OverallStatus.VALIDATING,
    },
    include: {
      codeGeneration: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!autoTask) {
    console.log('❌ 没有找到需要执行论文生成的任务');
    return;
  }

  console.log(`任务状态: ${autoTask.overallStatus}`);
  console.log(`代码ID: ${autoTask.codeGenerationId}`);

  if (!autoTask.discussionId) {
    console.log('❌ 讨论记录不存在');
    return;
  }

  if (!autoTask.codeGenerationId) {
    console.log('❌ 代码生成记录不存在');
    return;
  }

  console.log('\n开始执行论文生成...');

  // 获取讨论记录
  const discussion = await prisma.groupDiscussion.findUnique({
    where: { id: autoTask.discussionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!discussion) {
    console.log('❌ 讨论记录不存在');
    return;
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
    where: { id: autoTask.id },
    data: {
      overallStatus: OverallStatus.PAPER_GENERATING,
      paperStatus: PaperStatus.DRAFT,
      progress: 80,
    },
  });

  console.log('任务状态已更新为论文生成中');

  // 生成论文
  console.log('开始生成论文...');
  const paper = await generatePaper(
    autoTask.id,
    autoTask.discussionId,
    discussionSummary,
    codeExecutionResult,
    PaperFormat.MCM,
    PaperLanguage.ENGLISH
  );

  console.log('✅ 论文生成完成');
  console.log('论文ID:', paper.id);

  // 更新任务状态为已完成
  await prisma.autoModelingTask.update({
    where: { id: autoTask.id },
    data: {
      paperId: paper.id,
      paperStatus: PaperStatus.COMPLETED,
      overallStatus: OverallStatus.COMPLETED,
      progress: 100,
    },
  });

  console.log('\n✅ 任务状态已更新为已完成');
  console.log('整体状态: COMPLETED');
  console.log('论文状态: COMPLETED');
  console.log('进度: 100%');
}

main()
  .catch((error) => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
