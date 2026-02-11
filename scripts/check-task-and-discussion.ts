import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查任务和讨论状态 ===\n');

  // 1. 检查任务状态
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
  });

  if (!task) {
    console.log('❌ 找不到任务');
    return;
  }

  console.log('### 任务状态 ###');
  console.log(`ID: ${task.id}`);
  console.log(`标题: ${task.problemTitle}`);
  console.log(`整体状态: ${task.overallStatus}`);
  console.log(`讨论状态: ${task.discussionStatus}`);
  console.log(`讨论 ID: ${task.discussionId || '(空)'}`);
  console.log(`进度: ${task.progress || 0}%`);
  console.log(`更新时间: ${task.updatedAt}`);
  console.log('');

  // 2. 检查讨论记录
  console.log('### 讨论记录 ###');

  // 尝试通过任务的 discussionId 查找
  if (task.discussionId) {
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: task.discussionId },
    });

    if (discussion) {
      console.log(`✅ 通过 discussionId 找到讨论:`);
      console.log(`   ID: ${discussion.id}`);
      console.log(`   标题: ${discussion.discussionTitle}`);
      console.log(`   状态: ${discussion.status}`);
      console.log(`   autoTaskId: ${discussion.autoTaskId || '(空)'}`);
    } else {
      console.log(`❌ discussionId 指向的讨论不存在: ${task.discussionId}`);
    }
    console.log('');
  }

  // 3. 尝试通过 autoTaskId 查找
  const discussionByTaskId = await prisma.groupDiscussion.findFirst({
    where: { autoTaskId: task.id },
  });

  if (discussionByTaskId) {
    console.log(`✅ 通过 autoTaskId 找到讨论:`);
    console.log(`   ID: ${discussionByTaskId.id}`);
    console.log(`   标题: ${discussionByTaskId.discussionTitle}`);
    console.log(`   状态: ${discussionByTaskId.status}`);
    console.log(`   autoTaskId: ${discussionByTaskId.autoTaskId}`);
    console.log('');

    // 4. 如果两者不一致，更新任务
    if (task.discussionId !== discussionByTaskId.id) {
      console.log('### 修复方案 ###');
      console.log(`任务的 discussionId (${task.discussionId || '(空)'}) 与实际的讨论 ID (${discussionByTaskId.id}) 不一致`);
      console.log(`将更新任务的 discussionId 为: ${discussionByTaskId.id}`);
      console.log('');

      await prisma.autoModelingTask.update({
        where: { id: task.id },
        data: {
          discussionId: discussionByTaskId.id,
          discussionStatus: discussionByTaskId.status as any,
          overallStatus: 'CODING',
          progress: 40,
        },
      });

      console.log('✅ 任务状态已更新');
      console.log('  discussionId: 设置为实际讨论 ID');
      console.log('  discussionStatus: 同步讨论状态');
      console.log('  overallStatus: CODING');
      console.log('  progress: 40');
    }
  } else {
    console.log(`❌ 通过 autoTaskId 也找不到讨论记录`);
    console.log('需要重新创建讨论记录');
  }

  // 5. 再次检查更新后的任务状态
  const updatedTask = await prisma.autoModelingTask.findUnique({
    where: { id: task.id },
  });

  console.log('\n### 更新后的任务状态 ###');
  console.log(`整体状态: ${updatedTask?.overallStatus}`);
  console.log(`讨论 ID: ${updatedTask?.discussionId}`);
  console.log(`进度: ${updatedTask?.progress}%`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
