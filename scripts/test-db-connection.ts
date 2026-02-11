import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Database Connection Test ===');

  // 检查当前连接的数据库
  try {
    const result = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Current database:', result);
  } catch (error) {
    console.error('Error getting current database:', error);
  }

  // 检查表
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('\nTables:', tables);
  } catch (error) {
    console.error('Error getting tables:', error);
  }

  // 检查用户数量
  try {
    const userCount = await prisma.user.count();
    console.log('\nUser count:', userCount);
  } catch (error) {
    console.error('Error counting users:', error);
  }

  // 检查任务数量
  try {
    const taskCount = await prisma.modelingTask.count();
    console.log('Modeling task count:', taskCount);
  } catch (error) {
    console.error('Error counting tasks:', error);
  }

  // 列出所有用户
  try {
    const users = await prisma.user.findMany();
    console.log('\nUsers:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role}`);
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }

  // 列出所有任务
  try {
    const tasks = await prisma.modelingTask.findMany();
    console.log('\nModeling Tasks:');
    tasks.forEach(task => {
      console.log(`- ${task.name} - ${task.status}`);
    });
  } catch (error) {
    console.error('Error listing tasks:', error);
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
