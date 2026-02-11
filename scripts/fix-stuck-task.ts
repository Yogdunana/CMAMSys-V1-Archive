import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 深入检查任务状态 ===\n');

  // 1. 检查任务的原始数据（不使用 include）
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
  });

  if (!task) {
    console.log('找不到任务');
    return;
  }

  console.log(`任务原始数据:`);
  console.log(`  discussionId: ${task.discussionId || '(空)'}`);
  console.log(`  codeGenerationId: ${task.codeGenerationId || '(空)'}`);
  console.log(`  paperId: ${task.paperId || '(空)'}`);
  console.log('');

  // 2. 查找所有关联到这个任务的讨论
  const discussions = await prisma.groupDiscussion.findMany({
    where: { autoTaskId: task.id },
  });

  console.log(`找到 ${discussions.length} 个关联的讨论:\n`);
  discussions.forEach((d, i) => {
    console.log(`讨论 ${i + 1}:`);
    console.log(`  ID: ${d.id}`);
    console.log(`  标题: ${d.discussionTitle}`);
    console.log(`  状态: ${d.status}`);
    console.log(`  回合: ${d.currentRound}/${d.maxRounds}`);
    console.log('');
  });

  // 3. 如果有关联的讨论，更新任务的 discussionId
  if (discussions.length > 0 && !task.discussionId) {
    console.log('### 修复方案 ###');
    console.log(`发现讨论记录但任务的 discussionId 为空`);
    console.log(`将更新任务的 discussionId 为: ${discussions[0].id}`);
    console.log('');

    await prisma.autoModelingTask.update({
      where: { id: task.id },
      data: {
        discussionId: discussions[0].id,
        discussionStatus: 'COMPLETED',
        overallStatus: 'CODING',
        progress: 40,
      },
    });

    console.log('✅ 任务状态已更新');
    console.log('  discussionStatus: PENDING -> COMPLETED');
    console.log('  overallStatus: DISCUSSING -> CODING');
    console.log('  progress: 0 -> 40');
  } else if (task.discussionId) {
    // 4. 如果已经有 discussionId，检查讨论是否存在
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: task.discussionId },
    });

    if (!discussion) {
      console.log('### 问题 ###');
      console.log(`任务的 discussionId 指向不存在的讨论记录: ${task.discussionId}`);
    } else if (discussion.status === 'COMPLETED' && task.discussionStatus === 'PENDING') {
      console.log('### 修复方案 ###');
      console.log('讨论已完成，但任务状态未同步');
      console.log('');

      await prisma.autoModelingTask.update({
        where: { id: task.id },
        data: {
          discussionStatus: 'COMPLETED',
          overallStatus: 'CODING',
          progress: 40,
        },
      });

      console.log('✅ 任务状态已更新');
      console.log('  discussionStatus: PENDING -> COMPLETED');
      console.log('  overallStatus: DISCUSSING -> CODING');
      console.log('  progress: 0 -> 40');
    } else {
      console.log('任务状态正常，无需修复');
    }
  } else {
    console.log('没有找到关联的讨论记录，需要重新创建讨论');
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
