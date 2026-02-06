const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Simple encryption function
function encrypt(text) {
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
  try {
    console.log('正在清除旧的 AI Provider 配置...');
    await prisma.aIProvider.deleteMany({});

    console.log('正在获取管理员用户...');
    const admin = await prisma.user.findFirst({
      where: { username: 'Yogdunana' },
    });

    if (!admin) {
      console.error('未找到管理员用户 Yogdunana');
      return;
    }

    console.log('正在加密 API Keys...');

    // 用户提供的真实 API Keys
    const deepseekKey = 'sk-caed24c0213947838ff9c4ff4c5883f0';
    const aliyunKey = 'sk-14b1cb4072a24f9b9ee55d95977d1e98';
    const volcengineKey = 'b91ae0e0-85a5-4e10-8297-4b05fd670fe6';

    const encryptedDeepSeek = encrypt(deepseekKey);
    const encryptedAliyun = encrypt(aliyunKey);
    const encryptedVolcengine = encrypt(volcengineKey);

    console.log('正在创建 AI Provider 配置...');

    // 创建 DeepSeek
    await prisma.aIProvider.create({
      data: {
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
        createdById: admin.id,
      },
    });
    console.log('✓ DeepSeek');

    // 创建阿里云
    await prisma.aIProvider.create({
      data: {
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
        createdById: admin.id,
      },
    });
    console.log('✓ 阿里云通义千问');

    // 创建火山引擎
    await prisma.aIProvider.create({
      data: {
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
        createdById: admin.id,
      },
    });
    console.log('✓ 火山引擎豆包');

    console.log('\n配置完成！');

  } catch (error) {
    console.error('配置失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
