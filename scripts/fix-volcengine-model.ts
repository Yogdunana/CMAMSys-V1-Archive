/**
 * 修复豆包的模型名称
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixVolcengineModel() {
  try {
    const volcengine = await prisma.aIProvider.findFirst({
      where: { name: '豆包-Volcengine' },
    });

    if (volcengine) {
      // 使用 endpoint 名称作为模型名称
      const modelName = 'ep-20260207034939-n2p59';

      await prisma.aIProvider.update({
        where: { id: volcengine.id },
        data: {
          supportedModels: [modelName],
          config: {
            endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
            endpointMapping: {
              [modelName]: modelName,
            },
          },
        },
      });

      console.log(`✓ 豆包模型名称已修复: ${modelName}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVolcengineModel();
