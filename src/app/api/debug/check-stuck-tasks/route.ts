import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { findStuckTasks, recoverStuckTask, markTaskAsFailed } from '@/services/task-monitor';

/**
 * 检查卡住的任务
 * GET /api/debug/check-stuck-tasks
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    const stuckTasks = await findStuckTasks();

    return NextResponse.json({
      success: true,
      data: stuckTasks,
    });
  } catch (error) {
    console.error('Check stuck tasks error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '检查失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 恢复卡住的任务
 * POST /api/debug/check-stuck-tasks
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    const { taskId, action } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少 taskId 参数' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'recover') {
      result = await recoverStuckTask(taskId);
    } else if (action === 'mark-failed') {
      result = await markTaskAsFailed(taskId, '用户手动标记为失败');
    } else {
      return NextResponse.json(
        { success: false, error: '无效的操作类型' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    console.error('Recover stuck task error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '操作失败',
      },
      { status: 500 }
    );
  }
}
