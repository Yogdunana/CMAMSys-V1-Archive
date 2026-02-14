/**
 * 修复阿里百炼和豆包的配置
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProviders() {
  try {
    // 修复阿里百炼
    const aliyun = await prisma.aIProvider.findFirst({
      where: { name: '阿里百炼' },
    });

    if (aliyun) {
      const config = {
        endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
      };

      await prisma.aIProvider.update({
        where: { id: aliyun.id },
        data: {
          endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          supportedModels: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
          config,
        },
      });
      console.log('✓ 修复阿里百炼配置');
    }

    // 修复豆包-Volcengine
    const volcengine = await prisma.aIProvider.findFirst({
      where: { name: '豆包-Volcengine' },
    });

    if (volcengine) {
      const config = {
        endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
        endpointMapping: {
          'doubao-pro-4k': 'ep-20260207034939-n2p59',
          'doubao-pro-32k': 'ep-20260207034939-n2p59',
          'doubao-lite-4k': 'ep-20260207034939-n2p59',
        },
      };

      await prisma.aIProvider.update({
        where: { id: volcengine.id },
        data: {
          endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
          supportedModels: ['doubao-pro-4k', 'doubao-pro-32k', 'doubao-lite-4k'],
          config,
        },
      });
      console.log('✓ 修复豆包-Volcengine配置');
    }

    console.log('\n所有 Provider 配置已修复！');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProviders();
