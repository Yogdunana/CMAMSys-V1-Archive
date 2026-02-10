/**
 * Refresh Token API (v1)
 * POST /api/v1/auth/refresh
 */

import { NextRequest } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { ApiResponse, AuthResponse, UserDTO, UserRole } from '@/lib/types';
import { createApiMiddleware, MiddlewarePresets, addSecurityHeaders } from '@/lib/api-middleware';

async function handler(request: NextRequest, context?: { params?: Promise<any> }) {
  try {
    const refreshToken = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!refreshToken) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required',
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

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
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

    // Check if token is revoked
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revokedAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!tokenRecord) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'REVOKED_REFRESH_TOKEN',
            message: 'Refresh token has been revoked or expired',
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response);
    }

    // Generate new access token
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create user DTO
    const userDTO: UserDTO = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      isMfaEnabled: user.isMfaEnabled,
      createdAt: user.createdAt.toISOString(),
    };

    const authResponse: AuthResponse = {
      user: userDTO,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };

    const response = new Response(
      JSON.stringify({
        success: true,
        data: authResponse,
        timestamp: new Date().toISOString(),
      } as ApiResponse<AuthResponse>),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to refresh token',
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
