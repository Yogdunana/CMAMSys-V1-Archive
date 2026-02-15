import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking current running task...\n');

  // 获取最新的任务
  const tasks = await prisma.autoModelingTask.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log(`📊 Total Tasks: ${tasks.length}\n`);

  if (tasks.length === 0) {
    console.log('❌ No tasks found');
    return;
  }

  tasks.forEach((task, index) => {
    const isLatest = index === 0;
    console.log(`${isLatest ? '🟢' : '  '} Task ${index + 1}: ${task.problemTitle}`);
    console.log(`   ID: ${task.id}`);
    console.log(`   Task ID: ${task.taskId}`);
    console.log(`   Overall Status: ${task.overallStatus}`);
    console.log(`   Progress: ${task.progress}%`);
    console.log(`   Competition Type: ${task.competitionType}`);
    console.log(`   Discussion Status: ${task.discussionStatus}`);
    console.log(`   Code Validation Status: ${task.validationStatus}`);
    console.log(`   Paper Status: ${task.paperStatus}`);
    console.log(`   Created At: ${task.createdAt}`);
    console.log(`   Updated At: ${task.updatedAt}`);

    if (task.errorLog) {
      console.log(`   Error: ${task.errorLog}`);
    }

    console.log('');
  });

  // 检查是否有运行中的任务
  const runningTasks = await prisma.autoModelingTask.findMany({
    where: {
      overallStatus: {
        in: ['DISCUSSING', 'CODING', 'VALIDATING', 'PAPER_GENERATING', 'RETRYING'],
      },
    },
  });

  console.log(`\n🔄 Running Tasks: ${runningTasks.length}`);

  if (runningTasks.length > 0) {
    runningTasks.forEach((task) => {
      console.log(`   - ${task.problemTitle} (${task.id}): ${task.overallStatus} - ${task.progress}%`);
    });
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
