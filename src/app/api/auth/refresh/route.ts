/**
 * Refresh Token API
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { generateToken } from '@/lib/crypto';
import { ApiResponse, RefreshTokenRequest, AuthResponse, UserDTO, UserRole } from '@/lib/types';

// Validation schema
const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: RefreshTokenRequest = await request.json();
    const validationResult = refreshSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { refreshToken } = validationResult.data;

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

    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Refresh token not found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (storedToken.revokedAt) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Refresh token has been revoked',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (storedToken.expiresAt < new Date()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Refresh token has expired',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Verify that the token belongs to the user
    if (storedToken.userId !== payload.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token does not belong to this user',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new refresh token
    const newRefreshTokenId = generateToken();
    const newRefreshToken = await generateRefreshToken(
      {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
      newRefreshTokenId
    );

    // Store new refresh token
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Generate new access token
    const accessToken = await generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role as UserRole,
    });

    // Prepare user DTO
    const userDTO: UserDTO = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
      role: storedToken.user.role as UserRole,
      isVerified: storedToken.user.isVerified,
      isMfaEnabled: storedToken.user.isMfaEnabled,
      avatar: storedToken.user.avatar || undefined,
      bio: storedToken.user.bio || undefined,
      organization: storedToken.user.organization || undefined,
      createdAt: storedToken.user.createdAt.toISOString(),
    };

    // Prepare response
    const response: AuthResponse = {
      user: userDTO,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };

    return NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while refreshing token',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
