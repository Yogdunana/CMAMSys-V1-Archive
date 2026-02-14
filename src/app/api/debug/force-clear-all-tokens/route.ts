/**
 * 清除旧的 JWT token 并重新登录
 * 用于 JWT secret 改变后的紧急处理
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 强制清除所有用户的 token（用于 JWT secret 改变后）
 * POST /api/debug/force-clear-all-tokens
 *
 * 注意：这是一个紧急处理 API，仅用于 JWT secret 改变后的情况
 * 正常情况下应该使用 Token 过期机制
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[ForceClearAllTokens] 强制清除所有 token');

    // 返回成功，前端需要：
    // 1. 清除 localStorage 中的 accessToken 和 refreshToken
    // 2. 重定向到登录页
    return NextResponse.json({
      success: true,
      message: 'JWT secret 已更新，请重新登录',
      reason: 'JWT_SECRET 已更改，所有旧的 token 已失效',
      action: 'CLEAR_TOKENS_AND_REDIRECT',
      redirectUrl: '/auth/login',
    });
  } catch (error) {
    console.error('[ForceClearAllTokens] 清除失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '清除失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 检查是否需要强制重新登录
 * GET /api/debug/force-clear-all-tokens
 */
export async function GET(request: NextRequest) {
  try {
    // 返回当前状态
    return NextResponse.json({
      success: true,
      requiresReauth: false,
      message: '当前不需要强制重新登录',
    });
  } catch (error) {
    console.error('[ForceClearAllTokens] 检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '检查失败',
      },
      { status: 500 }
    );
  }
}
