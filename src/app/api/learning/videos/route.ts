/**
 * Bilibili Videos API
 * GET /api/learning/videos - 获取视频列表
 * PUT /api/learning/videos/:id - 更新视频状态（标记为好视频/忽略）
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
 * GET: 获取视频列表
 */
export async function GET(request: NextRequest) {
  try {
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

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isFavorite = searchParams.get('isFavorite');
    const isIgnored = searchParams.get('isIgnored');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 构建查询条件
    const where: any = {};
    if (status) {
      where.learningStatus = status;
    }
    if (isFavorite === 'true') {
      where.isFavorite = true;
    }
    if (isIgnored === 'true') {
      where.isIgnored = true;
    }

    // 查询视频
    const videos = await prisma.bilibiliVideo.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        learningTasks: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            knowledgeEntries: true,
          },
        },
      },
    });

    // 获取总数
    const total = await prisma.bilibiliVideo.count({ where });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          videos,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
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
          message: 'Failed to fetch videos',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
