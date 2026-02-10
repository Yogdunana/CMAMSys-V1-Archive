/**
 * Redis Client for Distributed Rate Limiting
 * Redis 客户端，用于分布式速率限制
 *
 * @version 1.0.0
 */

import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

/**
 * 获取 Redis 客户端实例
 */
export function getRedisClient(): Redis | null {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableReadyCheck: true,
      });

      redisClient.on('error', (error) => {
        console.error('Redis Client Error:', error);
      });

      redisClient.on('connect', () => {
        console.log('Redis Client Connected');
      });

      redisClient.on('ready', () => {
        console.log('Redis Client Ready');
      });

      redisClient.on('close', () => {
        console.log('Redis Client Connection Closed');
      });
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      redisClient = null;
    }
  }

  return redisClient;
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Redis 速率限制配置
 */
export interface RedisRateLimitConfig {
  /** 速率限制键前缀 */
  keyPrefix: string;
  /** 时间窗口（秒） */
  window: number;
  /** 最大请求数 */
  limit: number;
  /** 标识符（用户 ID 或 IP） */
  identifier: string;
}

/**
 * 使用 Redis 实现分布式速率限制
 */
export async function redisRateLimit(
  config: RedisRateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const client = getRedisClient();

  if (!client) {
    // 如果 Redis 不可用，回退到本地实现
    console.warn('Redis not available, falling back to local rate limiting');
    return {
      allowed: true,
      remaining: config.limit,
      resetAt: new Date(Date.now() + config.window * 1000),
    };
  }

  const key = `${config.keyPrefix}:${config.identifier}`;
  const now = Date.now();
  const windowStart = now - config.window * 1000;

  try {
    // 使用 Redis Lua 脚本确保原子性
    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local window_start = now - window * 1000

      -- 移除窗口外的请求
      redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

      -- 获取当前请求数
      local count = redis.call('ZCARD', key)

      -- 检查是否超过限制
      if count < limit then
        -- 添加当前请求
        redis.call('ZADD', key, now, now)
        -- 设置过期时间
        redis.call('EXPIRE', key, window)
        -- 返回剩余请求数
        return limit - count - 1
      else
        -- 获取最早请求的时间戳
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        return -(oldest[2] or window_start)
      end
    `;

    const result = await client.eval(
      script,
      1,
      key,
      now,
      config.window,
      config.limit
    );

    if (typeof result === 'number' && result >= 0) {
      // 允许请求
      return {
        allowed: true,
        remaining: result,
        resetAt: new Date(now + config.window * 1000),
      };
    } else {
      // 拒绝请求
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(Math.abs(Number(result)) + config.window * 1000),
      };
    }
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // 发生错误时允许请求
    return {
      allowed: true,
      remaining: config.limit,
      resetAt: new Date(now + config.window * 1000),
    };
  }
}

/**
 * 清理过期的速率限制键（可选，用于维护）
 */
export async function cleanupExpiredRateLimitKeys(
  keyPrefix: string,
  olderThanDays: number = 7
): Promise<number> {
  const client = getRedisClient();

  if (!client) {
    return 0;
  }

  try {
    const keys = await client.keys(`${keyPrefix}:*`);
    let cleanedCount = 0;

    for (const key of keys) {
      const ttl = await client.ttl(key);
      if (ttl === -1) {
        // 永不过期的键，删除
        await client.del(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up rate limit keys:', error);
    return 0;
  }
}

export default getRedisClient;
