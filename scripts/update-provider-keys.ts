/**
 * 更新 AI Provider 的真实 API Key
 */

import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function updateProviderKeys() {
  try {
    const apiKeys = {
      'DeepSeek-Reasoner': 'sk-caed24c0213947838ff9c4ff4c5883f0',
      '阿里百炼': 'sk-14b1cb4072a24f9b9ee55d95977d1e98',
      '豆包-Volcengine': 'b91ae0e0-85a5-4e10-8297-4b05fd670fe6',
    };

    for (const [name, key] of Object.entries(apiKeys)) {
      const provider = await prisma.aIProvider.findFirst({
        where: { name },
      });

      if (provider) {
        const encryptedKey = encrypt(key);
        await prisma.aIProvider.update({
          where: { id: provider.id },
          data: { apiKey: encryptedKey },
        });
        console.log(`✓ Updated ${name}`);
      } else {
        console.log(`✗ Provider not found: ${name}`);
      }
    }

    // 同时更新火山引擎的 endpoint
    const volcengine = await prisma.aIProvider.findFirst({
      where: { name: '豆包-Volcengine' },
    });

    if (volcengine) {
      await prisma.aIProvider.update({
        where: { id: volcengine.id },
        data: { endpoint: 'ep-20260207034939-n2p59' },
      });
      console.log(`✓ Updated 豆包-Volcengine endpoint`);
    }

    console.log('\nAll API keys updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProviderKeys();
