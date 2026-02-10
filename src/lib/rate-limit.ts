/**
 * API Rate Limiting Middleware
 * API 速率限制中间件
 * 支持基于 IP 和用户的速率限制
 */

import { NextRequest, NextResponse } from 'next/server';

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
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// 内存存储（生产环境建议使用 Redis）
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
function getRequestIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // 从请求头获取真实 IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * 检查速率限制
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  // 如果没有记录或已过期，创建新记录
  if (!record || record.resetTime <= now) {
    const newRecord: RateLimitStore = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: newRecord.resetTime,
    };
  }
  
  // 检查是否超过限制
  if (record.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: record.resetTime,
    };
  }
  
  // 增加计数
  record.count++;
  rateLimitStore.set(identifier, record);
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: record.resetTime,
  };
}

/**
 * 速率限制中间件
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (
    request: NextRequest,
    userId?: string
  ): Promise<NextResponse | null> => {
    const identifier = getRequestIdentifier(request, userId);
    const result = checkRateLimit(identifier, config);
    
    // 设置响应头
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
    
    if (!result.success) {
      headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString());
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
        },
        {
          status: 429,
          headers,
        }
      );
    }
    
    return null; // 允许请求继续
  };
}

/**
 * 预定义的速率限制配置
 */
export const RateLimitPresets: Record<string, RateLimitConfig> = {
  // 通用 API：每 15 分钟 100 次请求
  general: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  
  // 认证 API：每 15 分钟 10 次请求
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  },
  
  // AI 聊天 API：每分钟 20 次请求
  aiChat: {
    windowMs: 60 * 1000,
    maxRequests: 20,
  },
  
  // 建模任务 API：每小时 30 次请求
  modelingTask: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 30,
  },
  
  // 上传 API：每 10 分钟 5 次请求
  upload: {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  },
  
  // 严格限制：每分钟 5 次请求
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
};

/**
 * 获取预设速率限制器
 */
export function getRateLimiter(preset: keyof typeof RateLimitPresets) {
  return createRateLimiter(RateLimitPresets[preset]);
}

/**
 * 手动重置速率限制（管理员功能）
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * 获取当前速率限制状态
 */
export function getRateLimitStatus(identifier: string): RateLimitStore | undefined {
  return rateLimitStore.get(identifier);
}

/**
 * 批量重置（清理所有记录）
 */
export function resetAllRateLimits(): void {
  rateLimitStore.clear();
}
