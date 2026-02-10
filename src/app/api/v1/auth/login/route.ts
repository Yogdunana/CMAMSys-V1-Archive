/**
 * User Login API (v1)
 * POST /api/v1/auth/login
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { generateToken } from '@/lib/crypto';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { ApiResponse, LoginRequest, AuthResponse, UserDTO, UserRole } from '@/lib/types';
import { createApiMiddleware, MiddlewarePresets, addSecurityHeaders } from '@/lib/api-middleware';
import type { ApiVersion } from '@/lib/api-version';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().optional(),
});

async function handler(
  request: NextRequest,
  version: ApiVersion = 'v1'
) {
  try {
    // Parse and validate request body
    const body: LoginRequest = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response as any);
    }

    const { email, password, mfaCode } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response as any);
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account is locked due to too many failed attempts',
            details: {
              lockedUntil: user.lockedUntil.toISOString(),
            },
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 423,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response as any);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash || '');

    if (!isPasswordValid) {
      // Increment failed login attempts
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION_MS || '900000'); // 15 minutes

      const newFailedAttempts = user.failedLoginAttempts + 1;
      let shouldLockAccount = false;
      let lockedUntil: Date | undefined;

      if (newFailedAttempts >= maxAttempts) {
        shouldLockAccount = true;
        lockedUntil = new Date(Date.now() + lockoutDuration);
      }

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil,
        },
      });

      if (shouldLockAccount) {
        const response = new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'ACCOUNT_LOCKED',
              message: `Account locked for ${lockoutDuration / 60000} minutes due to too many failed attempts`,
              details: {
                lockedUntil: lockedUntil!.toISOString(),
              },
            },
            timestamp: new Date().toISOString(),
          }),
          {
            status: 423,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        return addSecurityHeaders(response as any);
      }

      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            details: {
              attemptsRemaining: maxAttempts - newFailedAttempts,
            },
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response as any);
    }

    // Check MFA if enabled
    if (user.isMfaEnabled && user.mfaSecret) {
      if (!mfaCode) {
        const response = new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'MFA_REQUIRED',
              message: 'Multi-factor authentication code required',
            },
            timestamp: new Date().toISOString(),
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        return addSecurityHeaders(response as any);
      }

      // Import TOTP verification
      const { verifyTOTP } = await import('@/lib/crypto');
      const isMfaValid = verifyTOTP(user.mfaSecret, mfaCode);

      if (!isMfaValid) {
        const response = new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_MFA_CODE',
              message: 'Invalid multi-factor authentication code',
            },
            timestamp: new Date().toISOString(),
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        return addSecurityHeaders(response as any);
      }
    }

    // Reset failed attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate refresh token
    const refreshTokenId = generateToken();
    const refreshToken = await generateRefreshToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      refreshTokenId
    );

    // Store refresh token in database
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        tokenId: refreshTokenId,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Generate access token
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create user DTO
    const userDTO: UserDTO = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      isMfaEnabled: user.isMfaEnabled,
      createdAt: user.createdAt.toISOString(),
    };

    // Create auth response
    const authResponse: AuthResponse = {
      user: userDTO,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };

    // Create response with security headers
    const response = new Response(
      JSON.stringify({
        success: true,
        data: authResponse,
        timestamp: new Date().toISOString(),
      } as ApiResponse<AuthResponse>),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `refresh_token=${refreshToken}; path=/; secure; httponly; samesite=strict; max-age=${7 * 24 * 60 * 60}`,
        },
      }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Login error:', error);

    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during login',
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

// Export with middleware (auth preset: strict rate limiting, CSRF required)
export const POST = createApiMiddleware(handler, MiddlewarePresets.auth);
