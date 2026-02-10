/**
 * API Middleware Composition
 * API 中间件组合
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter, RateLimitPresets } from '@/lib/rate-limit';
import { withCSRFProtection, validateCSRFToken } from '@/lib/csrf';
import { withApiVersionControl, ApiVersion } from '@/lib/api-version';

/**
 * Middleware Configuration
 */
export interface MiddlewareConfig {
  rateLimit?: {
    enabled?: boolean;
    preset?: string;
  };
  csrf?: {
    enabled?: boolean;
    skipMethods?: readonly string[] | string[];
  };
  version?: {
    enabled?: boolean;
    requireVersion?: boolean;
  };
}

/**
 * Create Composed Middleware
 * 创建组合中间件
 */
export function createApiMiddleware<T extends NextRequest>(
  handler: (request: T, context?: { params?: Promise<any> }) => Promise<Response | NextResponse>,
  config: MiddlewareConfig = {}
) {
  const {
    rateLimit = { enabled: true, preset: 'general' },
    csrf = { enabled: false, skipMethods: ['GET', 'HEAD', 'OPTIONS'] },
    version = { enabled: true, requireVersion: true },
  } = config;

  // Apply API version control
  if (version.enabled) {
    handler = withApiVersionControl(handler as any, {
      requireVersion: version.requireVersion,
    }) as any;
  }

  // Apply CSRF protection
  if (csrf.enabled) {
    handler = withCSRFProtection(handler as any) as any;
  }

  // Apply rate limiting
  if (rateLimit.enabled && rateLimit.preset) {
    const rateLimiter = getRateLimiter(rateLimit.preset);

    return async (request: T, context?: { params?: Promise<any> }): Promise<Response> => {
      // Apply rate limit
      const rateLimitResult = await rateLimiter(request);

      if (rateLimitResult) {
        return rateLimitResult;
      }

      // Call handler
      return handler(request, context);
    };
  }

  return handler;
}

/**
 * Predefined Middleware Configurations
 * 预定义中间件配置
 */
export const MiddlewarePresets = {
  // Auth endpoints - strict rate limiting, CSRF required
  auth: {
    rateLimit: { enabled: true, preset: 'auth' },
    csrf: { enabled: true, skipMethods: ['GET', 'HEAD', 'OPTIONS'] },
    version: { enabled: true, requireVersion: true },
  },

  // General API - standard rate limiting, CSRF optional
  general: {
    rateLimit: { enabled: true, preset: 'general' },
    csrf: { enabled: false },
    version: { enabled: true, requireVersion: true },
  },

  // AI Chat - strict rate limiting, no CSRF
  aiChat: {
    rateLimit: { enabled: true, preset: 'aiChat' },
    csrf: { enabled: false },
    version: { enabled: true, requireVersion: true },
  },

  // Modeling tasks - strict rate limiting, CSRF optional
  modelingTask: {
    rateLimit: { enabled: true, preset: 'modelingTask' },
    csrf: { enabled: false },
    version: { enabled: true, requireVersion: true },
  },

  // Upload - very strict rate limiting, CSRF required
  upload: {
    rateLimit: { enabled: true, preset: 'upload' },
    csrf: { enabled: true, skipMethods: ['GET', 'HEAD', 'OPTIONS'] },
    version: { enabled: true, requireVersion: true },
  },

  // Admin - strict rate limiting, CSRF required
  admin: {
    rateLimit: { enabled: true, preset: 'strict' },
    csrf: { enabled: true, skipMethods: ['GET', 'HEAD', 'OPTIONS'] },
    version: { enabled: true, requireVersion: true },
  },
} as const;

/**
 * Apply Preset Middleware
 * 应用预设中间件
 */
export function withPresetMiddleware<T extends NextRequest>(
  preset: keyof typeof MiddlewarePresets,
  handler: (request: T, version?: ApiVersion, ...args: any[]) => Promise<NextResponse>
) {
  return createApiMiddleware(handler, MiddlewarePresets[preset]);
}

/**
 * Helper: Validate CSRF for API Routes (Server-side)
 * 辅助函数：验证 API 路由的 CSRF Token（服务端）
 */
export async function validateCSRFServerSide(request: NextRequest): Promise<boolean> {
  // Get token from header or body
  const token = request.headers.get('X-CSRF-Token');

  if (!token) {
    try {
      const body = await request.json();
      const bodyToken = body.csrfToken;
      if (bodyToken) {
        return await validateCSRFToken(bodyToken);
      }
    } catch {
      // If body parsing fails, just return false
      return false;
    }
  }

  if (!token) {
    return false;
  }

  return await validateCSRFToken(token);
}

/**
 * Helper: Add Security Headers
 * 辅助函数：添加安全响应头
 */
export function addSecurityHeaders(response: Response): Response {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  return response;
}

/**
 * Helper: Add CORS Headers
 * 辅助函数：添加 CORS 响应头
 */
export function addCORSHeaders(
  response: Response,
  origin: string = '*'
): Response {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * Helper: Handle OPTIONS Request (Preflight)
 * 辅助函数：处理 OPTIONS 请求（预检）
 */
export function handleOptionsRequest(request: NextRequest): Response | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCORSHeaders(response);
  }
  return null;
}
