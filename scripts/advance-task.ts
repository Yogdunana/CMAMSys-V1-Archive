import { PrismaClient } from '@prisma/client';
import { OverallStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Manually advancing task to next phase...\n');

  const taskId = 'cmlnxdhu5000pvf0fa8yrdmbn';

  // 获取任务
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    console.error('❌ Task not found');
    process.exit(1);
  }

  console.log('📋 Current Task Status:');
  console.log(`   Overall Status: ${task.overallStatus}`);
  console.log(`   Discussion Status: ${task.discussionStatus}`);
  console.log(`   Progress: ${task.progress}%`);
  console.log('');

  // 将讨论标记为完成
  if (task.discussionId) {
    console.log('🔄 Marking discussion as completed...');
    await prisma.groupDiscussion.update({
      where: { id: task.discussionId },
      data: {
        status: 'COMPLETED',
        currentRound: 1, // 已完成第一轮
      },
    });

    console.log('✅ Discussion marked as completed');
  }

  // 更新任务状态到讨论完成，开始编码阶段
  console.log('\n🔄 Updating task status to CODING...');
  await prisma.autoModelingTask.update({
    where: { id: taskId },
    data: {
      discussionStatus: 'COMPLETED',
      overallStatus: OverallStatus.CODING,
      progress: 30,
    },
  });

  console.log('✅ Task status updated to CODING');
  console.log('\n💡 Next steps should be:');
  console.log('   1. Code Generation (45%)');
  console.log('   2. Code Validation (65%)');
  console.log('   3. Paper Generation (100%)');
  console.log('');

  // 检查更新后的状态
  const updatedTask = await prisma.autoModelingTask.findUnique({
    where: { id: taskId },
  });

  console.log('📊 Updated Task Status:');
  console.log(`   Overall Status: ${updatedTask?.overallStatus}`);
  console.log(`   Discussion Status: ${updatedTask?.discussionStatus}`);
  console.log(`   Progress: ${updatedTask?.progress}%`);
  console.log('');

  console.log('✅ Task manually advanced!');
  console.log('⚠️  Note: Code generation and validation still need to be triggered');
  console.log('💡 You may need to manually trigger these steps or restart the task');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
