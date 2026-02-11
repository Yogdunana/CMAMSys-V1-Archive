/**
 * 代码生成详情 API
 * GET /api/code-generation/task/[taskId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
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

    const { taskId } = await params;

    // 查询自动化任务的代码生成记录
    const autoTask = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
      },
    });

    if (!autoTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (!autoTask.codeGeneration) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '尚未生成代码',
      });
    }

    return NextResponse.json({
      success: true,
      data: autoTask.codeGeneration,
    });
  } catch (error) {
    console.error('Error getting code generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取代码生成失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
