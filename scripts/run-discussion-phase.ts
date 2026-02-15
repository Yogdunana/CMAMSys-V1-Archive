import { PrismaClient } from '@prisma/client';
import { OverallStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * 简化的自动化流程执行器
 * 只执行讨论阶段，确保讨论能够正常完成
 */
async function executeDiscussionPhase(taskId: string) {
  try {
    console.log(`🚀 [Task ${taskId}] 开始执行讨论阶段...`);

    // 获取任务信息
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        discussion: true,
      },
    });

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    console.log(`📋 Task Info:`);
    console.log(`   Title: ${task.problemTitle}`);
    console.log(`   Competition: ${task.competitionType}`);
    console.log(`   Problem: ${task.problemType}`);
    console.log(`   Status: ${task.overallStatus}`);
    console.log('');

    // 如果讨论已经存在，跳过
    if (task.discussion) {
      console.log(`✅ 讨论已存在: ${task.discussion.id}`);
      console.log(`   Status: ${task.discussion.status}`);
      console.log(`   Messages: ${(await prisma.discussionMessage.count({ where: { discussionId: task.discussion.id } }))}`);

      // 检查讨论是否完成
      if (task.discussion.status === 'COMPLETED') {
        console.log('✅ 讨论已完成，准备进入代码生成阶段');
        await proceedToNextPhase(taskId);
        return;
      }

      // 如果讨论没有完成，继续执行
      console.log('⚠️  讨论未完成，继续执行...');
    }

    // 更新任务状态为 DISCUSSING
    console.log('🔄 更新任务状态为 DISCUSSING...');
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: OverallStatus.DISCUSSING,
        progress: 10,
      },
    });
    console.log('✅ 状态更新完成');
    console.log('');

    // 执行讨论（调用现有的服务）
    console.log('💬 开始执行讨论...');
    const { executeFullDiscussion } = await import('../src/services/group-discussion');

    const discussionResult = await executeFullDiscussion(
      task.competitionType,
      task.problemType,
      task.problemTitle,
      task.problemContent,
      'cmlnm975p0000zd7uzz52t193', // 使用当前用户 ID
      task.id
    );

    console.log('✅ 讨论执行完成');
    console.log(`   Discussion ID: ${discussionResult.discussion.id}`);
    console.log(`   Message Count: ${discussionResult.messages.length}`);
    console.log(`   Summary: ${JSON.stringify(discussionResult.summary).substring(0, 200)}...`);
    console.log('');

    // 更新任务状态
    console.log('🔄 更新任务状态...');
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        discussionId: discussionResult.discussion.id,
        discussionStatus: 'COMPLETED',
        progress: 25,
      },
    });
    console.log('✅ 任务状态更新完成');
    console.log('');

    // 记录讨论结果到文件
    const logDir = path.join(process.cwd(), 'logs', 'discussions');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, `${taskId}.json`);
    fs.writeFileSync(
      logFile,
      JSON.stringify({
        taskId,
        discussionId: discussionResult.discussion.id,
        messages: discussionResult.messages,
        summary: discussionResult.summary,
        timestamp: new Date().toISOString(),
      }, null, 2)
    );
    console.log(`📝 讨论记录已保存到: ${logFile}`);
    console.log('');

    console.log('✅ 讨论阶段完成！');
    console.log('🔄 准备进入代码生成阶段...');

    // 进入下一个阶段
    await proceedToNextPhase(taskId);

  } catch (error) {
    console.error('❌ 讨论阶段执行失败:', error);

    // 记录错误到数据库
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

/**
 * 进入下一个阶段（代码生成）
 */
async function proceedToNextPhase(taskId: string) {
  console.log('🔄 进入代码生成阶段...');

  await prisma.autoModelingTask.update({
    where: { id: taskId },
    data: {
      overallStatus: OverallStatus.CODING,
      progress: 30,
    },
  });

  console.log('✅ 任务状态已更新为 CODING');
  console.log('');
  console.log('💡 提示：代码生成需要手动触发或等待后台处理器');
  console.log('💡 当前任务已经准备好进行代码生成');
}

// 执行讨论阶段
const taskId = 'cmlnxdhu5000pvf0fa8yrdmbn';
executeDiscussionPhase(taskId)
  .then(() => {
    console.log('✅ 讨论阶段成功完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 讨论阶段失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
