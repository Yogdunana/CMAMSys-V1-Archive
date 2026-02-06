/**
 * Solutions API
 * POST /api/solutions - 创建解法
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * POST: 创建解法
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { problemId, type, title, description, content, author, awardLevel, files } = body;

    // 验证必填字段
    if (!problemId || !type || !title) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 验证题目是否存在
    const problem = await prisma.problem.findUnique({
      where: { id: problemId, deletedAt: null },
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

    const solution = await prisma.solution.create({
      data: {
        problemId,
        type,
        title,
        description,
        content,
        author,
        awardLevel,
        files,
      },
      include: {
        aiContents: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: solution,
        message: 'Solution created successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create solution',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
