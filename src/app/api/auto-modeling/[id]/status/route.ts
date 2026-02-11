/**
 * 获取自动化任务状态 API
 * GET /api/auto-modeling/[id]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { getAutoTaskStatus } from '@/services/auto-process-coordinator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('[Status API] No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      console.log('[Status API] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    console.log(`[Status API] Fetching status for task: ${id}`);

    // 获取任务状态
    const task = await getAutoTaskStatus(id);
    console.log(`[Status API] Task result:`, task ? 'found' : 'not found');

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('[Status API] Error getting auto task status:', error);
    return NextResponse.json(
      {
        error: '获取任务状态失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
