/**
 * Logout API (v1)
 * POST /api/v1/auth/logout
 */

import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { createApiMiddleware, MiddlewarePresets, addSecurityHeaders } from '@/lib/api-middleware';
import type { ApiVersion } from '@/lib/api-version';

async function handler(request: NextRequest, version: ApiVersion = 'v1') {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response);
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response);
    }

    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: {
        userId: payload.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      } as ApiResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'refresh_token=; path=/; secure; httponly; samesite=strict; max-age=0',
        },
      }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to logout',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return addSecurityHeaders(response);
  }
}

// Export with middleware (general preset: standard rate limiting)
export const POST = createApiMiddleware(handler, MiddlewarePresets.general);
