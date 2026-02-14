/**
 * 检查任务执行状态
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTaskExecution() {
  try {
    const taskId = 'cmlhktmot0000uguh5r4wpvgy';

    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        discussion: {
          include: {
            messages: {
              orderBy: { round: 'asc' },
            },
          },
        },
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    if (!task) {
      console.log('❌ 任务不存在');
      return;
    }

    console.log('📋 任务基本信息：');
    console.log(`  ID: ${task.id}`);
    console.log(`  标题: ${task.problemTitle}`);
    console.log(`  状态: ${task.overallStatus}`);
    console.log(`  进度: ${task.progress}%`);
    console.log(`  创建时间: ${task.createdAt.toLocaleString('zh-CN')}`);
    console.log(`  更新时间: ${task.updatedAt.toLocaleString('zh-CN')}`);

    if (task.errorLog) {
      console.log(`\n❌ 错误日志:\n${task.errorLog}`);
    }

    console.log('\n📊 讨论记录：');
    if (task.discussion && task.discussion.messages.length > 0) {
      task.discussion.messages.forEach((msg, index) => {
        console.log(`\n  [回合 ${msg.round}] ${msg.senderName}:`);
        console.log(`  ${msg.messageContent.substring(0, 200)}...`);
      });
    } else {
      console.log('  暂无讨论记录');
    }

    console.log('\n💻 代码生成：');
    if (task.codeGeneration) {
      console.log(`  状态: ${task.codeGeneration.executionStatus}`);
      console.log(`  语言: ${task.codeGeneration.codeLanguage}`);
      console.log(`  质量: ${task.codeGeneration.qualityScore || '未评分'}`);
      if (task.codeGeneration.errorLog) {
        console.log(`\n  错误日志:\n  ${task.codeGeneration.errorLog}`);
      }
      console.log(`\n  代码（前 500 字符）:\n  ${task.codeGeneration.codeContent.substring(0, 500)}...`);
    } else {
      console.log('  暂无代码生成记录');
    }

    console.log('\n✅ 代码校验：');
    if (task.validations && task.validations.length > 0) {
      task.validations.forEach((validation, index) => {
        console.log(`  校验 ${index + 1}: ${validation.validationType} - ${validation.status}`);
        if (validation.errorMessage) {
          console.log(`    错误: ${validation.errorMessage}`);
        }
      });
    } else {
      console.log('  暂无校验记录');
    }

    console.log('\n📄 论文生成：');
    if (task.paper) {
      console.log(`  状态: ${task.paper.status}`);
      console.log(`  字数: ${task.paper.wordCount || 0}`);
    } else {
      console.log('  暂无论文生成记录');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTaskExecution();
