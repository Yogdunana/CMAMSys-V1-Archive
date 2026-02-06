import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple encryption function for seed script (same as src/lib/encryption.ts)
function encrypt(text: string): string {
  const ALGORITHM = 'aes-256-gcm';
  const KEY_LENGTH = 32;
  const IV_LENGTH = 16;
  const SALT_LENGTH = 64;
  const TAG_LENGTH = 16;
  const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
  const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = crypto.pbkdf2Sync('cmamsys-encryption-key-2024-secure-256-bit', salt, 100000, KEY_LENGTH, 'sha256');

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, 'hex')]);

  return combined.toString('base64');
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user ( Yogdunana)
  const hashedPassword = await bcrypt.hash('X-Duan0719', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'yogdunana@yogdunana.com' },
    update: {},
    create: {
      email: 'yogdunana@yogdunana.com',
      username: 'Yogdunana',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      authProvider: 'LOCAL',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // API Keys (from environment or default test keys)
  const deepseekKey = process.env.DEEPSEEK_API_KEY || 'sk-caed24c0213947838ff9c4ff4c5883f0';
  const aliyunKey = process.env.ALIYUN_API_KEY || 'sk-14b1cb4072a24f9b9ee55d95977d1e98';
  const volcengineKey = process.env.VOLCENGINE_API_KEY || 'b91ae0e0-85a5-4e10-8297-4b05fd670fe6';

  console.log('🔐 Encrypting API Keys...');
  const encryptedDeepSeek = encrypt(deepseekKey);
  const encryptedAliyun = encrypt(aliyunKey);
  const encryptedVolcengine = encrypt(volcengineKey);

  // Create DeepSeek provider
  const deepseek = await prisma.aIProvider.upsert({
    where: { id: 'default-deepseek' },
    update: {},
    create: {
      id: 'default-deepseek',
      name: 'DeepSeek (Default)',
      type: 'DEEPSEEK',
      apiKey: encryptedDeepSeek,
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
      apiKey: encryptedAliyun,
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
      apiKey: encryptedVolcengine,
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
  console.log('   Email: yogdunana@yogdunana.com');
  console.log('   Username: Yogdunana');
  console.log('   Password: X-Duan0719');
  console.log('');
  console.log('🔐 Security Note: All API Keys are encrypted with AES-256-GCM');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
