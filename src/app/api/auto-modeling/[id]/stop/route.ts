import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 停止任务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证 Token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token 无效' }, { status: 401 });
    }

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: '任务不存在' }, { status: 404 });
    }

    // 停止任务（标记为失败，并添加停止原因）
    const updatedTask = await prisma.autoModelingTask.update({
      where: { id },
      data: {
        overallStatus: 'FAILED',
        errorLog: '任务已被用户手动停止',
      },
    });

    return NextResponse.json({
      success: true,
      message: '任务已停止',
      data: updatedTask,
    });
  } catch (error) {
    console.error('停止任务失败:', error);
    return NextResponse.json(
      { success: false, error: '停止任务失败' },
      { status: 500 }
    );
  }
}
