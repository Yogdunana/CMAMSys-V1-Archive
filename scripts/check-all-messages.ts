import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查所有讨论消息 ===\n');

  const messages = await prisma.discussionMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  console.log(`找到 ${messages.length} 条消息\n`);

  messages.forEach((msg, index) => {
    const hasContent = msg.messageContent && msg.messageContent.length > 0;
    console.log(`[${index + 1}] ${msg.senderName} - 回合 ${msg.round}`);
    console.log(`   讨论ID: ${msg.discussionId}`);
    console.log(`   Provider ID: ${msg.senderProviderId}`);
    console.log(`   消息类型: ${msg.messageType}`);
    console.log(`   有内容: ${hasContent ? '是' : '否'}`);
    if (hasContent) {
      console.log(`   内容长度: ${msg.messageContent.length} 字符`);
      console.log(`   内容预览: ${msg.messageContent.substring(0, 100)}...`);
    }
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
