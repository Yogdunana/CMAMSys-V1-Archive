/**
 * Refresh Token API
 * POST /api/auth/refresh - Refresh access token using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Refresh token is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check if refresh token exists in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Refresh token not found or expired',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check if user is still active
    if (tokenRecord.user.deletedAt) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'USER_DELETED',
            message: 'User account has been deleted',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Generate new tokens
    const newAccessToken = await generateAccessToken({
      userId: tokenRecord.userId,
      email: tokenRecord.user.email,
      username: tokenRecord.user.username,
      role: tokenRecord.user.role,
    });

    const newRefreshToken = await generateRefreshToken({
      userId: tokenRecord.userId,
      email: tokenRecord.user.email,
      username: tokenRecord.user.username,
      role: tokenRecord.user.role,
    }, tokenRecord.tokenId);

    // Update refresh token in database
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { token: newRefreshToken },
    });

    // Return user info
    const user = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      username: tokenRecord.user.username,
      role: tokenRecord.user.role,
      isVerified: tokenRecord.user.isVerified,
      isMfaEnabled: tokenRecord.user.isMfaEnabled,
      avatar: tokenRecord.user.avatar,
      bio: tokenRecord.user.bio,
      organization: tokenRecord.user.organization,
      createdAt: tokenRecord.user.createdAt,
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 15 * 60, // 15 minutes
          user,
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
          message: 'Failed to refresh token',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
