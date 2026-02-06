/**
 * Learning Config API - B 端视频学习配置
 * GET /api/learning/config - 获取学习配置
 * PUT /api/learning/config - 更新学习配置
 * POST /api/learning/config/reset - 重置为默认配置
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/types';

// Validation schema
const learningConfigSchema = z.object({
  autoLearningEnabled: z.boolean(),
  dailyVideoTarget: z.number().int().min(1).max(20),
  learningStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  learningEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  allowedDaysOfWeek: z.array(z.string()),
  maxConcurrentTasks: z.number().int().min(1).max(10),
  pauseOnHighLoad: z.boolean(),
  cpuThreshold: z.number().int().min(1).max(100),
  memoryThreshold: z.number().int().min(1).max(100),
  searchKeywords: z.array(z.string().min(1)),
  searchResultsLimit: z.number().int().min(1).max(50),
  minVideoDuration: z.number().int().min(60),
  maxVideoDuration: z.number().int().min(60),
  minViewCount: z.number().int().min(0),
  learningMode: z.enum(['auto', 'manual']),
  requiredTags: z.array(z.string().min(1)),
});

/**
 * GET: 获取学习配置
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

    // 获取或创建学习配置
    let config = await prisma.learningConfig.findFirst();

    if (!config) {
      // 创建默认配置
      config = await prisma.learningConfig.create({
        data: {
          autoLearningEnabled: true,
          dailyVideoTarget: 3,
          learningStartTime: '00:00',
          learningEndTime: '06:00',
          allowedDaysOfWeek: ['0', '1', '2', '3', '4', '5', '6'],
          maxConcurrentTasks: 2,
          pauseOnHighLoad: true,
          cpuThreshold: 80,
          memoryThreshold: 80,
          searchKeywords: ['数学建模', 'matlab', 'python', '机器学习', '数据分析', '优化算法'],
          searchResultsLimit: 10,
          minVideoDuration: 300,
          maxVideoDuration: 3600,
          minViewCount: 1000,
          learningMode: 'auto',
          requiredTags: [],
        },
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: config,
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
          message: 'Failed to fetch learning config',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: 更新学习配置
 */
export async function PUT(request: NextRequest) {
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
    const validationResult = learningConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid learning config',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 获取现有配置
    const existingConfig = await prisma.learningConfig.findFirst();

    let config;
    if (existingConfig) {
      // 更新配置
      config = await prisma.learningConfig.update({
        where: { id: existingConfig.id },
        data: validationResult.data,
      });
    } else {
      // 创建配置
      config = await prisma.learningConfig.create({
        data: validationResult.data,
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: config,
        message: 'Learning config updated successfully',
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
          message: 'Failed to update learning config',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
