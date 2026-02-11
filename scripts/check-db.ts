import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database tables...');

  // 尝试查询建模任务
  try {
    const tasks = await prisma.modelingTask.findMany();
    console.log('Modeling tasks count:', tasks.length);
    console.log('Tasks:', JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error querying modeling tasks:', error);
  }

  // 查询用户
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    console.log('Admin user:', admin?.id, admin?.username);
  } catch (error) {
    console.error('Error querying admin user:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
