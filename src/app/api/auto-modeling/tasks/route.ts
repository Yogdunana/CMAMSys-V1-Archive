/**
 * 获取自动化任务列表 API
 * GET /api/auto-modeling/tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // 构建查询条件
    const where: any = {};

    if (status && status !== 'ALL') {
      where.overallStatus = status;
    }

    // 获取任务列表
    const [tasks, total] = await Promise.all([
      prisma.autoModelingTask.findMany({
        where,
        include: {
          discussion: {
            select: {
              id: true,
              status: true,
              currentRound: true,
            },
          },
          codeGeneration: {
            select: {
              id: true,
              executionStatus: true,
            },
          },
          paper: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.autoModelingTask.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error getting auto modeling tasks:', error);
    return NextResponse.json(
      {
        error: '获取任务列表失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
