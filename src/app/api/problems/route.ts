/**
 * Problems API
 * GET /api/problems - 获取题目列表
 * POST /api/problems - 创建题目
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * GET: 获取题目列表
 */
export async function GET(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');

    const problems = await prisma.problem.findMany({
      where: {
        deletedAt: null,
        ...(competitionId && { competitionId }),
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
          },
        },
        solutions: {
          where: { deletedAt: null },
          include: {
            aiContents: true,
          },
        },
      },
      orderBy: { problemNumber: 'asc' },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: problems,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch problems',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
