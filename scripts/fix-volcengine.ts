import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing Volcengine AI Provider...\n');

  // 查找火山引擎 Provider
  const volcengine = await prisma.aIProvider.findUnique({
    where: { id: 'default-volcengine' },
  });

  if (!volcengine) {
    console.error('❌ Volcengine provider not found');
    process.exit(1);
  }

  console.log('📊 Current Configuration:');
  console.log(`   Supported Models: ${volcengine.supportedModels?.join(', ')}`);
  console.log(`   Endpoint Mapping: ${JSON.stringify(volcengine.config?.endpointMapping, null, 2)}`);

  // 更新配置：只保留有端点的模型
  const updatedVolcengine = await prisma.aIProvider.update({
    where: { id: 'default-volcengine' },
    data: {
      supportedModels: ['doubao-pro-128k'], // 只保留有端点的模型
      config: {
        endpointMapping: {
          'doubao-pro-128k': 'ep-20260207034939-n2p59', // 保留现有的端点
        },
      },
    },
  });

  console.log('\n✅ Updated Configuration:');
  console.log(`   Supported Models: ${updatedVolcengine.supportedModels?.join(', ')}`);
  console.log(`   Endpoint Mapping: ${JSON.stringify(updatedVolcengine.config?.endpointMapping, null, 2)}`);

  // 检查 DeepSeek 是否为默认 Provider
  console.log('\n🔍 Checking default provider...');
  const deepseek = await prisma.aIProvider.findUnique({
    where: { id: 'default-deepseek' },
  });

  if (deepseek) {
    console.log(`   DeepSeek is default: ${deepseek.isDefault}`);
    console.log(`   DeepSeek models: ${deepseek.supportedModels?.join(', ')}`);
  }

  console.log('\n✅ AI Provider fix completed!');
  console.log('\n💡 Tip: DeepSeek is set as default provider with models: deepseek-chat, deepseek-reasoner, deepseek-coder');
  console.log('   These models should work correctly.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
