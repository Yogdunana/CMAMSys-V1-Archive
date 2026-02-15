import { decrypt } from '../src/lib/encryption';
import prisma from '../src/lib/prisma';

/**
 * 测试火山引擎推理端点
 */
async function testVolcengineEndpoint() {
  console.log('🧪 Testing Volcengine with inference endpoint...\n');

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
  console.log(`   Config: ${JSON.stringify(volcengine.config, null, 2)}`);
  console.log('');

  // 解密 API Key
  const apiKey = decrypt(volcengine.apiKey);
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log('');

  // 获取推理端点
  const endpointMapping = volcengine.config?.endpointMapping || {};
  const inferenceEndpoint = endpointMapping['doubao-pro-128k'];

  console.log(`🎯 Inference Endpoint: ${inferenceEndpoint}`);
  console.log('');

  if (!inferenceEndpoint) {
    console.error('❌ No inference endpoint found');
    return;
  }

  // 尝试直接使用推理端点调用
  try {
    console.log('🔍 Calling inference endpoint...\n');

    const response = await fetch(`https://ark.cn-beijing.volces.com/api/v3/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: inferenceEndpoint,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "Success" only.',
          },
        ],
        stream: false,
        max_tokens: 10,
      }),
    });

    const responseText = await response.text();

    console.log(`Status: ${response.status}`);
    console.log(`Response: ${responseText.substring(0, 500)}...`);
    console.log('');

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ SUCCESS!');
      console.log(`Content: ${data.choices?.[0]?.message?.content}`);
      console.log('');
      console.log('💡 Solution: Update the model name to use the inference endpoint');
      console.log(`   Model name should be: ${inferenceEndpoint}`);
    } else {
      console.error('❌ Failed');
      console.error('Error details:', JSON.stringify(JSON.parse(responseText), null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // 尝试另一个方法：直接调用推理端点 URL
  console.log('\n\n🔍 Trying direct inference endpoint URL...\n');

  try {
    const response = await fetch(`https://${inferenceEndpoint}.ark.cn-beijing.volces.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'doubao-pro-128k',
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "Success" only.',
          },
        ],
        stream: false,
        max_tokens: 10,
      }),
    });

    const responseText = await response.text();

    console.log(`Status: ${response.status}`);
    console.log(`Response: ${responseText.substring(0, 500)}...`);
    console.log('');

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ SUCCESS with direct endpoint URL!');
      console.log(`Content: ${data.choices?.[0]?.message?.content}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testVolcengineEndpoint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
