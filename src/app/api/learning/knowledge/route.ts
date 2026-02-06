/**
 * Knowledge Base API
 * GET /api/learning/knowledge - 获取知识库条目
 * POST /api/learning/knowledge - 创建知识库条目
 * GET /api/learning/knowledge/search - 搜索知识库
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/types';

// Validation schema
const createKnowledgeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  summary: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sourceType: z.enum(['video', 'article', 'manual']).optional(),
  sourceId: z.string().optional(),
});

/**
 * GET: 获取知识库条目
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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 构建查询条件
    const where: any = { status: 'active' };
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    // 查询知识库条目
    const entries = await prisma.knowledgeBaseEntry.findMany({
      where,
      include: {
        videoKnowledge: {
          select: {
            video: {
              select: {
                bvid: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 获取总数
    const total = await prisma.knowledgeBaseEntry.count({ where });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          entries,
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
          message: 'Failed to fetch knowledge base',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST: 创建知识库条目
 */
export async function POST(request: NextRequest) {
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
    const validationResult = createKnowledgeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid knowledge entry data',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 创建知识库条目
    const entry = await prisma.knowledgeBaseEntry.create({
      data: {
        ...validationResult.data,
        tags: validationResult.data.tags || [],
        sourceType: validationResult.data.sourceType || 'manual',
        status: 'active',
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: entry,
        message: 'Knowledge entry created successfully',
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
          message: 'Failed to create knowledge entry',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
