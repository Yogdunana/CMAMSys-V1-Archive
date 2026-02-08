/**
 * 全自动化流程 API
 * POST /api/auto-modeling/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken } from '@/lib/jwt';
import { executeFullAutoProcess } from '@/services/auto-process-coordinator';

export async function POST(request: NextRequest) {
  try {
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 获取请求参数
    const body = await request.json();
    const {
      competitionType,
      problemType,
      problemTitle,
      problemContent,
      paperFormat = 'MCM',
      paperLanguage = 'ENGLISH',
    } = body;

    // 验证必填参数
    if (!competitionType || !problemType || !problemTitle || !problemContent) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    // 执行全自动化流程（后台执行）
    // 注意：这里使用异步执行，避免阻塞响应
    executeFullAutoProcess(
      payload.userId,
      competitionType,
      problemType,
      problemTitle,
      problemContent,
      paperFormat,
      paperLanguage
    ).catch((error) => {
      console.error('自动化流程执行失败:', error);
    });

    return NextResponse.json({
      success: true,
      message: '全自动化流程已启动，请稍后查看结果',
      tip: '您可以在"自动化任务"页面查看执行进度',
    });
  } catch (error) {
    console.error('Error starting auto process:', error);
    return NextResponse.json(
      {
        error: '启动自动化流程失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
