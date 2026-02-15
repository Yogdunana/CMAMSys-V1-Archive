import { PrismaClient } from '@prisma/client';
import { OverallStatus, CodeLanguage } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 继续执行自动化流程的剩余步骤
 */
async function continueAutoProcess(taskId: string, userId: string) {
  try {
    console.log(`🚀 [Task ${taskId}] 继续执行自动化流程...\n`);

    // 获取任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        discussion: true,
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    console.log('📋 Current Task Status:');
    console.log(`   Overall Status: ${task.overallStatus}`);
    console.log(`   Progress: ${task.progress}%`);
    console.log(`   Discussion ID: ${task.discussionId}`);
    console.log(`   Code Generation ID: ${task.codeGenerationId}`);
    console.log('');

    // 导入服务
    const { generateCode, executeCode } = await import('../src/services/code-generation');
    const { executeFullValidation } = await import('../src/services/auto-validation');
    const { generatePaper } = await import('../src/services/paper-generation');

    // 1. 代码生成阶段
    if (!task.codeGenerationId && task.discussionId) {
      console.log('🔄 开始代码生成阶段...');

      await prisma.autoModelingTask.update({
        where: { id: taskId },
        data: {
          overallStatus: OverallStatus.CODING,
          progress: 30,
        },
      });

      // 获取讨论总结
      const discussion = task.discussion || await prisma.groupDiscussion.findUnique({
        where: { id: task.discussionId! },
      });

      if (!discussion) {
        throw new Error('Discussion not found');
      }

      const summary = discussion.summary || {
        consensus: {
          mainAlgorithm: 'Not specified',
          keyInnovations: 'Not specified',
        },
      };

      // 生成代码
      const codeGeneration = await generateCode(
        taskId,
        discussion.id,
        summary,
        CodeLanguage.PYTHON,
        userId
      );

      console.log('✅ 代码生成完成');
      console.log(`   Code ID: ${codeGeneration.id}`);
      console.log(`   Code Length: ${codeGeneration.codeContent.length} chars`);
      console.log('');

      // 更新任务
      await prisma.autoModelingTask.update({
        where: { id: taskId },
        data: {
          codeGenerationId: codeGeneration.id,
          progress: 40,
        },
      });

      // 执行代码
      console.log('🔄 执行代码...');
      const executionResult = await executeCode(codeGeneration.id);
      console.log(`✅ 代码执行完成，状态: ${executionResult.executionStatus}`);
      console.log('');

      // 更新任务
      await prisma.autoModelingTask.update({
        where: { id: taskId },
        data: {
          progress: 50,
        },
      });

      // 更新任务对象
      task.codeGenerationId = codeGeneration.id;
    }

    // 2. 代码校验阶段
    console.log('🔄 开始代码校验阶段...');

    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: OverallStatus.VALIDATING,
        progress: 60,
      },
    });

    const validationResults = await executeFullValidation(
      taskId,
      task.codeGenerationId!,
      task.discussion?.summary || {
        consensus: {
          mainAlgorithm: 'Not specified',
          keyInnovations: 'Not specified',
        },
      }
    );

    console.log('✅ 代码校验完成');
    console.log(`   Basic: ${validationResults.basic?.status}`);
    console.log(`   Result: ${validationResults.result?.status}`);
    console.log(`   Visualization: ${validationResults.visualization?.status}`);
    console.log('');

    // 3. 论文生成阶段
    console.log('🔄 开始论文生成阶段...');

    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: OverallStatus.PAPER_GENERATING,
        progress: 80,
      },
    });

    const paper = await generatePaper(
      taskId,
      task.discussionId!,
      task.discussion?.summary || {
        consensus: {
          mainAlgorithm: 'Not specified',
          keyInnovations: 'Not specified',
        },
      },
      null, // executionResult - 暂时传 null
      'MCM' as any,
      'ENGLISH' as any,
      userId
    );

    console.log('✅ 论文生成完成');
    console.log(`   Paper ID: ${paper.id}`);
    console.log(`   Paper Title: ${paper.paperTitle}`);
    console.log('');

    // 4. 完成任务
    console.log('🎉 完成任务...');

    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: OverallStatus.COMPLETED,
        progress: 100,
        paperId: paper.id,
        paperStatus: 'COMPLETED',
      },
    });

    console.log('✅ 自动化流程全部完成！');
    console.log('');
    console.log('📊 Final Status:');
    console.log(`   Task ID: ${taskId}`);
    console.log(`   Overall Status: COMPLETED`);
    console.log(`   Progress: 100%`);
    console.log(`   Discussion ID: ${task.discussionId}`);
    console.log(`   Code Generation ID: ${task.codeGenerationId}`);
    console.log(`   Paper ID: ${paper.id}`);

  } catch (error) {
    console.error('❌ 继续执行自动化流程失败:', error);

    // 记录错误
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: OverallStatus.FAILED,
        errorLog: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// 执行
const taskId = 'cmlnxdhu5000pvf0fa8yrdmbn';
const userId = 'cmlnm975p0000zd7uzz52t193';

continueAutoProcess(taskId, userId)
  .then(() => {
    console.log('✅ 自动化流程继续执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 自动化流程继续执行失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
