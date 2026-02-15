/**
 * User Login API
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { generateToken, verifyTOTP } from '@/lib/crypto';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { ApiResponse, LoginRequest, AuthResponse, UserDTO, UserRole } from '@/lib/types';
import { createLoginLog, extractIpAddress, extractUserAgent } from '@/services/login-logger';
import { detectBruteForceAttack, detectAccountLockout } from '@/services/login-anomaly-service';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: LoginRequest = await request.json();
    const validationResult = loginSchema.safeParse(body);

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

    const { email, password, mfaCode } = validationResult.data;

    // Extract IP and user agent for logging
    const ipAddress = extractIpAddress(request);
    const userAgent = extractUserAgent(request);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Log failed login attempt
      await createLoginLog({
        email,
        success: false,
        ipAddress,
        userAgent,
        failureReason: 'USER_NOT_FOUND',
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      // Log login attempt on locked account
      await createLoginLog({
        userId: user.id,
        email,
        success: false,
        ipAddress,
        userAgent,
        failureReason: 'ACCOUNT_LOCKED',
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account is locked due to too many failed attempts',
            details: {
              lockedUntil: user.lockedUntil.toISOString(),
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 423 }
      );
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

      // Log failed login attempt
      await createLoginLog({
        userId: user.id,
        email,
        success: false,
        ipAddress,
        userAgent,
        failureReason: shouldLockAccount ? 'ACCOUNT_LOCKED_TOO_MANY_ATTEMPTS' : 'INVALID_PASSWORD',
      });

      // Detect brute force attack
      const bruteForceAlert = await detectBruteForceAttack(email);
      if (bruteForceAlert) {
        console.error('[SECURITY ALERT] Brute force attack detected:', bruteForceAlert.details);
        // In production, send alert to security team
      }

      if (shouldLockAccount) {
        // Detect account lockout anomaly
        const lockoutAlert = await detectAccountLockout(email);
        if (lockoutAlert) {
          console.error('[SECURITY ALERT] Account lockout:', lockoutAlert.details);
        }

        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'ACCOUNT_LOCKED',
              message: `Account locked for ${lockoutDuration / 60000} minutes due to too many failed attempts`,
              details: {
                lockedUntil: lockedUntil!.toISOString(),
              },
            },
            timestamp: new Date().toISOString(),
          },
          { status: 423 }
        );
      }

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            details: {
              attemptsRemaining: maxAttempts - newFailedAttempts,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check MFA if enabled
    if (user.isMfaEnabled && user.mfaSecret) {
      if (!mfaCode) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'MFA_REQUIRED',
              message: 'Multi-factor authentication code required',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      const isMfaValid = verifyTOTP(user.mfaSecret, mfaCode);

      if (!isMfaValid) {
        // Log failed MFA attempt
        await createLoginLog({
          userId: user.id,
          email,
          success: false,
          ipAddress,
          userAgent,
          failureReason: 'INVALID_MFA_CODE',
        });

        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_MFA_CODE',
              message: 'Invalid multi-factor authentication code',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
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

    // Log successful login
    await createLoginLog({
      userId: user.id,
      email,
      success: true,
      ipAddress,
      userAgent,
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
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Generate access token
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Prepare user DTO
    const userDTO: UserDTO = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      isMfaEnabled: user.isMfaEnabled,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      organization: user.organization || undefined,
      createdAt: user.createdAt.toISOString(),
    };

    // Prepare response
    const response: AuthResponse = {
      user: userDTO,
      accessToken,
      refreshToken,
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
    console.error('Login error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during login',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
