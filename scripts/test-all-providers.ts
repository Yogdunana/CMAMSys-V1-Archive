/**
 * 测试所有 AI Provider 的调用功能
 */

import { PrismaClient } from '@prisma/client';
import { callAI } from '../src/services/ai-provider';

const prisma = new PrismaClient();

async function testAllProviders() {
  try {
    // 获取用户 ID
    const user = await prisma.user.findFirst({
      where: { username: 'Yogdunana' },
    });

    if (!user) {
      console.log('User Yogdunana not found');
      return;
    }

    const providers = await prisma.aIProvider.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { priority: 'desc' },
    });

    console.log(`找到 ${providers.length} 个活跃的 AI Provider\n`);

    for (const provider of providers) {
      console.log(`\n========================================`);
      console.log(`测试 ${provider.name}`);
      console.log(`========================================`);
      console.log(`Type: ${provider.type}`);
      console.log(`Model: ${provider.supportedModels[0]}`);
      console.log(`Endpoint: ${provider.endpoint}`);

      try {
        const startTime = Date.now();
        const { response, tokensUsed, latencyMs } = await callAI(
          provider.id,
          provider.supportedModels[0],
          '请用一句话介绍你自己。',
          {
            modelType: 'CHAT' as any,
            taskId: '',
            context: 'modeling',
          },
          user.id
        );

        const duration = Date.now() - startTime;

        console.log(`\n✅ 调用成功！`);
        console.log(`Response: ${response.substring(0, 150)}...`);
        console.log(`Tokens Used: ${tokensUsed}`);
        console.log(`Latency: ${latencyMs}ms`);
        console.log(`Total Duration: ${duration}ms`);
      } catch (error) {
        console.log(`\n❌ 调用失败`);
        console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`\n\n========================================`);
    console.log(`测试完成！`);
    console.log(`========================================`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllProviders();
