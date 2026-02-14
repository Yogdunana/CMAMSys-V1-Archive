import { NextRequest, NextResponse } from 'next/server';

/**
 * 清除所有认证 token（用于 JWT secret 改变后的强制重新登录）
 * POST /api/debug/clear-tokens
 */
export async function POST(request: NextRequest) {
  try {
    // 这个 API 不需要认证，用于紧急情况
    console.log('[ClearTokens] 收到清除 token 请求');

    // 返回成功，前端会清除 localStorage 中的 token
    return NextResponse.json({
      success: true,
      message: '请清除浏览器中的 token 并重新登录',
      instructions: [
        '1. 打开浏览器开发者工具（F12）',
        '2. 切换到 Application 标签',
        '3. 找到 Local Storage',
        '4. 删除 accessToken 和 refreshToken',
        '5. 刷新页面并重新登录',
      ],
    });
  } catch (error) {
    console.error('[ClearTokens] 清除 token 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '清除失败',
      },
      { status: 500 }
    );
  }
}
