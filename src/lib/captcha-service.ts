/**
 * Simple CAPTCHA Service
 * 简单验证码服务 - 生成和验证验证码
 */

import crypto from 'crypto';

export interface CaptchaResult {
  success: boolean;
  valid: boolean;
  error?: string;
}

// Store CAPTCHA in memory (in production, use Redis)
const captchaStore = new Map<string, CaptchaData>();

interface CaptchaData {
  code: string;
  expiresAt: Date;
  attempts: number;
}

/**
 * Generate a random CAPTCHA code
 */
function generateCaptchaCode(length: number = 6): string {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new CAPTCHA
 */
export function createCaptcha(expiryMinutes: number = 15): {
  id: string;
  code: string;
  expiresAt: Date;
} {
  const id = crypto.randomBytes(32).toString('hex');
  const code = generateCaptchaCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  captchaStore.set(id, {
    code,
    expiresAt,
    attempts: 0,
  });

  // Clean up expired CAPTCHAs periodically
  cleanExpiredCaptchas();

  return { id, code, expiresAt };
}

/**
 * Verify a CAPTCHA
 */
export function verifyCaptcha(id: string, userInput: string): CaptchaResult {
  const captcha = captchaStore.get(id);

  if (!captcha) {
    return {
      success: false,
      valid: false,
      error: 'CAPTCHA not found or has expired',
    };
  }

  // Check if expired
  if (captcha.expiresAt < new Date()) {
    captchaStore.delete(id);
    return {
      success: false,
      valid: false,
      error: 'CAPTCHA has expired',
    };
  }

  // Increment attempts
  captcha.attempts++;

  // Check if too many attempts
  if (captcha.attempts > 3) {
    captchaStore.delete(id);
    return {
      success: false,
      valid: false,
      error: 'Too many attempts. Please request a new CAPTCHA.',
    };
  }

  // Verify code
  if (captcha.code === userInput) {
    captchaStore.delete(id); // Remove after successful verification
    return {
      success: true,
      valid: true,
    };
  }

  return {
    success: false,
    valid: false,
    error: 'Invalid CAPTCHA code',
  };
}

/**
 * Clean up expired CAPTCHAs
 */
function cleanExpiredCaptchas(): void {
  const now = new Date();
  for (const [id, captcha] of captchaStore.entries()) {
    if (captcha.expiresAt < now) {
      captchaStore.delete(id);
    }
  }
}

/**
 * Get CAPTCHA statistics
 */
export function getCaptchaStats(): {
  total: number;
  expired: number;
  active: number;
} {
  const now = new Date();
  let expired = 0;
  let active = 0;

  for (const captcha of captchaStore.values()) {
    if (captcha.expiresAt < now) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    total: captchaStore.size,
    expired,
    active,
  };
}

/**
 * Clear all CAPTCHAs (for testing)
 */
export function clearAllCaptchas(): void {
  captchaStore.clear();
}
