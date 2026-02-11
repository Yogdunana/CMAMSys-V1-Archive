import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查任务状态 ===\n');

  // 1. 检查任务的当前状态
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
    include: {
      discussion: true,
      codeGeneration: true,
      validations: true,
      paper: true,
    },
  });

  if (!task) {
    console.log('找不到任务');
    return;
  }

  console.log(`任务 ID: ${task.id}`);
  console.log(`标题: ${task.problemTitle}`);
  console.log(`整体状态: ${task.overallStatus}`);
  console.log(`讨论状态: ${task.discussionStatus}`);
  console.log(`校验状态: ${task.validationStatus}`);
  console.log(`论文状态: ${task.paperStatus}`);
  console.log(`进度: ${task.progress || 0}%`);
  console.log(`错误日志: ${task.errorLog || '无'}`);
  console.log(`更新时间: ${task.updatedAt}`);
  console.log('');

  // 2. 检查讨论是否真的完成
  if (task.discussion) {
    console.log(`讨论 ID: ${task.discussion.id}`);
    console.log(`讨论状态: ${task.discussion.status}`);
    console.log(`当前回合: ${task.discussion.currentRound}/${task.discussion.maxRounds}`);

    const messageCount = await prisma.discussionMessage.count({
      where: { discussionId: task.discussion.id },
    });
    console.log(`消息数量: ${messageCount}`);
    console.log('');
  }

  // 3. 检查是否有代码生成记录
  if (task.codeGeneration) {
    console.log(`代码生成 ID: ${task.codeGeneration.id}`);
    console.log(`代码长度: ${task.codeGeneration.codeContent?.length || 0}`);
    console.log('');
  } else {
    console.log('没有代码生成记录');
    console.log('');
  }

  // 4. 检查是否有校验记录
  if (task.validations && task.validations.length > 0) {
    console.log(`校验记录数量: ${task.validations.length}`);
    task.validations.forEach((v, i) => {
      console.log(`  校验 ${i + 1}: ${v.status} - ${v.retried ? '已回溯' : '首次'}`);
    });
    console.log('');
  } else {
    console.log('没有校验记录');
    console.log('');
  }

  // 5. 检查是否有论文记录
  if (task.paper) {
    console.log(`论文 ID: ${task.paper.id}`);
    console.log(`论文状态: ${task.paper.status}`);
    console.log('');
  } else {
    console.log('没有论文记录');
    console.log('');
  }

  // 6. 诊断：讨论已完成但任务状态没更新
  if (task.discussion && task.discussion.status === 'COMPLETED' && task.discussionStatus === 'PENDING') {
    console.log('### 诊断结果 ###');
    console.log('讨论已完成，但任务的 discussionStatus 仍是 PENDING');
    console.log('这导致任务卡在 DISCUSSING 状态，无法进入下一阶段');
    console.log('');
    console.log('### 建议修复 ###');
    console.log('1. 更新任务的 discussionStatus 为 COMPLETED');
    console.log('2. 更新任务的 overallStatus 为 CODING');
    console.log('3. 开始代码生成流程');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
