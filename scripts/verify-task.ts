/**
 * 验证任务和代码生成是否存在
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTask() {
  try {
    const taskId = 'cmlhktmot0000uguh5r4wpvgy';

    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
      },
    });

    if (!task) {
      console.log('❌ 任务不存在');
      return;
    }

    console.log('✅ 任务存在');
    console.log(`  标题: ${task.problemTitle}`);
    console.log(`  状态: ${task.overallStatus}`);
    console.log(`  代码生成 ID: ${task.codeGenerationId}`);
    console.log(`  代码生成状态: ${task.codeGeneration?.executionStatus}`);

    if (task.codeGeneration) {
      console.log('\n✅ 代码生成存在');
      console.log(`  代码长度: ${task.codeGeneration.codeContent.length} 字符`);
      console.log(`  代码语言: ${task.codeGeneration.codeLanguage}`);
    } else {
      console.log('\n❌ 代码生成不存在');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTask();
