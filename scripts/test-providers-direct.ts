/**
 * 测试阿里百炼和豆包的 API 调用
 */

import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function testProviders() {
  try {
    // 测试阿里百炼
    const aliyun = await prisma.aIProvider.findFirst({
      where: { name: '阿里百炼' },
    });

    if (aliyun) {
      console.log('\n=== 测试阿里百炼 ===');
      const apiKey = decrypt(aliyun.apiKey);
      console.log(`API Key: ${apiKey.substring(0, 20)}...`);
      console.log(`Endpoint: ${aliyun.endpoint}`);
      console.log(`Models: ${aliyun.supportedModels.join(', ')}`);

      try {
        const response = await fetch(`${aliyun.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'qwen-plus',
            messages: [{ role: 'user', content: '你好，请简单介绍一下你自己。' }],
          }),
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));

        if (data.choices && data.choices[0]) {
          console.log(`\nContent: ${data.choices[0].message.content.substring(0, 200)}...`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // 测试豆包
    const volcengine = await prisma.aIProvider.findFirst({
      where: { name: '豆包-Volcengine' },
    });

    if (volcengine) {
      console.log('\n=== 测试豆包-Volcengine ===');
      const apiKey = decrypt(volcengine.apiKey);
      console.log(`API Key: ${apiKey.substring(0, 20)}...`);
      console.log(`Endpoint: ${volcengine.endpoint}`);
      console.log(`Config:`, JSON.stringify(volcengine.config, null, 2));

      try {
        const model = volcengine.supportedModels[0];
        const response = await fetch(`${volcengine.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: '你好，请简单介绍一下你自己。' }],
          }),
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));

        if (data.choices && data.choices[0]) {
          console.log(`\nContent: ${data.choices[0].message.content.substring(0, 200)}...`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProviders();
