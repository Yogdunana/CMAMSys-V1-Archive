import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('查找任务...');
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
  });

  if (task) {
    console.log('✅ 找到任务');
    console.log(`ID: ${task.id}`);
    console.log(`标题: ${task.problemTitle}`);
    console.log(`状态: ${task.overallStatus}`);
  } else {
    console.log('❌ 没有找到任务');
  }
}

main().finally(() => prisma.$disconnect());
