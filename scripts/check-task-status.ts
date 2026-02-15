import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking task status and discussion...\n');

  const taskId = 'cmlnxdhu5000pvf0fa8yrdmbn';

  // 获取任务
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    console.error('❌ Task not found');
    process.exit(1);
  }

  console.log('📋 Task Status:');
  console.log(`   ID: ${task.id}`);
  console.log(`   Overall Status: ${task.overallStatus}`);
  console.log(`   Discussion Status: ${task.discussionStatus}`);
  console.log(`   Progress: ${task.progress}%`);
  console.log(`   Discussion ID: ${task.discussionId}`);
  console.log('');

  // 获取讨论
  if (task.discussionId) {
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: task.discussionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10,
        },
      },
    });

    if (discussion) {
      console.log('💬 Discussion Info:');
      console.log(`   ID: ${discussion.id}`);
      console.log(`   Status: ${discussion.status}`);
      console.log(`   Current Round: ${discussion.currentRound}`);
      console.log(`   Max Rounds: ${discussion.maxRounds}`);
      console.log(`   Message Count: ${discussion.messages.length}`);
      console.log('');

      if (discussion.messages.length > 0) {
        console.log('📨 Messages:');
        discussion.messages.forEach((msg, index) => {
          console.log(`   ${index + 1}. [${msg.senderName}] ${msg.messageType}`);
          console.log(`      Length: ${msg.messageContent?.length || 0} chars`);
        });
      }

      // 检查讨论是否完成
      console.log('\n🎯 Analysis:');
      console.log(`   Task Status: ${task.overallStatus}`);
      console.log(`   Discussion Status: ${discussion.status}`);

      if (discussion.status === 'COMPLETED' || discussion.status === 'IN_PROGRESS') {
        console.log('\n✅ Discussion is complete or in progress');
        console.log('💡 Task should automatically move to next phase (Coding, Validation, Paper)');
        console.log('⚠️  But task is still PENDING -这可能意味着:');
        console.log('   1. Background coordinator process did not start');
        console.log('   2. Coordinator process encountered an error');
        console.log('   3. Need to manually trigger next phase');
      } else {
        console.log('\n⚠️  Discussion is not complete yet');
      }
    }
  } else {
    console.log('❌ No discussion found');
  }

  console.log('\n\n💡 Solution:');
  console.log('   Option 1: Wait for background coordinator to process (if running)');
  console.log('   Option 2: Manually restart the task');
  console.log('   Option 3: Check logs for errors in background process');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
