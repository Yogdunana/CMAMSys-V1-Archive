/**
 * API Rate Limiting Middleware with Redis Support
 * API 速率限制中间件（支持 Redis）
 *
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisRateLimit, RedisRateLimitConfig } from './redis-client';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  skipSuccessfulRequests?: boolean; // 是否跳过成功请求的计数
  skipFailedRequests?: boolean; // 是否跳过失败请求的计数
}

interface RateLimitResult {
  blocked: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

interface RateLimitOptions {
  request: NextRequest;
  preset?: 'auth' | 'general' | 'aiChat' | 'modelingTask' | 'upload' | 'strict';
  config?: RateLimitConfig;
  identifier?: string;
  keyPrefix?: string;
}

// 预设配置
export const MiddlewarePresets = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 分钟
    maxRequests: 5,
  },
  general: {
    windowMs: 15 * 60 * 1000, // 15 分钟
    maxRequests: 100,
  },
  aiChat: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 20,
  },
  modelingTask: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 5,
  },
  upload: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 3,
  },
  strict: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 10,
  },
  // 新增预设
  highFrequency: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 60,
  },
  lowFrequency: {
    windowMs: 60 * 60 * 1000, // 1 小时
    maxRequests: 1000,
  },
};

// 内存存储（作为 Redis 不可用时的回退）
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * 清理过期的速率限制记录
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * 定期清理过期记录（每 5 分钟）
 */
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
}

/**
 * 获取请求标识符（IP 或用户 ID）
 */
function getIdentifier(request: NextRequest, customIdentifier?: string): string {
  if (customIdentifier) {
    return customIdentifier;
  }

  // 优先使用 X-Forwarded-For 中的 IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';

  // 尝试从 Authorization header 获取用户 ID
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // 这里可以解析 JWT token 获取 user ID
    // 为了简化，我们暂时不在这里解析
  }

  return ip;
}

/**
 * 路径标准化
 */
function normalizePath(path: string): string {
  // 移除查询参数
  return path.split('?')[0];
}

/**
 * 内存速率限制实现（回退方案）
 */
function memoryRateLimit(
  key: string,
  config: RateLimitConfig
): { blocked: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetTime <= now) {
    // 创建新记录或重置已过期的记录
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      blocked: false,
      remaining: config.maxRequests - 1,
      resetAt: new Date(now + config.windowMs),
    };
  }

  // 增加计数
  record.count++;

  // 检查是否超过限制
  if (record.count > config.maxRequests) {
    return {
      blocked: true,
      remaining: 0,
      resetAt: new Date(record.resetTime),
    };
  }

  return {
    blocked: false,
    remaining: config.maxRequests - record.count,
    resetAt: new Date(record.resetTime),
  };
}

/**
 * 应用速率限制
 */
export async function applyRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { request, preset, config, identifier, keyPrefix = 'ratelimit' } = options;

  // 获取配置
  const limitConfig = config || MiddlewarePresets[preset || 'general'];

  if (!limitConfig) {
    throw new Error('Rate limit config is required');
  }

  const id = getIdentifier(request, identifier);
  const path = normalizePath(request.nextUrl.pathname);
  const key = `${keyPrefix}:${path}:${id}`;

  // 尝试使用 Redis
  if (process.env.REDIS_URL && process.env.ENABLE_DISTRIBUTED_RATE_LIMIT === 'true') {
    const result = await redisRateLimit({
      keyPrefix: `${keyPrefix}:${path}`,
      window: Math.floor(limitConfig.windowMs / 1000),
      limit: limitConfig.maxRequests,
      identifier: id,
    });

    return {
      blocked: !result.allowed,
      limit: limitConfig.maxRequests,
      remaining: result.remaining,
      resetAt: result.resetAt,
    };
  }

  // 回退到内存实现
  const result = memoryRateLimit(key, limitConfig);

  return {
    blocked: result.blocked,
    limit: limitConfig.maxRequests,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

/**
 * 重置速率限制（用于管理员）
 */
export async function resetRateLimit(identifier: string, path?: string): Promise<boolean> {
  const key = path
    ? `ratelimit:${path}:${identifier}`
    : Array.from(rateLimitStore.keys()).find((k) => k.endsWith(`:${identifier}`));

  if (key) {
    rateLimitStore.delete(key);
    return true;
  }

  return false;
}

/**
 * 获取当前的速率限制状态
 */
export async function getRateLimitStatus(
  request: NextRequest,
  identifier?: string
): Promise<RateLimitResult | null> {
  const id = getIdentifier(request, identifier);
  const path = normalizePath(request.nextUrl.pathname);
  const key = `ratelimit:${path}:${id}`;

  const record = rateLimitStore.get(key);

  if (!record) {
    return null;
  }

  return {
    blocked: false,
    limit: 100, // 默认限制，实际应该从配置获取
    remaining: Math.max(0, 100 - record.count),
    resetAt: new Date(record.resetTime),
  };
}

export default applyRateLimit;
