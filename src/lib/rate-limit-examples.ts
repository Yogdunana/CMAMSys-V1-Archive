/**
 * Rate Limiting Usage Examples
 * 速率限制使用示例
 */

import { NextRequest } from 'next/server';
import {
  createRateLimiter,
  getRateLimiter,
  RateLimitPresets,
  type RateLimitConfig,
} from '@/lib/rate-limit';

// ============================================
// 示例 1: 使用预设速率限制
// ============================================

/**
 * 认证 API（使用 auth 预设）
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  const rateLimiter = getRateLimiter('auth');
  const result = await rateLimiter(request);
  
  if (result) {
    return result; // 返回 429 错误
  }
  
  // 继续处理请求
  // ...
}

// ============================================
// 示例 2: 使用自定义速率限制
// ============================================

/**
 * 自定义速率限制：每分钟 50 次请求
 */
const customRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 50,
});

/**
 * 自定义 API
 */
export async function handleCustomAPI(request: NextRequest) {
  const result = await customRateLimiter(request);
  
  if (result) {
    return result;
  }
  
  // 继续处理请求
  // ...
}

// ============================================
// 示例 3: 基于用户的速率限制
// ============================================

/**
 * 基于用户的速率限制
 */
export async function handleUserAPI(request: NextRequest) {
  // 从 JWT Token 获取用户 ID
  const userId = getUserIdFromToken(request); // 假设的函数
  
  const rateLimiter = getRateLimiter('general');
  const result = await rateLimiter(request, userId);
  
  if (result) {
    return result;
  }
  
  // 继续处理请求
  // ...
}

// ============================================
// 示例 4: AI 聊天 API（严格限制）
// ============================================

/**
 * AI 聊天 API
 * POST /api/ai/chat
 */
export async function handleAIChat(request: NextRequest) {
  const rateLimiter = getRateLimiter('aiChat');
  const result = await rateLimiter(request);
  
  if (result) {
    return result;
  }
  
  // 继续处理 AI 聊天请求
  // ...
}

// ============================================
// 示例 5: 文件上传 API（非常严格）
// ============================================

/**
 * 文件上传 API
 * POST /api/upload
 */
export async function handleUpload(request: NextRequest) {
  const rateLimiter = getRateLimiter('upload');
  const result = await rateLimiter(request);
  
  if (result) {
    return result;
  }
  
  // 继续处理文件上传
  // ...
}

// ============================================
// 示例 6: 组合多个速率限制
// ============================================

/**
 * 组合速率限制：通用限制 + 严格限制
 */
const generalLimiter = getRateLimiter('general');
const strictLimiter = getRateLimiter('strict');

export async function handleCombinedRateLimit(request: NextRequest) {
  // 先检查通用限制
  const generalResult = await generalLimiter(request);
  if (generalResult) return generalResult;
  
  // 再检查严格限制
  const strictResult = await strictLimiter(request);
  if (strictResult) return strictResult;
  
  // 继续处理请求
  // ...
}

// ============================================
// 示例 7: 在 API Route 中使用
// ============================================

/**
 * 在 Next.js API Route 中使用
 * src/app/api/ai-providers/chat/route.ts
 */
import { getRateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // 应用速率限制
  const rateLimiter = getRateLimiter('aiChat');
  const rateLimitResult = await rateLimiter(request);
  
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // 正常处理请求
  try {
    const body = await request.json();
    // ... 业务逻辑
  } catch (error) {
    // ...
  }
}

// ============================================
// 示例 8: 获取速率限制状态
// ============================================

/**
 * 获取当前用户的速率限制状态
 */
export async function GET(request: NextRequest) {
  const userId = getUserIdFromToken(request);
  const identifier = `user:${userId}`;
  
  const status = getRateLimitStatus(identifier);
  
  if (!status) {
    return Response.json({
      limit: RateLimitPresets.general.maxRequests,
      remaining: RateLimitPresets.general.maxRequests,
      reset: Date.now() + RateLimitPresets.general.windowMs,
    });
  }
  
  return Response.json({
    limit: RateLimitPresets.general.maxRequests,
    remaining: RateLimitPresets.general.maxRequests - status.count,
    reset: status.resetTime,
  });
}

// ============================================
// 示例 9: 管理员重置速率限制
// ============================================

/**
 * 管理员重置特定用户的速率限制
 */
export async function resetUserRateLimit(userId: string) {
  const identifier = `user:${userId}`;
  resetRateLimit(identifier);
}

// ============================================
// 示例 10: 环境变量配置
// ============================================

/**
 * 从环境变量加载速率限制配置
 */
function loadRateLimitConfigFromEnv(): RateLimitConfig {
  return {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  };
}

const envRateLimiter = createRateLimiter(loadRateLimitConfigFromEnv());

// ============================================
// 辅助函数（假设）
// ============================================

function getUserIdFromToken(request: NextRequest): string {
  // 实际实现中，从 JWT Token 中提取用户 ID
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  // 解析 token 并返回用户 ID
  return 'user-123'; // 示例
}
