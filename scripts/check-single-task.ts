/**
 * 检查特定任务
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTask() {
  try {
    const taskId = 'cmlhktmot0000uguh5r4wpvgy';

    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        discussion: true,
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    if (task) {
      console.log('✅ 任务存在');
      console.log(`ID: ${task.id}`);
      console.log(`标题: ${task.problemTitle}`);
      console.log(`状态: ${task.overallStatus}`);
      console.log(`进度: ${task.progress}%`);
      console.log(`讨论ID: ${task.discussionId}`);
      console.log(`代码生成ID: ${task.codeGenerationId}`);
      console.log(`论文ID: ${task.paperId}`);
      console.log(`创建时间: ${task.createdAt}`);
    } else {
      console.log('❌ 任务不存在');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTask();
