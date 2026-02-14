/**
 * 查询任务详情
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTasks() {
  try {
    const task1 = await prisma.autoModelingTask.findUnique({
      where: { id: 'cmlmg9cq00001hqry34db2zmy' },
      include: {
        discussion: true,
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    const task2 = await prisma.autoModelingTask.findUnique({
      where: { id: 'cmlhkso4d0000cf20hil05nfg' },
      include: {
        discussion: true,
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    console.log('Task 1 (cmlmg9cq00001hqry34db2zmy):');
    console.log(JSON.stringify(task1, null, 2));

    console.log('\nTask 2 (cmlhkso4d0000cf20hil05nfg):');
    console.log(JSON.stringify(task2, null, 2));

    // 查询所有任务
    const allTasks = await prisma.autoModelingTask.findMany({
      include: {
        discussion: true,
        codeGeneration: true,
        validations: true,
        paper: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n总共有 ${allTasks.length} 个任务:`);
    allTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.id} - ${task.title} - Status: ${task.status} - Progress: ${task.progress}%`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTasks();
