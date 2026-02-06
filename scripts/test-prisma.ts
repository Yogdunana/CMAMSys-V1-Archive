import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('测试 Prisma 连接...');
    await prisma.$connect();
    console.log('✅ Prisma 连接成功');
  } catch (error) {
    console.error('❌ Prisma 连接失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
