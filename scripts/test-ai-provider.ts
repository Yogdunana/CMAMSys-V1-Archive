import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 测试 AI Provider 调用 ===\n');

  // 1. 获取一个 AI Provider
  const provider = await prisma.aIProvider.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!provider) {
    console.error('没有找到可用的 AI Provider');
    return;
  }

  console.log(`找到 Provider: ${provider.name} (${provider.type})`);
  console.log(`ID: ${provider.id}`);
  console.log('');

  // 2. 尝试调用 AI API
  console.log('尝试调用 AI API...\n');

  // 检查 API Key 是否解密
  console.log(`API Key 加密状态: ${provider.apiKey ? '有值' : '空'}`);
  console.log(`API Key 长度: ${provider.apiKey?.length || 0}`);
  console.log(`API Key 前缀: ${provider.apiKey?.substring(0, 10)}...`);
  console.log('');

  // 3. 尝试解密 API Key
  // 检查项目中是否有解密函数
  console.log('尝试解密 API Key...');
  console.log('');

  // 4. 检查 AIRequest 表
  console.log('### 检查 AIRequest 记录 ###');
  const requests = await prisma.aIRequest.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log(`找到 ${requests.length} 条请求记录\n`);
  requests.forEach((req, index) => {
    console.log(`[${index + 1}] Request ID: ${req.id}`);
    console.log(`    模型: ${req.modelName}`);
    console.log(`    状态: ${req.status}`);
    console.log(`    Token使用: ${req.tokensUsed}`);
    console.log(`    延迟: ${req.latencyMs}ms`);
    console.log(`    错误: ${req.errorMessage || '无'}`);
    console.log(`    响应长度: ${req.response?.length || 0}`);
    console.log('');
  });

  // 5. 检查最新的请求的 prompt 和 response
  if (requests.length > 0) {
    const latestRequest = requests[0];
    console.log('### 最新请求详情 ###');
    console.log(`Prompt: ${latestRequest.prompt.substring(0, 300)}${latestRequest.prompt.length > 300 ? '...' : ''}`);
    console.log('');
    console.log(`Response: ${latestRequest.response?.substring(0, 300) || '(空)'}${latestRequest.response && latestRequest.response.length > 300 ? '...' : ''}`);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
