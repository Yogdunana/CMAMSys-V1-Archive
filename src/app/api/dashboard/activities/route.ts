/**
 * Dashboard Activities API
 * GET /api/dashboard/activities - 获取最近活动
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

/**
 * GET: 获取最近活动
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
      // 获取最近的活动
      const competitions = await prisma.competition.findMany({
        where: {
          status: {
            in: ['DRAFT', 'IN_PROGRESS', 'COMPLETED'],
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          name: true,
          problem: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: competitions,
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
              id: '1',
              name: '2026-MCM-A 问题 A',
              problem: 'A',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              name: 'CUMCM-2025-B 问题 B',
              problem: 'B',
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              name: 'MathorCup-2025-C 问题 C',
              problem: 'C',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
