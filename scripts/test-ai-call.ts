/**
 * 测试自动化流程中的 AI 调用
 */

import { PrismaClient } from '@prisma/client';
import { callAI } from '../src/services/ai-provider';

const prisma = new PrismaClient();

async function testAI() {
  try {
    // 获取用户的 AI Provider
    const providers = await prisma.aIProvider.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    if (providers.length === 0) {
      console.log('No active AI providers found');
      return;
    }

    console.log(`Found ${providers.length} active AI providers:`);
    providers.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.type}) - Priority: ${p.priority}`);
    });

    // 选择 Test Provider（如果存在）
    const testProvider = providers.find(p => p.name === 'Test Provider');
    if (!testProvider) {
      console.log('\nTest Provider not found. Please create it first.');
      return;
    }

    const provider = testProvider;
    console.log(`\nSelected: ${provider.name}`);
    console.log(`Provider created by: ${provider.createdById}`);

    // 使用 Provider 的创建者 ID
    const userId = provider.createdById;

    console.log(`\nTesting AI call with user ID: ${userId}`);

    // 测试 AI 调用
    const { response, tokensUsed, latencyMs } = await callAI(
      provider.id,
      provider.supportedModels[0] || 'default',
      '你好，请简单介绍一下你自己。',
      {
        modelType: 'CHAT' as any,
        taskId: '',
        context: 'modeling',
      },
      userId
    );

    console.log('\nAI Response:');
    console.log(response);
    console.log(`\nTokens used: ${tokensUsed}`);
    console.log(`Latency: ${latencyMs}ms`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAI();
