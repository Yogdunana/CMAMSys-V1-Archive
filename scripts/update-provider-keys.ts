/**
 * 更新 AI Provider 的真实 API Key
 * ⚠️  此脚本已废弃，原因：硬编码的 API Key 存在安全风险
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProviderKeys() {
  try {
    console.log('⚠️  This script has been deprecated due to security concerns.');
    console.log('');
    console.log('    Please use one of these methods instead:');
    console.log('    1. Add AI Providers via the UI (recommended)');
    console.log('    2. Set environment variables and run pnpm prisma:seed');
    console.log('       DEEPSEEK_API_KEY=your_key ALIYUN_API_KEY=your_key VOLCENGINE_API_KEY=your_key pnpm prisma:seed');
    console.log('');
    console.log('    For updating existing providers, use the API:');
    console.log('    PUT /api/ai-providers/{id}');
    console.log('    Body: { "apiKey": "new_key" }');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProviderKeys();
