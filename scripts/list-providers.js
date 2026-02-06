const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== AI Provider 列表 ===');
    const providers = await prisma.aIProvider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (providers.length === 0) {
      console.log('暂无 AI Provider 配置');
      return;
    }

    providers.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   类型: ${p.type}`);
      console.log(`   优先级: ${p.priority}`);
      console.log(`   状态: ${p.status}`);
      console.log(`   首选: ${p.isDefault ? '是' : '否'}`);
      console.log(`   模型: ${p.supportedModels.join(', ')}`);
      console.log(`   API Key: ${p.apiKey.substring(0, 20)}...`);
      console.log('');
    });

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
