const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== AI Provider 详细信息 ===\n');

    const providers = await prisma.aIProvider.findMany({
      orderBy: { priority: 'desc' },
    });

    if (providers.length === 0) {
      console.log('暂无 AI Provider 配置');
      return;
    }

    console.log(`找到 ${providers.length} 个 AI Provider:\n`);

    providers.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   类型: ${p.type}`);
      console.log(`   Endpoint: ${p.endpoint}`);
      console.log(`   优先级: ${p.priority}`);
      console.log(`   状态: ${p.status}`);
      console.log(`   首选: ${p.isDefault}`);
      console.log(`   模型数量: ${p.supportedModels.length}`);
      console.log(`   能力: ${p.capabilities.join(', ')}`);
      console.log(`   配置: ${p.config ? JSON.stringify(p.config) : '无'}`);
      console.log(`   创建时间: ${p.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
