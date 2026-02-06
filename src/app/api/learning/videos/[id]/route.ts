/**
 * Bilibili Video API - 更新视频状态
 * PUT /api/learning/videos/[id] - 更新视频状态（标记为好视频/忽略）
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/types';

// Validation schema
const updateVideoSchema = z.object({
  isFavorite: z.boolean().optional(),
  isIgnored: z.boolean().optional(),
});

/**
 * PUT: 更新视频状态
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 解析和验证请求体
    const body = await request.json();
    const validationResult = updateVideoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid video update data',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 更新视频状态
    const video = await prisma.bilibiliVideo.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: video,
        message: 'Video status updated successfully',
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
          message: 'Failed to update video status',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
