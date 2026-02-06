/**
 * Cryptographic Utilities
 * Provides encryption, decryption, and MFA-related functions
 */

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key';
const ENCRYPTION_IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt text using AES-256-GCM
 */
export function encrypt(text: string): {
  iv: string;
  encrypted: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt text using AES-256-GCM
 */
export function decrypt(encrypted: string, iv: string, authTag: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate MFA secret key
 */
export function generateMfaSecret(): string {
  return crypto.randomBytes(20).toString('base32');
}

/**
 * Generate time-based OTP (TOTP)
 * Compatible with Google Authenticator, Authy, etc.
 */
export function generateTOTP(secret: string, timeStep: number = 30): string {
  const key = Buffer.from(secret, 'base32');
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const otp = (code % 1000000).toString();
  return otp.padStart(6, '0');
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(
  secret: string,
  token: string,
  window: number = 1
): boolean {
  for (let i = -window; i <= window; i++) {
    const timeStep = 30; // 30 seconds
    const time = Math.floor(Date.now() / 1000 / timeStep) + i;

    const key = Buffer.from(secret, 'base32');
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(time));

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();

    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const code =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const otp = (code % 1000000).toString();
    const paddedOtp = otp.padStart(6, '0');

    if (paddedOtp === token) {
      return true;
    }
  }

  return false;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Hash string (for file integrity, etc.)
 */
export function hashString(content: string, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm).update(content).digest('hex');
}

/**
 * Hash file
 */
export function hashFile(filePath: string, algorithm: string = 'sha256'): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = require('fs').createReadStream(filePath);

    stream.on('data', (data: Buffer) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
