/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { generateToken } from '@/lib/crypto';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { ApiResponse, RegisterRequest, AuthResponse, UserDTO, UserRole } from '@/lib/types';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: RegisterRequest = await request.json();
    const validationResult = registerSchema.safeParse(body);

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

    const { email, username, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: existingUser.email === email
              ? 'Email already registered'
              : 'Username already taken',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Validate password strength
    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.isValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password does not meet strength requirements',
            details: passwordStrength.errors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        authProvider: 'LOCAL',
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
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during registration',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
