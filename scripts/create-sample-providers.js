const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 获取管理员用户 ID
    const admin = await prisma.user.findFirst({
      where: { username: 'Yogdunana' },
    });

    if (!admin) {
      console.error('未找到管理员用户 Yogdunana');
      return;
    }

    console.log('正在创建示例 AI Provider 配置...');

    // 创建示例 Provider
    const providers = [
      {
        name: '火山引擎豆包（示例）',
        type: 'VOLCENGINE',
        apiKey: 'YOUR_API_KEY_HERE',
        endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
        priority: 100,
        isDefault: true,
        status: 'ACTIVE',
        supportedModels: ['doubao-pro-256k', 'doubao-pro-32k', 'doubao-lite-32k'],
        capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling'],
      },
      {
        name: '阿里云百炼（示例）',
        type: 'ALIYUN',
        apiKey: 'YOUR_API_KEY_HERE',
        endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        priority: 90,
        isDefault: false,
        status: 'ACTIVE',
        supportedModels: ['qwen-plus', 'qwen-max', 'qwen-turbo'],
        capabilities: ['text-generation', 'code-generation', 'reasoning'],
      },
      {
        name: 'DeepSeek（示例）',
        type: 'DEEPSEEK',
        apiKey: 'YOUR_API_KEY_HERE',
        endpoint: 'https://api.deepseek.com/v1',
        priority: 80,
        isDefault: false,
        status: 'ACTIVE',
        supportedModels: ['deepseek-chat', 'deepseek-coder', 'deepseek-v3'],
        capabilities: ['text-generation', 'code-generation', 'reasoning', 'math'],
      },
    ];

    for (const provider of providers) {
      await prisma.aIProvider.create({
        data: {
          ...provider,
          createdById: admin.id,
        },
      });
      console.log(`✓ 已创建: ${provider.name}`);
    }

    console.log('\n示例配置创建完成！');
    console.log('注意：这些是示例配置，API Key 需要替换为实际的密钥。');

  } catch (error) {
    console.error('创建失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
