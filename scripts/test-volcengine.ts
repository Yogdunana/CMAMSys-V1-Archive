import { decrypt } from '../src/lib/encryption';
import prisma from '../src/lib/prisma';

/**
 * 测试火山引擎 API Key 和模型
 */
async function testVolcengine() {
  console.log('🧪 Testing Volcengine API...\n');

  // 获取火山引擎 Provider
  const volcengine = await prisma.aIProvider.findUnique({
    where: { id: 'default-volcengine' },
  });

  if (!volcengine) {
    console.error('❌ Volcengine provider not found');
    return;
  }

  console.log('📋 Provider Info:');
  console.log(`   Name: ${volcengine.name}`);
  console.log(`   Endpoint: ${volcengine.endpoint}`);
  console.log(`   Models: ${volcengine.supportedModels?.join(', ')}`);
  console.log(`   Config: ${JSON.stringify(volcengine.config, null, 2)}`);
  console.log('');

  // 解密 API Key
  const apiKey = decrypt(volcengine.apiKey);
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log('');

  // 尝试不同的模型名称
  const modelsToTest = [
    'doubao-pro-32k',
    'doubao-pro-128k',
    'doubao-pro-256k',
    'doubao-lite-32k',
    'doubao-lite-128k',
    'doubao-speed-128k',
    'doubao-pro-4k',
    'doubao-pro',
    'doubao',
  ];

  console.log('🔍 Testing different models...\n');

  for (const model of modelsToTest) {
    console.log(`Testing model: ${model}`);

    try {
      const response = await fetch(`${volcengine.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
          stream: false,
          max_tokens: 10,
        }),
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log(`   ✅ SUCCESS! Model ${model} is available`);
        console.log(`   Response: ${responseText.substring(0, 200)}...`);
        console.log('');
        return model; // 返回第一个可用的模型
      } else {
        console.log(`   ❌ Failed (${response.status}): ${responseText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('');
  }

  console.log('\n❌ None of the models are available');
  console.log('💡 Possible reasons:');
  console.log('   1. API Key is invalid or expired');
  console.log('   2. The models are not available in your account');
  console.log('   3. The endpoint is incorrect');
  console.log('   4. Need to check Volcengine documentation for correct model names');
}

testVolcengine()
  .then((result) => {
    if (result) {
      console.log(`\n✅ Found working model: ${result}`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
