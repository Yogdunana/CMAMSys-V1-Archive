import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 测试 API 返回数据 ===\n');

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
    console.log('找不到任务');
    return;
  }

  console.log('### 原始任务数据 ###');
  console.log(`overallStatus: ${task.overallStatus}`);
  console.log(`discussionStatus: ${task.discussionStatus}`);
  console.log(`discussionId: ${task.discussionId}`);
  console.log(`progress: ${task.progress}`);
  console.log('');

  // 模拟 getAutoTaskStatus 函数的计算逻辑
  let progress = 0;

  switch (task.overallStatus) {
    case 'PENDING':
      progress = 0;
      break;
    case 'DISCUSSING':
      if (task.discussion) {
        const roundProgress = (task.discussion.currentRound / task.discussion.maxRounds) * 40;
        progress = roundProgress;
      } else {
        progress = 5;
      }
      break;
    case 'CODING':
      progress = 50;
      break;
    case 'VALIDATING':
      if (task.validations && task.validations.length > 0) {
        const validationProgress = 60 + (Math.min(task.validations.length, 3) / 3) * 20;
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
      progress = task.progress || 0;
      break;
    default:
      progress = 0;
  }

  console.log('### 计算后的进度 ###');
  console.log(`progress: ${progress}`);
  console.log('');

  // 构造 API 返回数据
  const apiResponse = {
    ...task,
    progress,
  };

  console.log('### API 返回数据 ###');
  console.log(JSON.stringify({
    success: true,
    data: apiResponse,
  }, null, 2));
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
