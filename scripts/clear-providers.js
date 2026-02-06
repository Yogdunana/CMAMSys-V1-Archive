const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('正在清除所有 AI Provider 配置...');
    
    // 删除所有 AI Provider
    const result = await prisma.aIProvider.deleteMany({});
    
    console.log(`已删除 ${result.count} 个 AI Provider 配置`);
    console.log('清除完成！');
    
  } catch (error) {
    console.error('清除失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
