import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('测试 getAutoTaskStatus 函数...\n');

  try {
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
      include: {
        discussion: {
          include: {
            messages: {
              orderBy: { round: 'asc' },
            },
          },
        },
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    if (!task) {
      console.log('❌ 任务不存在');
      return;
    }

    console.log('✅ 找到任务');
    console.log(`ID: ${task.id}`);
    console.log(`标题: ${task.problemTitle}`);
    console.log(`整体状态: ${task.overallStatus}`);
    console.log(`讨论状态: ${task.discussionStatus}`);
    console.log(`讨论 ID: ${task.discussionId || '(空)'}`);

    if (task.discussion) {
      console.log(`\n讨论记录: ${task.discussion.discussionTitle}`);
      console.log(`讨论状态: ${task.discussion.status}`);
      console.log(`消息数量: ${task.discussion.messages.length}`);
    } else {
      console.log(`\n❌ 没有关联的讨论记录`);
    }

  } catch (error) {
    console.error('❌ 发生错误:', error);
  }
}

main().finally(() => prisma.$disconnect());
