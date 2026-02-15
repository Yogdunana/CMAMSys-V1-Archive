import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing Volcengine Provider configuration...\n');

  // 获取火山引擎 Provider
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
  console.log('');

  // 获取推理端点 ID
  const inferenceEndpoint = volcengine.config?.endpointMapping?.['doubao-pro-128k'];

  if (!inferenceEndpoint) {
    console.error('❌ No inference endpoint found');
    process.exit(1);
  }

  console.log(`🎯 Inference Endpoint: ${inferenceEndpoint}`);
  console.log('');

  // 更新配置：将推理端点 ID 作为模型名称
  const updatedProvider = await prisma.aIProvider.update({
    where: { id: 'default-volcengine' },
    data: {
      supportedModels: [inferenceEndpoint], // 使用推理端点 ID
      config: {
        endpointMapping: {
          [inferenceEndpoint]: inferenceEndpoint, // 自引用
        },
        displayName: '火山引擎豆包',
        originalModel: 'doubao-pro-128k', // 保留原始模型名称供参考
      },
    },
  });

  console.log('✅ Updated Configuration:');
  console.log(`   Supported Models: ${updatedProvider.supportedModels?.join(', ')}`);
  console.log(`   Endpoint Mapping: ${JSON.stringify(updatedProvider.config?.endpointMapping, null, 2)}`);
  console.log(`   Display Name: ${updatedProvider.config?.displayName}`);
  console.log(`   Original Model: ${updatedProvider.config?.originalModel}`);
  console.log('');

  console.log('✅ Volcengine Provider configuration fixed!');
  console.log('💡 Now the model will use the inference endpoint ID instead of the model name');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
