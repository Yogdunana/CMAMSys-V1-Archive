/**
 * Forgot Password API with Rate Limit and CAPTCHA
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/crypto';
import { sendResetPasswordEmail } from '@/lib/email-service';
import { checkRateLimit } from '@/lib/rate-limiter';
import { verifyCaptcha } from '@/lib/captcha-service';
import { ApiResponse } from '@/lib/types';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  captchaId: z.string().min(1, 'CAPTCHA ID is required'),
  captchaCode: z.string().min(1, 'CAPTCHA code is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    const maxAttempts = parseInt(process.env.PASSWORD_RESET_MAX_ATTEMPTS || '3');
    const rateLimitWindow = 60 * 60 * 1000; // 1 hour
    const rateLimitResult = checkRateLimit(
      `password-reset:${ip}`,
      maxAttempts,
      rateLimitWindow
    );

    if (!rateLimitResult.allowed) {
      const headers = new Headers({
        'X-RateLimit-Limit': maxAttempts.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
        ...(rateLimitResult.retryAfter ? { 'Retry-After': rateLimitResult.retryAfter.toString() } : {}),
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many password reset requests. Please try again later.`,
            details: {
              retryAfter: rateLimitResult.retryAfter,
            },
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = forgotPasswordSchema.safeParse(body);

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

    const { email, captchaId, captchaCode } = validationResult.data;

    // Verify CAPTCHA
    const captchaResult = verifyCaptcha(captchaId, captchaCode);
    if (!captchaResult.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_CAPTCHA',
            message: captchaResult.error || 'Invalid CAPTCHA code',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = generateToken();

      // Get token expiry from environment variables
      const expiryMinutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || '60');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Create reset link
      const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-password?token=${resetToken}`;

      // Send password reset email
      try {
        await sendResetPasswordEmail({
          to: user.email,
          resetLink,
          username: user.username,
          expiryMinutes,
        });

        console.log(`Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Continue without throwing error to prevent email enumeration
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': maxAttempts.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Forgot password error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while processing your request',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
