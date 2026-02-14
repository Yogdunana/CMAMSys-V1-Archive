import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// 重新开始任务
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

    // 重置任务状态
    const updatedTask = await prisma.autoModelingTask.update({
      where: { id },
      data: {
        overallStatus: 'PENDING',
        discussionStatus: 'PENDING',
        validationStatus: 'PENDING',
        paperStatus: 'DRAFT',
        progress: 0,
        validationRounds: 0,
        errorLog: null,
      },
    });

    // 重新启动自动化流程
    // 这里可以调用 auto-process-coordinator 重新启动
    // 暂时返回成功消息

    return NextResponse.json({
      success: true,
      message: '任务已重新启动',
      data: updatedTask,
    });
  } catch (error) {
    console.error('重新开始任务失败:', error);
    return NextResponse.json(
      { success: false, error: '重新开始任务失败' },
      { status: 500 }
    );
  }
}

// 删除任务
export async function DELETE(
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
      include: {
        discussion: true,
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: '任务不存在' }, { status: 404 });
    }

    // 级联删除关联数据
    await prisma.$transaction(async (tx) => {
      // 删除讨论消息
      if (task.discussion) {
        await tx.discussionMessage.deleteMany({
          where: { discussionId: task.discussionId },
        });
        await tx.groupDiscussion.delete({
          where: { id: task.discussionId },
        });
      }

      // 删除代码校验记录
      await tx.codeValidation.deleteMany({
        where: { autoTaskId: id },
      });

      // 删除代码生成记录
      if (task.codeGeneration) {
        await tx.codeGeneration.delete({
          where: { id: task.codeGenerationId },
        });
      }

      // 删除论文
      if (task.paper) {
        await tx.generatedPaper.delete({
          where: { id: task.paperId },
        });
      }

      // 删除任务
      await tx.autoModelingTask.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: '任务已删除',
    });
  } catch (error) {
    console.error('删除任务失败:', error);
    return NextResponse.json(
      { success: false, error: '删除任务失败' },
      { status: 500 }
    );
  }
}
