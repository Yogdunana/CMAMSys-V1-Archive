/**
 * 获取最新的运行中任务 API
 * GET /api/auto-modeling/latest
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // 获取最新的运行中任务
    const task = await prisma.autoModelingTask.findFirst({
      where: {
        overallStatus: {
          in: ['PENDING', 'DISCUSSING', 'CODING', 'VALIDATING', 'RETRYING', 'PAPER_GENERATING'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'No running task found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching latest task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
