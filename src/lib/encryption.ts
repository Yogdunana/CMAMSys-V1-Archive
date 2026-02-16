/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;  // 128 bits for GCM authentication tag
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Derive encryption key from password using PBKDF2
 * 修复：增加迭代次数到 1,000,000 以增强安全性
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 1000000, KEY_LENGTH, 'sha256');
}

/**
 * Get encryption password from environment
 * 修复：强制使用独立的加密密钥，不回退到 JWT Secret
 */
function getEncryptionPassword(): string {
  const password = process.env.ENCRYPTION_KEY;
  if (!password) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  return password;
}

/**
 * Encrypt sensitive data (API keys, etc.)
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(getEncryptionPassword(), salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine: salt + iv + authTag + encrypted
    const combined = Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, 'hex')]);

    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  try {
    const combined = Buffer.from(encryptedData, 'base64');

    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, TAG_POSITION);
    const authTag = combined.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = combined.subarray(ENCRYPTED_POSITION);

    const key = deriveKey(getEncryptionPassword(), salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if a value is encrypted (heuristic check)
 */
export function isEncrypted(value: string): boolean {
  try {
    // Base64 encoded encrypted data should have a certain length
    // and should decode without error
    const decoded = Buffer.from(value, 'base64');
    return decoded.length >= ENCRYPTED_POSITION;
  } catch {
    return false;
  }
}

/**
 * Hash sensitive data for comparison (e.g., checking if API key matches)
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
