import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查讨论记录详细内容 ===\n');

  const discussion = await prisma.groupDiscussion.findUnique({
    where: { id: 'cmlhktmro0001uguh8twka3yv' },
    include: {
      messages: {
        orderBy: { round: 'asc' },
      },
    },
  });

  if (!discussion) {
    console.log('❌ 讨论记录不存在');
    return;
  }

  console.log('### 讨论基本信息 ###');
  console.log(`ID: ${discussion.id}`);
  console.log(`标题: ${discussion.discussionTitle}`);
  console.log(`状态: ${discussion.status}`);
  console.log(`当前回合: ${discussion.currentRound}/${discussion.maxRounds}`);

  const participants = discussion.participants as Array<any>;
  console.log(`参与者: ${participants?.length || 0}\n`);

  console.log('### 讨论消息 ###');
  discussion.messages.forEach((msg, index) => {
    console.log(`\n[${index + 1}] 第 ${msg.round} 轮 - ${msg.senderName}`);
    console.log(`消息类型: ${msg.messageType}`);
    console.log(`内容长度: ${msg.messageContent.length} 字符`);
    console.log(`核心算法: ${msg.coreAlgorithms || '(无)'}`);
    console.log(`创新点: ${msg.innovations || '(无)'}`);
    console.log(`可行性: ${msg.feasibility || '(无)'}`);
  });

  console.log('\n### 讨论总结 ###');
  if (discussion.summary && typeof discussion.summary === 'object') {
    const summary = discussion.summary as any;
    console.log('共识:', summary.consensus || '(无)');
    if (Array.isArray(summary.innovations)) {
      console.log('\n创新点:');
      summary.innovations.forEach((inn: any, i: number) => {
        console.log(`  ${i + 1}. ${inn.provider}: ${inn.content}`);
      });
    }
    if (Array.isArray(summary.coreAlgorithms)) {
      console.log('\n核心算法:');
      summary.coreAlgorithms.forEach((algo: any, i: number) => {
        console.log(`  ${i + 1}. ${algo.provider}: ${algo.content}`);
      });
    }
  } else {
    console.log('❌ 没有总结');
  }
}

main().finally(() => prisma.$disconnect());
