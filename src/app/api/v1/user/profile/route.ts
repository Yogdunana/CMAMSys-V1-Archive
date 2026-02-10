/**
 * User Profile API v1
 * GET /api/v1/user/profile - Get user profile
 * PUT /api/v1/user/profile - Update user profile
 *
 * @version 1.0.0
 * @route /api/v1/user/profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { z } from 'zod';
import { applyRateLimit } from '@/lib/rate-limit';
import { validateCSRFToken } from '@/lib/csrf';

const updateProfileSchema = z.object({
  username: z.string().min(1).max(50),
  bio: z.string().max(200).optional(),
  organization: z.string().max(100).optional(),
  avatar: z.string().url().optional().nullable(),
});

/**
 * GET: Get user profile
 * 速率限制: general preset
 * 认证: Bearer Token
 */
export async function GET(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = await applyRateLimit({
      request,
      preset: 'general',
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isMfaEnabled: true,
        avatar: true,
        bio: true,
        organization: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
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
          message: 'Failed to fetch user profile',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update user profile
 * 速率限制: general preset
 * 认证: Bearer Token
 * CSRF Protection: Required
 */
export async function PUT(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = await applyRateLimit({
      request,
      preset: 'general',
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
    const csrfResult = await validateCSRFToken({
      request,
      strict: true,
    });

    if (!csrfResult.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid CSRF token',
            details: csrfResult,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

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

    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid profile data',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 检查用户名是否已被其他用户占用
    const existingUser = await prisma.user.findFirst({
      where: {
        username: validationResult.data.username,
        id: { not: payload.userId },
      },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username is already taken',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: validationResult.data,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isMfaEnabled: true,
        avatar: true,
        bio: true,
        organization: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
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
          message: 'Failed to update user profile',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
