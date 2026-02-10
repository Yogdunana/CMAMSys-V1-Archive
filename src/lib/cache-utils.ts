/**
 * Cache Utilities
 * 缓存键生成和哈希优化
 */

import crypto from 'crypto';

/**
 * 生成缓存键（原始键 + 哈希）
 */
export function generateCacheKey(problemType: string, problemContent: string): {
  originalKey: string;
  hashKey: string;
} {
  const originalKey = `${problemType}:${problemContent.substring(0, 100)}`;
  const hashKey = crypto.createHash('sha256').update(originalKey).digest('hex');
  
  return {
    originalKey,
    hashKey,
  };
}

/**
 * 生成通用哈希键
 */
export function generateHashKey(...inputs: string[]): string {
  const combined = inputs.join(':');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * 生成时间窗口哈希键（用于缓存时间窗口数据）
 */
export function generateTimeWindowHash(
  key: string,
  windowSizeMinutes: number = 60
): string {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSizeMinutes * 60 * 1000));
  return generateHashKey(key, windowStart.toString());
}

/**
 * 生成用户特定哈希键
 */
export function generateUserHashKey(
  userId: string,
  resourceType: string,
  resourceId?: string
): string {
  const parts = [userId, resourceType];
  if (resourceId) {
    parts.push(resourceId);
  }
  return generateHashKey(...parts);
}

/**
 * 验证哈希键格式
 */
export function isValidHashKey(hashKey: string): boolean {
  // SHA-256 哈希应该是 64 个十六进制字符
  return /^[a-f0-9]{64}$/i.test(hashKey);
}

/**
 * 缓存键前缀常量
 */
export const CacheKeyPrefix = {
  DISCUSSION: 'discussion',
  CODE_GENERATION: 'code_gen',
  MODELING_TASK: 'modeling_task',
  AI_RESPONSE: 'ai_response',
  USER_SESSION: 'user_session',
  RATE_LIMIT: 'rate_limit',
} as const;

/**
 * 生成带前缀的缓存键
 */
export function generatePrefixedCacheKey(
  prefix: keyof typeof CacheKeyPrefix,
  ...parts: string[]
): string {
  const prefixStr = CacheKeyPrefix[prefix];
  return generateHashKey(prefixStr, ...parts);
}

/**
 * 缓存过期时间常量（秒）
 */
export const CacheExpiry = {
  SHORT: 60,          // 1 分钟
  MEDIUM: 300,        // 5 分钟
  LONG: 3600,         // 1 小时
  VERY_LONG: 86400,   // 24 小时
  WEEK: 604800,       // 7 天
} as const;

/**
 * 生成缓存过期时间
 */
export function getCacheExpirySeconds(
  duration: keyof typeof CacheExpiry = CacheExpiry.MEDIUM
): number {
  return CacheExpiry[duration];
}

/**
 * 生成过期日期
 */
export function getCacheExpiryDate(
  duration: keyof typeof CacheExpiry = CacheExpiry.MEDIUM
): Date {
  const seconds = getCacheExpirySeconds(duration);
  return new Date(Date.now() + seconds * 1000);
}
