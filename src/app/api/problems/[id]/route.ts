/**
 * Problem Detail API
 * GET /api/problems/[id] - 获取题目详情
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * GET: 获取题目详情
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    const problem = await prisma.problem.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            type: true,
            year: true,
          },
        },
        solutions: {
          where: { deletedAt: null },
          include: {
            aiContents: {
              orderBy: { type: 'asc' },
            },
          },
          orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!problem) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Problem not found' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: problem,
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
          message: 'Failed to fetch problem details',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
