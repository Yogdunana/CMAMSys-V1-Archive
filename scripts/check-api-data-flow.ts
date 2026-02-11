import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查前端 API 数据流 ===\n');

  // 1. 测试 /api/auto-modeling/latest
  console.log('### 测试 /api/auto-modeling/latest ###');

  const latestTask = await prisma.autoModelingTask.findFirst({
    where: {
      overallStatus: {
        in: ['PENDING', 'DISCUSSING', 'CODING', 'VALIDATING', 'RETRYING', 'PAPER_GENERATING'],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestTask) {
    console.log('❌ 没有找到运行中的任务');
  } else {
    console.log('✅ 找到运行中的任务:');
    console.log(`  ID: ${latestTask.id}`);
    console.log(`  overallStatus: ${latestTask.overallStatus}`);
    console.log(`  discussionId: ${latestTask.discussionId || '(空)'}`);
    console.log(`  progress: ${latestTask.progress}`);
    console.log('');
  }

  // 2. 测试 /api/auto-modeling/[id]/status
  console.log('### 测试 /api/auto-modeling/[id]/status ###');

  const taskStatus = await prisma.autoModelingTask.findUnique({
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

  if (!taskStatus) {
    console.log('❌ 找不到任务');
    return;
  }

  // 模拟 getAutoTaskStatus 函数
  let progress = 0;

  switch (taskStatus.overallStatus) {
    case 'PENDING':
      progress = 0;
      break;
    case 'DISCUSSING':
      if (taskStatus.discussion) {
        const roundProgress = (taskStatus.discussion.currentRound / taskStatus.discussion.maxRounds) * 40;
        progress = roundProgress;
      } else {
        progress = 5;
      }
      break;
    case 'CODING':
      progress = 50;
      break;
    case 'VALIDATING':
      if (taskStatus.validations && taskStatus.validations.length > 0) {
        const validationProgress = 60 + (Math.min(taskStatus.validations.length, 3) / 3) * 20;
        progress = validationProgress;
      } else {
        progress = 65;
      }
      break;
    case 'RETRYING':
      progress = 75;
      break;
    case 'PAPER_GENERATING':
      progress = 90;
      break;
    case 'COMPLETED':
      progress = 100;
      break;
    case 'FAILED':
      progress = taskStatus.progress || 0;
      break;
    default:
      progress = 0;
  }

  const apiResponse = {
    ...taskStatus,
    progress,
  };

  console.log('✅ API 返回数据:');
  console.log(`  id: ${apiResponse.id}`);
  console.log(`  overallStatus: ${apiResponse.overallStatus}`);
  console.log(`  discussionStatus: ${apiResponse.discussionStatus}`);
  console.log(`  discussionId: ${apiResponse.discussionId || '(空)'}`);
  console.log(`  progress: ${apiResponse.progress}`);
  console.log('');

  // 3. 测试 /api/discussion/[id]/messages
  console.log('### 测试 /api/discussion/[id]/messages ###');

  if (!apiResponse.discussionId) {
    console.log('❌ 任务没有关联的讨论 ID');
  } else {
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: apiResponse.discussionId },
      include: {
        messages: {
          orderBy: [
            { round: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!discussion) {
      console.log('❌ 讨论记录不存在');
    } else {
      console.log('✅ 找到讨论记录:');
      console.log(`  ID: ${discussion.id}`);
      console.log(`  标题: ${discussion.discussionTitle}`);
      console.log(`  状态: ${discussion.status}`);
      console.log(`  消息数量: ${discussion.messages.length}`);
      console.log('');
    }
  }

  // 4. 诊断问题
  console.log('### 诊断 ###');
  console.log('');

  if (!latestTask) {
    console.log('问题 1: /api/auto-modeling/latest 没有返回运行中的任务');
    console.log('原因: 数据库中没有 overallStatus 在 [PENDING, DISCUSSING, CODING, VALIDATING, RETRYING, PAPER_GENERATING] 范围内的任务');
    console.log('解决: 检查任务状态是否正确');
    console.log('');
  }

  if (latestTask && latestTask.id === 'cmlhktmot0000uguh5r4wpvgy') {
    console.log('问题 2: 找到了任务，但前端显示不正确');
    console.log('可能原因:');
    console.log('  1. Token 过期，API 返回 401');
    console.log('  2. 前端缓存了旧数据');
    console.log('  3. React 状态更新失败');
    console.log('');
  }

  if (!apiResponse.discussionId) {
    console.log('问题 3: 任务没有关联讨论 ID');
    console.log('解决: 重新关联讨论 ID');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
