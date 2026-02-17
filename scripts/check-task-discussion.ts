import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking discussion for task: cmlnxdhu5000pvf0fa8yrdmbn\n');

  // 获取任务详情
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlnxdhu5000pvf0fa8yrdmbn' },
  });

  if (!task) {
    console.error('❌ Task not found');
    process.exit(1);
  }

  console.log('📊 Task Info:');
  console.log(`   ID: ${task.id}`);
  console.log(`   Task Title: ${task.problemTitle || 'undefined'}`);
  console.log(`   Overall Status: ${task.overallStatus}`);
  console.log(`   Discussion Status: ${task.discussionStatus}`);
  console.log(`   Discussion ID: ${task.discussionId}`);
  console.log(`   Created At: ${task.createdAt}`);
  console.log(`   Updated At: ${task.updatedAt}`);
  console.log('');

  // 检查讨论
  if (task.discussionId) {
    console.log('🔹 Discussion ID found, fetching details...\n');

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
      console.log('💬 Discussion Details:');
      console.log(`   ID: ${discussion.id}`);
      console.log(`   Title: ${discussion.discussionTitle}`);
      console.log(`   Status: ${discussion.status}`);
      console.log(`   Task ID: ${discussion.autoTaskId}`);
      console.log(`   Created At: ${discussion.createdAt}`);
      console.log(`   Message Count: ${discussion.messages.length}`);
      console.log('');

      if (discussion.messages.length > 0) {
        console.log('📨 Recent Messages:');
        discussion.messages.forEach((msg, index) => {
          console.log(`   ${index + 1}. [${msg.messageType}] ${msg.messageContent?.substring(0, 100)}...`);
          console.log(`      Created: ${msg.createdAt}`);
        });
      }
    } else {
      console.error('❌ Discussion not found with ID:', task.discussionId);
    }
  } else {
    console.log('⚠️  No Discussion ID found in task');
    console.log('   Discussion Status:', task.discussionStatus);
  }

  // 检查所有讨论
  console.log('\n🔍 All discussions in database:');
  const allDiscussions = await prisma.groupDiscussion.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  console.log(`   Total: ${allDiscussions.length}`);
  allDiscussions.forEach((d) => {
    console.log(`   - ${d.id}: ${d.discussionTitle} (${d.status}) - ${d._count.messages} messages`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
