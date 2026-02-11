import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('查找建模任务...\n');

  const tasks = await prisma.modelingTask.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  console.log(`找到 ${tasks.length} 个建模任务:\n`);
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.name}`);
    console.log(`   ID: ${task.id}`);
    console.log(`   状态: ${task.status}`);
    console.log(`   创建时间: ${task.createdAt}\n`);
  });
}

main().finally(() => prisma.$disconnect());
