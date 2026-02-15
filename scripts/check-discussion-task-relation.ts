import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking discussion-task relationship...\n');

  // 获取所有讨论
  const discussions = await prisma.groupDiscussion.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 5,
      },
    },
  });

  console.log(`💬 Total Discussions: ${discussions.length}\n`);

  discussions.forEach((discussion, index) => {
    console.log(`\n${index + 1}. Discussion: ${discussion.discussionTitle}`);
    console.log(`   ID: ${discussion.id}`);
    console.log(`   Auto Task ID: ${discussion.autoTaskId}`);
    console.log(`   Status: ${discussion.status}`);
    console.log(`   Created At: ${discussion.createdAt}`);
    console.log(`   Message Count: ${discussion.messages.length}`);

    if (discussion.messages.length > 0) {
      console.log('\n   Latest Messages:');
      discussion.messages.forEach((msg, i) => {
        console.log(`      ${i + 1}. [${msg.role}] ${msg.content?.substring(0, 80)}...`);
      });
    }
  });

  // 检查任务
  console.log('\n\n🔍 Tasks:');
  const tasks = await prisma.autoModelingTask.findMany({
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  tasks.forEach((task) => {
    console.log(`\n📋 Task: ${task.taskTitle || 'undefined'}`);
    console.log(`   ID: ${task.id}`);
    console.log(`   Discussion ID: ${task.discussionId}`);
    console.log(`   Discussion Status: ${task.discussionStatus}`);
    console.log(`   Overall Status: ${task.overallStatus}`);
  });

  // 检查 orphaned discussions（没有关联任务的讨论）
  console.log('\n\n🔍 Orphaned Discussions (no task linked):');
  const orphanedDiscussions = discussions.filter(d => !d.autoTaskId);

  if (orphanedDiscussions.length > 0) {
    orphanedDiscussions.forEach((d) => {
      console.log(`   - ${d.id}: ${d.discussionTitle}`);
    });
  } else {
    console.log('   None');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
