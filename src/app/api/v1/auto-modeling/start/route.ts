/**
 * Auto Modeling Start API v1
 * POST /api/v1/auto-modeling/start - 启动全自动化建模流程
 *
 * @version 1.0.0
 * @route /api/v1/auto-modeling/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { executeFullAutoProcess } from '@/services/auto-process-coordinator';
import { applyRateLimit } from '@/lib/rate-limit';
import { validateCSRFToken } from '@/lib/csrf';
import { ApiResponse } from '@/lib/types';

/**
 * POST: 启动全自动化建模流程
 * 速率限制: modelingTask preset
 * 认证: Bearer Token
 * CSRF Protection: Required
 */
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = await applyRateLimit({
      request,
      preset: 'modelingTask',
    });

    if (rateLimitResult.blocked) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            details: rateLimitResult,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 验证 CSRF Token
    const csrfValid = await validateCSRFToken(request);

    if (!csrfValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid CSRF token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 验证身份
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

    // 获取请求参数
    const body = await request.json();
    const {
      competitionType,
      problemType,
      problemTitle,
      problemContent,
      paperFormat = 'MCM',
      paperLanguage = 'ENGLISH',
    } = body;

    // 验证必填参数
    if (!competitionType || !problemType || !problemTitle || !problemContent) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必填参数',
            details: {
              required: ['competitionType', 'problemType', 'problemTitle', 'problemContent'],
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 验证参数格式
    const validCompetitionTypes = ['MCM', 'ICM', 'NORAM'];
    const validProblemTypes = ['A', 'B', 'C', 'D', 'E', 'F'];
    const validPaperFormats = ['MCM', 'ICM'];
    const validPaperLanguages = ['ENGLISH', 'CHINESE'];

    if (!validCompetitionTypes.includes(competitionType)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid competition type',
            details: {
              validValues: validCompetitionTypes,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!validProblemTypes.includes(problemType)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid problem type',
            details: {
              validValues: validProblemTypes,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!validPaperFormats.includes(paperFormat)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid paper format',
            details: {
              validValues: validPaperFormats,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!validPaperLanguages.includes(paperLanguage)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid paper language',
            details: {
              validValues: validPaperLanguages,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 执行全自动化流程（后台执行）
    // 注意：这里使用异步执行，避免阻塞响应
    const taskId = await executeFullAutoProcess(
      payload.userId,
      competitionType,
      problemType,
      problemTitle,
      problemContent,
      paperFormat,
      paperLanguage
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          taskId,
          message: '全自动化流程已启动',
          tip: '您可以在"自动化任务"页面查看执行进度',
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 202,
        headers: {
          'X-API-Version': 'v1',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '启动自动化流程失败',
          details: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : 'Unknown error')
            : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
