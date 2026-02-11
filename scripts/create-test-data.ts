import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test data...');

  // 创建或获取管理员用户
  const admin = await prisma.user.upsert({
    where: { email: 'yogdunana@yogdunana.com' },
    update: {},
    create: {
      email: 'yogdunana@yogdunana.com',
      username: 'Yogdunana',
      passwordHash: await bcrypt.hash('X-Duan0719', 12),
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Admin user created:', admin.id, admin.username);

  // 创建测试用户
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: await bcrypt.hash('test123456', 12),
      role: 'USER',
      isVerified: true,
    },
  });

  console.log('Test user created:', testUser.id, testUser.username);

  // 创建一些建模任务
  const task1 = await prisma.modelingTask.create({
    data: {
      name: '测试建模任务 1',
      description: '这是一个测试建模任务，用于评估问题',
      problemType: 'EVALUATION',
      status: 'PENDING',
      progress: 0,
      dataFilePath: '/data/test1/data.csv',
      problemFilePath: '/data/test1/problem.pdf',
      algorithm: 'RANDOM_FOREST',
      approachNumber: 1,
      createdById: admin.id,
    },
  });

  console.log('Task 1 created:', task1.id, task1.name);

  const task2 = await prisma.modelingTask.create({
    data: {
      name: '预测问题分析',
      description: '使用机器学习进行时间序列预测',
      problemType: 'PREDICTION',
      status: 'PREPROCESSING',
      progress: 25,
      dataFilePath: '/data/prediction/data.csv',
      problemFilePath: '/data/prediction/problem.pdf',
      algorithm: 'LSTM',
      approachNumber: 2,
      createdById: testUser.id,
    },
  });

  console.log('Task 2 created:', task2.id, task2.name);

  // 查询所有任务
  const allTasks = await prisma.modelingTask.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  console.log('\nAll tasks in database:', allTasks.length);
  allTasks.forEach(task => {
    console.log(`- ${task.name} (created by ${task.createdBy.username})`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
