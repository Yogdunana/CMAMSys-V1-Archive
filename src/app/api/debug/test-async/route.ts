import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 测试异步函数执行
 * POST /api/debug/test-async
 */
export async function POST(request: NextRequest) {
  try {
    // 验证 Token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    // 立即返回
    const response = NextResponse.json({
      success: true,
      message: '异步任务已开始',
    });

    // 在响应返回后执行异步任务
    response.headers.set('X-Async-Task', 'started');

    // 立即返回响应，不等待异步任务完成
    return response;

  } catch (error) {
    console.error('Test async error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '测试失败',
      },
      { status: 500 }
    );
  }
}

// 在模块级别执行异步任务（不等待响应）
async function executeAsyncTask() {
  console.log('[AsyncTask] 异步任务开始执行');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('[AsyncTask] 异步任务执行完成');
}

// 立即执行异步任务
executeAsyncTask().catch(error => {
  console.error('[AsyncTask] 异步任务执行失败:', error);
});
