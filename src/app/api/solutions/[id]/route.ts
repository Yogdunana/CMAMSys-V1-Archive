/**
 * Solution Detail API
 * PUT /api/solutions/[id] - 更新解法
 * DELETE /api/solutions/[id] - 删除解法
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * PUT: 更新解法
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { type, title, description, content, author, awardLevel, files } = body;

    // 验证解法是否存在
    const existingSolution = await prisma.solution.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!existingSolution) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Solution not found' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const solution = await prisma.solution.update({
      where: { id: params.id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(author !== undefined && { author }),
        ...(awardLevel !== undefined && { awardLevel }),
        ...(files !== undefined && { files }),
      },
      include: {
        aiContents: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: solution,
        message: 'Solution updated successfully',
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
          message: 'Failed to update solution',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 删除解法（软删除）
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    // 验证解法是否存在
    const existingSolution = await prisma.solution.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!existingSolution) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Solution not found' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 软删除
    await prisma.solution.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Solution deleted successfully',
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
          message: 'Failed to delete solution',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
