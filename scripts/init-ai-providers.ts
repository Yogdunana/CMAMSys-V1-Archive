import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// 简单的 AES 加密函数
function encryptApiKey(apiKey: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'cmamsys-encryption-key-2024-secure-256-bit', 'utf8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // 返回格式: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

async function main() {
  console.log('=== 初始化 AI Providers ===\n');

  // 获取管理员用户
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('找不到管理员用户');
    process.exit(1);
  }

  // 清除旧的 providers
  await prisma.aIProvider.deleteMany({
    where: { createdById: admin.id },
  });

  console.log('✅ 清除旧的 AI Providers');

  // 创建 AI Providers（使用模拟的 API keys）
  const providers = [
    {
      name: 'DeepSeek-Reasoner',
      type: 'DEEPSEEK' as const,
      apiKey: encryptApiKey('sk-deepseek-mock-key-123456'),
      endpoint: 'https://api.deepseek.com/v1',
      priority: 10,
      isDefault: true,
      status: 'ACTIVE' as const,
      supportedModels: ['deepseek-chat', 'deepseek-reasoner'],
      capabilities: ['chat', 'reasoning', 'code'],
      capabilityTags: ['数学建模', '推理', '代码生成'],
      scenarioTags: ['竞赛', '建模', '优化'],
    },
    {
      name: '豆包-Volcengine',
      type: 'VOLCENGINE' as const,
      apiKey: encryptApiKey('sk-volcengine-mock-key-789012'),
      endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
      priority: 8,
      isDefault: false,
      status: 'ACTIVE' as const,
      supportedModels: ['ep-20250101123456-xxx', 'doubao-pro-32k'],
      capabilities: ['chat', 'completion'],
      capabilityTags: ['通用对话', '文本生成'],
      scenarioTags: ['竞赛', '建模'],
    },
    {
      name: '阿里百炼',
      type: 'ALIYUN' as const,
      apiKey: encryptApiKey('sk-aliyun-mock-key-345678'),
      endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      priority: 6,
      isDefault: false,
      status: 'ACTIVE' as const,
      supportedModels: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
      capabilities: ['chat', 'completion'],
      capabilityTags: ['通用对话', '数据分析'],
      scenarioTags: ['竞赛', '建模', '数据分析'],
    },
  ];

  for (const provider of providers) {
    await prisma.aIProvider.create({
      data: {
        ...provider,
        createdById: admin.id,
      },
    });
    console.log(`✅ 创建 Provider: ${provider.name}`);
  }

  console.log(`\n=== 初始化完成 ===`);
  console.log(`已创建 ${providers.length} 个 AI Providers`);
  
  const allProviders = await prisma.aIProvider.findMany({
    where: { createdById: admin.id, status: 'ACTIVE' },
  });
  
  console.log('\n可用的 AI Providers:');
  allProviders.forEach((p, index) => {
    console.log(`  ${index + 1}. ${p.name} (${p.type}) - Priority: ${p.priority}`);
  });
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
