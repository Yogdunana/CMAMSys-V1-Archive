import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查最新任务的详细状态 ===\n');

  // 获取最新的自动化任务
  const latestTask = await prisma.autoModelingTask.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!latestTask) {
    console.log('没有找到任何自动化任务');
    return;
  }

  console.log(`最新任务 ID: ${latestTask.id}`);
  console.log(`标题: ${latestTask.problemTitle}`);
  console.log(`整体状态: ${latestTask.overallStatus}`);
  console.log(`讨论状态: ${latestTask.discussionStatus}`);
  console.log(`校验状态: ${latestTask.validationStatus}`);
  console.log(`论文状态: ${latestTask.paperStatus}`);
  console.log(`错误日志: ${latestTask.errorLog || '无'}`);
  console.log(`创建时间: ${latestTask.createdAt}`);
  console.log('');

  // 检查该任务的讨论记录
  console.log('### 该任务的讨论记录 ###');
  const discussion = await prisma.groupDiscussion.findFirst({
    where: { autoTaskId: latestTask.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (discussion) {
    console.log(`讨论 ID: ${discussion.id}`);
    console.log(`讨论标题: ${discussion.discussionTitle}`);
    console.log(`讨论状态: ${discussion.status}`);
    console.log(`当前回合: ${discussion.currentRound}`);
    console.log(`最大回合: ${discussion.maxRounds}`);
    console.log(`消息数量: ${discussion.messages.length}\n`);

    console.log('### 消息详情 ###');
    discussion.messages.forEach((msg, index) => {
      console.log(`\n[${index + 1}] ${msg.senderName} (回合 ${msg.round})`);
      console.log(`    消息类型: ${msg.messageType}`);
      console.log(`    Provider ID: ${msg.senderProviderId}`);
      const contentPreview = msg.messageContent ? msg.messageContent.substring(0, 200) : '(空)';
      console.log(`    内容: ${contentPreview}${msg.messageContent && msg.messageContent.length > 200 ? '...' : ''}`);
    });
  } else {
    console.log('没有找到讨论记录');
  }

  console.log('\n\n### 检查为什么讨论没有继续 ###');

  // 检查是否有代码生成记录
  const codeGeneration = await prisma.codeGeneration.findFirst({
    where: { autoTaskId: latestTask.id },
  });

  if (codeGeneration) {
    console.log('\n找到代码生成记录:');
    console.log(`  代码 ID: ${codeGeneration.id}`);
    console.log(`  状态: ${codeGeneration.executionStatus}`);
    console.log(`  代码: ${codeGeneration.codeContent.substring(0, 200)}${codeGeneration.codeContent.length > 200 ? '...' : ''}`);
  } else {
    console.log('\n没有找到代码生成记录');
  }

  // 检查是否有校验记录
  const validation = await prisma.codeValidation.findFirst({
    where: { autoTaskId: latestTask.id },
  });

  if (validation) {
    console.log('\n找到校验记录:');
    console.log(`  校验 ID: ${validation.id}`);
    console.log(`  状态: ${validation.status}`);
    console.log(`  是否重试: ${validation.retried ? '是' : '否'}`);
    console.log(`  错误: ${validation.errorMessage || '无'}`);
  } else {
    console.log('\n没有找到校验记录');
  }

  // 检查是否有论文记录
  const paper = await prisma.generatedPaper.findFirst({
    where: { autoTaskId: latestTask.id },
  });

  if (paper) {
    console.log('\n找到论文记录:');
    console.log(`  论文 ID: ${paper.id}`);
    console.log(`  状态: ${paper.status}`);
    console.log(`  语言: ${paper.language}`);
  } else {
    console.log('\n没有找到论文记录');
  }

  console.log('\n=== 结论 ===');
  console.log('最新的任务状态是 DISCUSSING，但讨论状态是 PENDING');
  console.log('这说明讨论流程可能卡住了，没有正确执行');
  console.log('建议检查 run-real-auto-modeling.ts 脚本的执行情况');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
