/**
 * 任务列表管理 API
 * GET /api/auto-modeling/[id]/task-list - 获取任务列表
 * PUT /api/auto-modeling/[id]/task-list - 更新任务列表
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // 获取任务详情，包括讨论总结
    const task = await prisma.autoModelingTask.findUnique({
      where: { id },
      include: {
        discussion: true,
      },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // 尝试从讨论总结中获取任务列表
    let taskList: string[] = [];
    const summary = task.discussion?.summary as any;

    if (summary?.taskList && Array.isArray(summary.taskList)) {
      taskList = summary.taskList;
    } else if (summary?.taskList && typeof summary.taskList === 'string') {
      // 如果是字符串，尝试解析
      taskList = summary.taskList.split('\n').filter((t: string) => t.trim());
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        taskList,
        source: 'discussion',
      },
    });
  } catch (error) {
    console.error('[TaskList API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取任务列表失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();

    // 验证任务列表
    if (!Array.isArray(body.taskList)) {
      return NextResponse.json(
        { success: false, error: 'taskList 必须是数组' },
        { status: 400 }
      );
    }

    if (body.taskList.length === 0) {
      return NextResponse.json(
        { success: false, error: '任务列表不能为空' },
        { status: 400 }
      );
    }

    if (body.taskList.length > 15) {
      return NextResponse.json(
        { success: false, error: '任务列表不能超过 15 个任务' },
        { status: 400 }
      );
    }

    // 验证每个任务
    for (const task of body.taskList) {
      if (typeof task !== 'string') {
        return NextResponse.json(
          { success: false, error: '每个任务必须是字符串' },
          { status: 400 }
        );
      }
      if (task.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: '任务描述不能为空' },
          { status: 400 }
        );
      }
    }

    // 获取任务详情
    const task = await prisma.autoModelingTask.findUnique({
      where: { id },
      include: {
        discussion: true,
      },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // 如果讨论存在，更新讨论总结中的任务列表
    if (task.discussion) {
      const summary = task.discussion.summary as any || {};
      summary.taskList = body.taskList;
      summary.manuallyModified = true;
      summary.modifiedAt = new Date().toISOString();

      await prisma.groupDiscussion.update({
        where: { id: task.discussion.id },
        data: {
          summary,
        },
      });
    } else {
      // 如果讨论不存在，创建一个占位讨论
      const discussion = await prisma.groupDiscussion.create({
        data: {
          autoTaskId: task.id,
          discussionTitle: `${task.problemTitle} - 任务列表`,
          problemTitle: task.problemTitle,
          competitionType: task.competitionType,
          problemType: task.problemType,
          status: 'COMPLETED',
          currentRound: 1,
          maxRounds: 1,
          participants: [],
          summary: {
            taskList: body.taskList,
            manuallyModified: true,
            modifiedAt: new Date().toISOString(),
          },
        },
      });

      // 更新任务关联到讨论
      await prisma.autoModelingTask.update({
        where: { id },
        data: { discussionId: discussion.id },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        taskList: body.taskList,
        modified: true,
      },
    });
  } catch (error) {
    console.error('[TaskList API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新任务列表失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
