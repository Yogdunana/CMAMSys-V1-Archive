const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Simple decryption function
function decrypt(encryptedText) {
  const ALGORITHM = 'aes-256-gcm';
  const KEY_LENGTH = 32;
  const IV_LENGTH = 16;
  const SALT_LENGTH = 64;
  const TAG_LENGTH = 16;
  const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
  const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

  const combined = Buffer.from(encryptedText, 'base64');

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, TAG_POSITION);
  const authTag = combined.subarray(TAG_POSITION, ENCRYPTED_POSITION);
  const encrypted = combined.subarray(ENCRYPTED_POSITION);

  const key = crypto.pbkdf2Sync('cmamsys-encryption-key-2024-secure-256-bit', salt, 100000, KEY_LENGTH, 'sha256');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

async function main() {
  try {
    console.log('=== 验证 API Key 解密 ===\n');

    const providers = await prisma.aIProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });

    providers.forEach((p) => {
      console.log(`${p.name}:`);
      try {
        const decryptedKey = decrypt(p.apiKey);
        console.log(`   解密成功: ${decryptedKey}`);
      } catch (error) {
        console.log(`   解密失败: ${error.message}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
