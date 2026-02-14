/**
 * 获取/更新论文内容 API
 * GET /api/auto-modeling/[id]/paper - 获取论文
 * PUT /api/auto-modeling/[id]/paper - 更新论文
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 获取论文内容
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GetPaper] 开始获取论文内容');

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;

    console.log(`[GetPaper] 任务 ID: ${taskId}`);

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    if (!task.paperId) {
      return NextResponse.json(
        { success: false, error: '任务没有论文记录' },
        { status: 404 }
      );
    }

    // 查询论文
    const paper = await prisma.generatedPaper.findUnique({
      where: { id: task.paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, error: '论文不存在' },
        { status: 404 }
      );
    }

    console.log(`[GetPaper] 论文 ID: ${paper.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: paper.id,
        title: paper.title,
        content: paper.content,
        format: paper.format,
        language: paper.language,
        sections: paper.sections,
        wordCount: paper.wordCount,
        status: paper.status,
        createdAt: paper.createdAt,
        updatedAt: paper.updatedAt,
      },
    });
  } catch (error) {
    console.error('[GetPaper] 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取论文失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 更新论文内容
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[UpdatePaper] 开始更新论文内容');

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;

    console.log(`[UpdatePaper] 任务 ID: ${taskId}`);

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    if (!task.paperId) {
      return NextResponse.json(
        { success: false, error: '任务没有论文记录' },
        { status: 404 }
      );
    }

    // 获取请求参数
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少 content 参数' },
        { status: 400 }
      );
    }

    console.log(`[UpdatePaper] 更新论文内容，长度: ${content.length}`);

    // 更新论文
    const paper = await prisma.generatedPaper.update({
      where: { id: task.paperId },
      data: {
        content,
        wordCount: content.length,
      },
    });

    console.log(`[UpdatePaper] 论文更新成功: ${paper.id}`);

    return NextResponse.json({
      success: true,
      message: '论文更新成功',
      data: {
        paperId: paper.id,
        wordCount: paper.wordCount,
      },
    });
  } catch (error) {
    console.error('[UpdatePaper] 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新论文失败',
      },
      { status: 500 }
    );
  }
}
