import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking discussion messages in detail...\n');

  const discussionId = 'cmlnxdhx5000qvf0flyyl3l9i';

  // 获取所有消息
  const messages = await prisma.discussionMessage.findMany({
    where: {
      discussionId: discussionId,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`💬 Total Messages: ${messages.length}\n`);

  if (messages.length === 0) {
    console.log('❌ No messages found');
    return;
  }

  messages.forEach((msg, index) => {
    console.log(`\n${index + 1}. Message ID: ${msg.id}`);
    console.log(`   Role: ${msg.role || 'undefined'}`);
    console.log(`   Content: ${msg.content || 'undefined'}`);
    console.log(`   Created At: ${msg.createdAt}`);
    console.log(`   Discussion ID: ${msg.discussionId}`);
    console.log(`   Content Length: ${msg.content?.length || 0} chars`);

    // 打印前 200 个字符
    if (msg.content && msg.content.length > 0) {
      console.log(`   Preview: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`);
    }
  });

  // 检查讨论详情
  console.log('\n\n📋 Discussion Details:');
  const discussion = await prisma.groupDiscussion.findUnique({
    where: { id: discussionId },
  });

  if (discussion) {
    console.log(`   ID: ${discussion.id}`);
    console.log(`   Title: ${discussion.discussionTitle}`);
    console.log(`   Status: ${discussion.status}`);
    console.log(`   Auto Task ID: ${discussion.autoTaskId}`);
    console.log(`   Created At: ${discussion.createdAt}`);
    console.log(`   Updated At: ${discussion.updatedAt}`);
  }

  // 检查是否有其他角色的消息
  console.log('\n\n👥 Role Distribution:');
  const roleCount: Record<string, number> = {};
  messages.forEach(msg => {
    const role = msg.role || 'undefined';
    roleCount[role] = (roleCount[role] || 0) + 1;
  });

  Object.entries(roleCount).forEach(([role, count]) => {
    console.log(`   ${role}: ${count} messages`);
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
