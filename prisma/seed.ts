import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('REDACTED_PASSWORD', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cmamsys.com' },
    update: {},
    create: {
      email: 'admin@cmamsys.com',
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      authProvider: 'LOCAL',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create DeepSeek provider
  const deepseek = await prisma.aIProvider.upsert({
    where: { id: 'default-deepseek' },
    update: {},
    create: {
      id: 'default-deepseek',
      name: 'DeepSeek (Default)',
      type: 'DEEPSEEK',
      apiKey: 'sk-REDACTED',
      endpoint: 'https://api.deepseek.com/v1',
      priority: 8,
      isDefault: true,
      status: 'ACTIVE',
      supportedModels: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
      capabilities: ['chat', 'completion', 'reasoning', 'coding'],
      createdBy: { connect: { id: admin.id } },
    },
  });

  console.log('✅ Created DeepSeek provider');

  // Create Aliyun provider
  const aliyun = await prisma.aIProvider.upsert({
    where: { id: 'default-aliyun' },
    update: {},
    create: {
      id: 'default-aliyun',
      name: '阿里云通义千问',
      type: 'ALIYUN',
      apiKey: 'sk-REDACTED',
      endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      priority: 9,
      isDefault: false,
      status: 'ACTIVE',
      supportedModels: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
      capabilities: ['chat', 'completion', 'reasoning'],
      createdBy: { connect: { id: admin.id } },
    },
  });

  console.log('✅ Created Aliyun provider');

  // Create Volcengine provider
  const volcengine = await prisma.aIProvider.upsert({
    where: { id: 'default-volcengine' },
    update: {},
    create: {
      id: 'default-volcengine',
      name: '火山引擎豆包',
      type: 'VOLCENGINE',
      apiKey: 'REDACTED-UUID',
      endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
      priority: 10,
      isDefault: false,
      status: 'ACTIVE',
      supportedModels: [
        'doubao-pro-32k',
        'doubao-pro-128k',
        'doubao-pro-256k',
        'doubao-lite-32k',
        'doubao-lite-128k',
        'doubao-speed-128k',
      ],
      capabilities: ['chat', 'completion', 'reasoning'],
      config: {
        endpointMapping: {
          'doubao-pro-128k': 'ep-20260207034939-n2p59',
        },
      },
      createdBy: { connect: { id: admin.id } },
    },
  });

  console.log('✅ Created Volcengine provider');

  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Email: admin@cmamsys.com');
  console.log('   Password: REDACTED_PASSWORD');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
