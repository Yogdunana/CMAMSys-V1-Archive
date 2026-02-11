/**
 * 全自动化流程 API
 * POST /api/auto-modeling/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { OverallStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    // 获取请求参数
    const body = await request.json();
    const {
      competitionType,
      problemType,
      problemTitle,
      problemContent,
    } = body;

    // 验证必填参数
    if (!competitionType || !problemType || !problemTitle || !problemContent) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数' },
        { status: 400 }
      );
    }

    // 创建自动化任务记录
    const autoTask = await prisma.autoModelingTask.create({
      data: {
        competitionType: competitionType as any,
        problemType: problemType as any,
        problemTitle,
        problemContent,
        discussionStatus: 'PENDING' as any,
        validationStatus: 'PENDING' as any,
        paperStatus: 'DRAFT' as any,
        overallStatus: OverallStatus.PENDING,
      },
    });

    console.log(`自动化任务创建成功，ID: ${autoTask.id}`);

    // 后台执行全自动化流程
    import('@/services/auto-process-coordinator').then(({ executeFullAutoProcess }) => {
      executeFullAutoProcess(
        payload.userId,
        competitionType,
        problemType,
        problemTitle,
        problemContent,
        'CUMCM',
        'CHINESE'
      ).catch((error) => {
        console.error('自动化流程执行失败:', error);
        prisma.autoModelingTask.update({
          where: { id: autoTask.id },
          data: {
            overallStatus: OverallStatus.FAILED,
            errorLog: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      });
    });

    return NextResponse.json({
      success: true,
      taskId: autoTask.id,
      message: '全自动化流程已启动，请稍后查看结果',
      tip: '您可以在"自动化任务"页面查看执行进度',
    });
  } catch (error) {
    console.error('Error starting auto process:', error);
    return NextResponse.json(
      {
        success: false,
        error: '启动自动化流程失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
