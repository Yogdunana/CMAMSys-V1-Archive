/**
 * Rate Limiter Service
 * 请求频率限制服务
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store rate limits in memory (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check if a request is allowed based on rate limit
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists, create a new one
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get rate limit info for an identifier
 */
export function getRateLimitInfo(identifier: string): RateLimitEntry | undefined {
  return rateLimitStore.get(identifier);
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupExpiredRateLimits(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [identifier, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(identifier);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  total: number;
  expired: number;
  active: number;
} {
  const now = Date.now();
  let expired = 0;
  let active = 0;

  for (const entry of rateLimitStore.values()) {
    if (now > entry.resetAt) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    total: rateLimitStore.size,
    expired,
    active,
  };
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
