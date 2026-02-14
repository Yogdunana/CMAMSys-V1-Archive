/**
 * 重新生成代码
 * POST /api/auto-modeling/[id]/regenerate-code
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { generateCode } from '@/services/code-generation';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: taskId } = await params;
    const body = await request.json();
    const { language } = body;

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    if (!task.discussionId) {
      return NextResponse.json(
        { success: false, error: '任务没有讨论记录，无法重新生成代码' },
        { status: 400 }
      );
    }

    // 查询讨论摘要
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: task.discussionId },
    });

    if (!discussion) {
      return NextResponse.json(
        { success: false, error: '讨论记录不存在' },
        { status: 404 }
      );
    }

    // 使用事务删除旧代码并生成新代码
    const result = await prisma.$transaction(async (tx) => {
      // 删除旧的代码生成记录
      if (task.codeGeneration) {
        await tx.codeGeneration.delete({
          where: { id: task.codeGeneration.id },
        });
      }

      // 更新任务状态为 CODING
      await tx.autoModelingTask.update({
        where: { id: taskId },
        data: {
          overallStatus: 'CODING',
          discussionStatus: 'COMPLETED',
          progress: 50,
        },
      });

      // 重新生成代码
      console.log(`[RegenerateCode] 开始重新生成代码，任务 ID: ${taskId}`);
      const newCodeGeneration = await generateCode(
        taskId,
        task.discussionId,
        discussion.summary || {},
        language || 'PYTHON',
        decoded.userId
      );
      console.log(`[RegenerateCode] 代码重新生成完成，代码生成 ID: ${newCodeGeneration.id}`);

      return newCodeGeneration;
    });

    // 更新任务的代码生成 ID 和进度
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        codeGenerationId: result.id,
        progress: 60,
      },
    });

    return NextResponse.json({
      success: true,
      codeGeneration: newCodeGeneration,
      message: '代码重新生成成功',
    });
  } catch (error) {
    console.error('Regenerate code error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '重新生成代码失败',
      },
      { status: 500 }
    );
  }
}
