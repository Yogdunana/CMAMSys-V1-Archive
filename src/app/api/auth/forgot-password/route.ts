/**
 * Forgot Password API
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/crypto';
import { ApiResponse } from '@/lib/types';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
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

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = generateToken();

      // Set token expiry to 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

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

      // TODO: Send password reset email
      // For now, we'll just log the reset link
      // In production, you should send this via email service (e.g., SendGrid, Mailgun, AWS SES)
      const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-password?token=${resetToken}`;

      console.log('Password reset link:', resetLink);

      // Development mode: return the reset link for testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: {
              message: 'If an account exists with this email, a password reset link has been sent.',
              resetLink: resetLink, // Only in development
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
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
      { status: 200 }
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
