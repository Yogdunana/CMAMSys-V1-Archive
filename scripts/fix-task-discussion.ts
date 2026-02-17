import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing task-discussion relationship...\n');

  const taskId = 'cmlnxdhu5000pvf0fa8yrdmbn';

  // 查找关联的讨论
  const discussion = await prisma.groupDiscussion.findFirst({
    where: {
      autoTaskId: taskId,
    },
  });

  if (!discussion) {
    console.error('❌ Discussion not found for task:', taskId);
    process.exit(1);
  }

  console.log('📊 Found Discussion:');
  console.log(`   ID: ${discussion.id}`);
  console.log(`   Title: ${discussion.discussionTitle}`);
  console.log(`   Status: ${discussion.status}`);
  console.log(`   Auto Task ID: ${discussion.autoTaskId}`);
  console.log('');

  // 更新任务的 discussionId 和 discussionStatus
  const updatedTask = await prisma.autoModelingTask.update({
    where: { id: taskId },
    data: {
      discussionId: discussion.id,
      discussionStatus: discussion.status,
    },
  });

  console.log('✅ Task Updated:');
  console.log(`   ID: ${updatedTask.id}`);
  console.log(`   Discussion ID: ${updatedTask.discussionId}`);
  console.log(`   Discussion Status: ${updatedTask.discussionStatus}`);
  console.log('');

  // 获取讨论消息
  const messages = await prisma.discussionMessage.findMany({
    where: {
      discussionId: discussion.id,
    },
    orderBy: { createdAt: 'asc' },
    take: 5,
  });

  console.log(`📨 Discussion Messages: ${messages.length}`);
  messages.forEach((msg, index) => {
    console.log(`   ${index + 1}. [${msg.messageType || 'Unknown'}] ${msg.messageContent || 'No content'}`);
    console.log(`      Created: ${msg.createdAt}`);
  });

  console.log('\n✅ Task-discussion relationship fixed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
