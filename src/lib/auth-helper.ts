/**
 * JWT 验证辅助函数
 * 提供统一的 JWT 验证逻辑，并返回详细的错误信息
 */

import { verifyAccessToken as verifyJWTAccessToken, isJWTSignatureError, isJWTExpiredError, getJWTErrorType } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export interface AuthResult {
  success: boolean;
  payload?: any;
  error?: string;
  errorType?: 'signature' | 'expired' | 'invalid' | 'unknown';
}

/**
 * 验证 Access Token 并返回详细结果
 * 可以在 API 路由中使用
 */
export async function verifyAccessTokenFromRequest(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return {
        success: false,
        error: '未提供认证信息',
        errorType: 'invalid',
      };
    }

    const token = authHeader.substring(7);

    if (!token) {
      return {
        success: false,
        error: 'Token为空',
        errorType: 'invalid',
      };
    }

    // 尝试验证 Token
    const payload = await verifyJWTAccessToken(token);

    if (!payload) {
      // Token 验证失败，但我们无法知道具体原因
      // 因为 verifyAccessToken 已经捕获了错误
      return {
        success: false,
        error: 'Token无效或已过期',
        errorType: 'invalid',
      };
    }

    return {
      success: true,
      payload,
    };
  } catch (error: any) {
    // 如果验证过程中抛出错误，处理具体的错误类型
    const errorType = getJWTErrorType(error);

    return {
      success: false,
      error: `Token验证失败: ${error.message}`,
      errorType,
    };
  }
}

/**
 * 创建认证失败的响应
 */
export function createAuthFailureResponse(result: AuthResult, status: number = 401) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'AUTH_FAILED',
        message: result.error || '认证失败',
        details: result.errorType || 'unknown',
        errorType: result.errorType || 'unknown',
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * 在 API 路由中使用的认证中间件
 * 如果认证失败，会返回 401 响应
 */
export async function requireAuth(request: Request): Promise<{ success: boolean; payload?: any; response?: any }> {
  const result = await verifyAccessTokenFromRequest(request);

  if (!result.success) {
    const response = createAuthFailureResponse(result);
    return { success: false, response };
  }

  return { success: true, payload: result.payload };
}
