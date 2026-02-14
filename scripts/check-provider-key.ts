/**
 * 检查 AI Provider 的 API Key
 */

import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function checkProviderKey() {
  try {
    const providers = await prisma.aIProvider.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    for (const provider of providers) {
      console.log(`\n${provider.name} (${provider.type}):`);
      console.log(`  API Key (encrypted): ${provider.apiKey.substring(0, 20)}...`);

      try {
        const decrypted = decrypt(provider.apiKey);
        console.log(`  API Key (decrypted): ${decrypted.substring(0, 20)}...`);
        console.log(`  Status: OK`);
      } catch (error) {
        console.log(`  API Key (decrypted): FAILED`);
        console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviderKey();
