/**
 * 检查任务执行状态
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTaskExecutionStatus() {
  try {
    const taskId = 'cmlhktmot0000uguh5r4wpvgy';

    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
        discussion: true,
      },
    });

    if (!task) {
      console.log('❌ 任务不存在');
      return;
    }

    console.log('📋 任务基本信息：');
    console.log(`  ID: ${task.id}`);
    console.log(`  标题: ${task.problemTitle}`);
    console.log(`  总体状态: ${task.overallStatus}`);
    console.log(`  进度: ${task.progress}%`);
    console.log(`  讨论状态: ${task.discussionStatus}`);
    console.log(`  论文状态: ${task.paperStatus}`);
    console.log(`  校验状态: ${task.validationStatus}`);

    if (task.errorLog) {
      console.log(`\n❌ 错误日志:\n${task.errorLog}`);
    }

    console.log('\n💻 代码生成信息：');
    if (task.codeGeneration) {
      console.log(`  代码生成 ID: ${task.codeGeneration.id}`);
      console.log(`  执行状态: ${task.codeGeneration.executionStatus}`);
      console.log(`  代码语言: ${task.codeGeneration.codeLanguage}`);
      console.log(`  代码长度: ${task.codeGeneration.codeContent.length} 字符`);
      console.log(`  质量评分: ${task.codeGeneration.qualityScore}`);
      console.log(`  执行时间: ${task.codeGeneration.executionTime}ms`);
      console.log(`  执行输出长度: ${task.codeGeneration.executionOutput?.length || 0} 字符`);
      console.log(`  错误日志: ${task.codeGeneration.errorLog?.length || 0} 字符`);

      if (task.codeGeneration.executionStatus === 'PENDING') {
        console.log('\n⚠️  代码状态为 PENDING，需要在"代码执行"标签页中点击"执行"按钮');
      } else if (task.codeGeneration.executionStatus === 'SUCCESS') {
        console.log('\n✅ 代码已执行成功');
        console.log(`\n执行输出:\n${task.codeGeneration.executionOutput}`);
      } else if (task.codeGeneration.executionStatus === 'FAILED') {
        console.log('\n❌ 代码执行失败');
        console.log(`\n错误日志:\n${task.codeGeneration.errorLog}`);
      }
    } else {
      console.log('  ❌ 没有代码生成记录');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTaskExecutionStatus();
