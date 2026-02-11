import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 验证数据库中的任务数据 ===\n');

  // 检查自动化任务
  console.log('### 自动化任务 ###');
  const autoTask = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
  });

  if (autoTask) {
    console.log(`✅ 找到自动化任务:\n`);
    console.log(`ID: ${autoTask.id}`);
    console.log(`标题: ${autoTask.problemTitle}`);
    console.log(`整体状态: ${autoTask.overallStatus}`);
    console.log(`讨论状态: ${autoTask.discussionStatus}`);
    console.log(`讨论 ID: ${autoTask.discussionId || '(空)'}`);
    console.log(`进度: ${autoTask.progress || 0}%`);
    console.log(`更新时间: ${autoTask.updatedAt}\n`);
  } else {
    console.log('❌ 找不到自动化任务\n');
  }

  // 检查讨论记录
  if (autoTask?.discussionId) {
    console.log('### 讨论记录 ###');
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: autoTask.discussionId },
      include: {
        messages: {
          orderBy: { round: 'asc' },
        },
      },
    });

    if (discussion) {
      console.log(`✅ 找到讨论记录:\n`);
      console.log(`ID: ${discussion.id}`);
      console.log(`标题: ${discussion.discussionTitle}`);
      console.log(`状态: ${discussion.status}`);
      console.log(`当前回合: ${discussion.currentRound}/${discussion.maxRounds}`);
      console.log(`消息数量: ${discussion.messages.length}\n`);

      console.log(`消息预览:\n`);
      discussion.messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.senderName} (第 ${msg.round} 轮)`);
        console.log(`   内容: ${msg.messageContent.substring(0, 80)}...\n`);
      });
    } else {
      console.log('❌ 讨论记录不存在\n');
    }
  }

  console.log('=== 验证完成 ===');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
