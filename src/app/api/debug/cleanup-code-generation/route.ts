/**
 * 清理代码生成记录（用于修复唯一约束冲突）
 * POST /api/debug/cleanup-code-generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少 taskId 参数' },
        { status: 400 }
      );
    }

    // 删除代码生成记录
    const deleted = await prisma.codeGeneration.deleteMany({
      where: { autoTaskId: taskId },
    });

    // 重置任务的代码生成 ID
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: { codeGenerationId: null },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      message: `已删除 ${deleted.count} 条代码生成记录`,
    });
  } catch (error) {
    console.error('Cleanup code generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '清理代码生成记录失败',
      },
      { status: 500 }
    );
  }
}
