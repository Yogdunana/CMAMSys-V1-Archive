import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Prisma models:', Object.keys(prisma).filter(k => !k.startsWith('_') && typeof prisma[k as any] === 'object'));

async function test() {
  try {
    // 测试访问 optimizationHistory
    if (prisma.optimizationHistory) {
      console.log('optimizationHistory model found');
    } else {
      console.log('optimizationHistory model NOT found');
    }

    if (prisma.performanceMetrics) {
      console.log('performanceMetrics model found');
    } else {
      console.log('performanceMetrics model NOT found');
    }

    if (prisma.optimizationLog) {
      console.log('optimizationLog model found');
    } else {
      console.log('optimizationLog model NOT found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test().then(() => process.exit(0));
