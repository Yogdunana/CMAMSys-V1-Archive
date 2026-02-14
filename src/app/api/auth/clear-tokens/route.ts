import { NextRequest, NextResponse } from 'next/server';

/**
 * 清除客户端所有认证 Token（用于调试和故障恢复）
 * POST /api/auth/clear-tokens
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[ClearTokens] 收到清除Token请求');

    // 返回清除指令
    return NextResponse.json({
      success: true,
      message: '请清除本地存储的所有Token并重新登录',
      instructions: {
        steps: [
          '打开浏览器开发者工具 (F12)',
          '切换到 Application 或 Storage 标签',
          '找到 Local Storage',
          '删除 accessToken 和 refreshToken',
          '刷新页面并重新登录',
        ],
        alternative: '或在Token过期对话框中点击"前往登录"按钮',
      },
    });
  } catch (error) {
    console.error('[ClearTokens] 清除失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '清除失败',
      },
      { status: 500 }
    );
  }
}
