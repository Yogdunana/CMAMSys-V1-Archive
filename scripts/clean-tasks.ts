/**
 * 清理历史任务
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTasks() {
  try {
    // 查询所有任务
    const allTasks = await prisma.autoModelingTask.findMany({
      orderBy: { createdAt: 'desc' },
    });

    console.log(`总共有 ${allTasks.length} 个任务:`);

    for (const task of allTasks) {
      console.log(`\n任务 ${task.id}:`);
      console.log(`  标题: ${task.problemTitle}`);
      console.log(`  状态: ${task.overallStatus}`);
      console.log(`  进度: ${task.progress}%`);
      console.log(`  创建时间: ${task.createdAt.toISOString()}`);

      // 检查是否有关联数据
      const hasDiscussion = task.discussionId !== null;
      const hasCode = task.codeGenerationId !== null;
      const hasPaper = task.paperId !== null;

      console.log(`  关联数据: 讨论=${hasDiscussion}, 代码=${hasCode}, 论文=${hasPaper}`);

      // 如果状态是 PENDING 且没有关联数据，可以考虑删除
      if (task.overallStatus === 'PENDING' && !hasDiscussion && !hasCode && !hasPaper) {
        console.log(`  ⚠️  建议删除：没有关联数据的状态任务`);
      }
    }

    // 删除指定的任务
    const taskToDelete = 'cmlhkso4d0000cf20hil05nfg';

    const existingTask = await prisma.autoModelingTask.findUnique({
      where: { id: taskToDelete },
    });

    if (existingTask) {
      console.log(`\n\n准备删除任务 ${taskToDelete}...`);
      await prisma.autoModelingTask.delete({
        where: { id: taskToDelete },
      });
      console.log(`✅ 任务 ${taskToDelete} 已删除`);
    } else {
      console.log(`\n\n任务 ${taskToDelete} 不存在`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTasks();
