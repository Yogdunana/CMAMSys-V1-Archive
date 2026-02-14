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

    // 使用事务删除旧代码
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

      return { success: true };
    });

    // 异步生成代码（不阻塞响应）
    generateCodeAsync(taskId, task.discussionId, discussion.summary || {}, language || 'PYTHON', decoded.userId)
      .catch(error => {
        console.error('[RegenerateCode] 异步代码生成失败:', error);
      });

    // 立即返回，不等待代码生成完成
    return NextResponse.json({
      success: true,
      message: '代码生成已开始，请在进度中查看',
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

/**
 * 异步生成代码
 */
async function generateCodeAsync(
  taskId: string,
  discussionId: string,
  discussionSummary: any,
  language: string,
  userId: string
) {
  console.log(`[GenerateCodeAsync] 开始生成代码，任务 ID: ${taskId}`);
  const startTime = Date.now();

  try {
    // 导入 generateCode 函数
    const { generateCode } = await import('@/services/code-generation');

    // 添加超时保护（5分钟）
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`代码生成超时（5分钟）`));
      }, 5 * 60 * 1000);
    });

    // 生成代码（这会阻塞，但不影响 API 响应）
    const codeGeneration = await Promise.race([
      generateCode(
        taskId,
        discussionId,
        discussionSummary,
        language as any,
        userId
      ),
      timeoutPromise,
    ]);

    const duration = Date.now() - startTime;
    console.log(`[GenerateCodeAsync] 代码生成完成，代码生成 ID: ${codeGeneration.id}，耗时: ${duration}ms`);

    // 更新任务进度
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        codeGenerationId: codeGeneration.id,
        progress: 60,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    console.error(`[GenerateCodeAsync] 代码生成失败，耗时: ${duration}ms，错误:`, error);

    // 更新任务状态为失败
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: 'FAILED',
        errorLog: `代码生成失败: ${errorMessage}（耗时: ${duration}ms）`,
      },
    });

    // 发送错误通知（如果实现了通知系统）
    // await sendErrorNotification(userId, taskId, errorMessage);
  }
}
