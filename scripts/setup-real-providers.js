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
    console.log('⚠️  This script has been deprecated due to security concerns.');
    console.log('    Please use the UI to add AI Providers manually.');
    console.log('');
    console.log('    Alternative: Set environment variables and run pnpm prisma:seed');
    console.log('    DEEPSEEK_API_KEY=your_key pnpm prisma:seed');
    console.log('    ALIYUN_API_KEY=your_key pnpm prisma:seed');
    console.log('    VOLCENGINE_API_KEY=your_key pnpm prisma:seed');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
