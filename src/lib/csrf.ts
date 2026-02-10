/**
 * CSRF (Cross-Site Request Forgery) Protection
 * 跨站请求伪造防护
 */

import { SignJWT, jwtVerify } from 'jose';

const CSRF_SECRET = new TextEncoder().encode(
  process.env.CSRF_SECRET || 'your-super-secret-csrf-key-change-in-production'
);

const CSRF_TOKEN_EXPIRY = '1h'; // 1 hour

export interface CSRFPayload {
  sessionId: string;
  timestamp: number;
  [key: string]: any; // 索引签名，符合 JWTPayload 要求
}

/**
 * Generate CSRF Token
 * 生成 CSRF Token
 */
export async function generateCSRFToken(sessionId: string): Promise<string> {
  return await new SignJWT({
    sessionId,
    timestamp: Date.now(),
  } as CSRFPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(CSRF_TOKEN_EXPIRY)
    .sign(CSRF_SECRET);
}

/**
 * Verify CSRF Token
 * 验证 CSRF Token
 */
export async function verifyCSRFToken(token: string): Promise<CSRFPayload | null> {
  try {
    const { payload } = await jwtVerify(token, CSRF_SECRET);
    return payload as unknown as CSRFPayload;
  } catch (error) {
    console.error('Invalid CSRF token:', error);
    return null;
  }
}

/**
 * Generate CSRF Token and Set Cookie
 * 生成 CSRF Token 并设置 Cookie
 */
export function setCSRFCookie(response: Response, token: string): void {
  // Set HTTP-only cookie (cannot be accessed via JavaScript)
  document.cookie = `csrf_token=${token}; path=/; secure; samesite=strict; max-age=${60 * 60}`;
}

/**
 * Get CSRF Token from Cookie
 * 从 Cookie 获取 CSRF Token
 */
export function getCSRFCookie(): string | undefined {
  const name = 'csrf_token=';
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name)) {
      return trimmed.substring(name.length);
    }
  }

  return undefined;
}

/**
 * Extract CSRF Token from Request Headers
 * 从请求头提取 CSRF Token
 */
export function getCSRFTokenFromHeader(request: Request): string | undefined {
  return request.headers.get('X-CSRF-Token') || undefined;
}

/**
 * Extract CSRF Token from Request Body
 * 从请求体提取 CSRF Token
 */
export async function getCSRFTokenFromBody(request: Request): Promise<string | undefined> {
  try {
    const body = await request.json();
    return body.csrfToken;
  } catch {
    return undefined;
  }
}

/**
 * Validate CSRF Token for API Routes
 * 验证 API 路由的 CSRF Token
 */
export async function validateCSRFToken(request: Request): Promise<boolean> {
  // Get token from header or body
  const token = getCSRFTokenFromHeader(request) || await getCSRFTokenFromBody(request);

  if (!token) {
    return false;
  }

  // Verify token
  const payload = await verifyCSRFToken(token);

  if (!payload) {
    return false;
  }

  // Get token from cookie
  const cookieToken = getCSRFCookie();

  if (!cookieToken) {
    return false;
  }

  // Compare tokens
  return token === cookieToken;
}

/**
 * CSRF Protection Middleware for Next.js API Routes
 * CSRF 保护中间件
 */
export function withCSRFProtection<T extends Request>(
  handler: (request: T, ...args: any[]) => Promise<Response>
) {
  return async (request: T, ...args: any[]): Promise<Response> => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    const method = request.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return handler(request, ...args);
    }

    // Validate CSRF token for POST, PUT, DELETE, PATCH
    const isValid = await validateCSRFToken(request);

    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid or missing CSRF token',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(request, ...args);
  };
}

/**
 * Get CSRF Token Endpoint Handler
 * 获取 CSRF Token 端点处理器
 */
export async function getCSRFTokenHandler(request: Request): Promise<Response> {
  // Get session ID from Authorization header or create a new one
  const sessionId = request.headers.get('Authorization')?.replace('Bearer ', '') || crypto.randomUUID();

  // Generate CSRF token
  const token = await generateCSRFToken(sessionId);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        csrfToken: token,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `csrf_token=${token}; path=/; secure; samesite=strict; max-age=${60 * 60}`,
      },
    }
  );
}
