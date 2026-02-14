/**
 * 更新 AI Provider 的真实 API Key
 */

import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function updateProviderKeys() {
  try {
    const apiKeys = {
      'DeepSeek-Reasoner': 'sk-REDACTED',
      '阿里百炼': 'sk-REDACTED',
      '豆包-Volcengine': 'REDACTED-UUID',
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
