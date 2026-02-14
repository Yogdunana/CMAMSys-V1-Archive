/**
 * 创建测试 AI Provider
 */

import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function createTestProvider() {
  try {
    // 获取第一个用户 ID
    const user = await prisma.user.findFirst({
      where: { username: 'Yogdunana' },
    });

    if (!user) {
      console.log('User Yogdunana not found');
      return;
    }

    // 创建一个测试 Provider（使用模拟的 API Key）
    const testApiKey = 'sk-test-1234567890abcdef';
    const encryptedApiKey = encrypt(testApiKey);

    const provider = await prisma.aIProvider.create({
      data: {
        name: 'Test Provider',
        type: 'DEEPSEEK',
        apiKey: encryptedApiKey,
        endpoint: 'https://api.deepseek.com',
        priority: 0,
        isDefault: false,
        status: 'ACTIVE',
        supportedModels: ['deepseek-chat', 'deepseek-coder'],
        capabilities: ['chat', 'code-generation'],
        capabilityTags: ['测试', '代码生成'],
        scenarioTags: ['测试', '建模'],
        createdById: user.id,
      },
    });

    console.log(`Test provider created: ${provider.name}`);
    console.log(`  Provider ID: ${provider.id}`);
    console.log(`  Encrypted API Key: ${provider.apiKey.substring(0, 20)}...`);

    // 测试解密
    const { decrypt } = await import('../src/lib/encryption');
    const decrypted = decrypt(provider.apiKey);
    console.log(`  Decrypted API Key: ${decrypted}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProvider();
