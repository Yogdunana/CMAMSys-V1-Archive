/**
 * Dashboard Activities API
 * GET /api/dashboard/activities - 获取最近活动
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * GET: 获取最近活动（最近查看或创建的题目）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证认证（开发模式下跳过）
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
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
    }

    try {
      // 获取最近创建的题目
      const problems = await prisma.problem.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          competition: {
            select: {
              id: true,
              name: true,
              year: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: problems.map(p => ({
            id: p.id,
            name: `${p.competition.name} - ${p.title}`,
            problemNumber: p.problemNumber,
            competitionName: p.competition.name,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (dbError) {
      // 数据库不可用时返回 mock 数据
      console.error('Database error:', dbError);
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: [
            {
              id: 'prob-001',
              name: '2025-MCM-A - 持续捕鱼',
              problemNumber: 'A',
              competitionName: '2025-MCM',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'prob-002',
              name: '2024-MCM-B - 地球生态系统的碳汇',
              problemNumber: 'B',
              competitionName: '2024-MCM',
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard activities',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
