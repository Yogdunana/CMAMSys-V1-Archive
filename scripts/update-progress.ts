import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.autoModelingTask.update({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
    data: { progress: 60 }
  });
  console.log('✅ 任务进度已更新为 60%');
}

main().finally(() => prisma.$disconnect());
