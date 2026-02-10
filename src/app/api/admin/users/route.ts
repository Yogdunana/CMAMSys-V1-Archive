/**
 * Admin Users API
 * GET /api/admin/users - Get all users
 * POST /api/admin/users - Create new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/auth-middleware';
import { PermissionCategory, PermissionAction } from '@/lib/rbac';
import { ApiResponse } from '@/lib/types';

// Validation schema for creating user
const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'USER']),
});

/**
 * GET /api/admin/users
 * Get all users
 */
export async function GET(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.USER_MANAGEMENT,
    PermissionAction.READ,
    async (req, user) => {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isVerified: true,
            isMfaEnabled: true,
            createdAt: true,
            lastLoginAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: users,
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      } catch (error) {
        console.error('Failed to get users:', error);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to get users',
              details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }
  );
}

/**
 * POST /api/admin/users
 * Create new user
 */
export async function POST(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.USER_MANAGEMENT,
    PermissionAction.CREATE,
    async (req, user) => {
      try {
        const body = await request.json();
        const validationResult = createUserSchema.safeParse(body);

        if (!validationResult.success) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid user data',
                details: validationResult.error.issues,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }

        const { username, email, password, role } = validationResult.data;

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUsername) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: {
                code: 'USERNAME_EXISTS',
                message: 'Username already exists',
              },
              timestamp: new Date().toISOString(),
            },
            { status: 409 }
          );
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: {
                code: 'EMAIL_EXISTS',
                message: 'Email already exists',
              },
              timestamp: new Date().toISOString(),
            },
            { status: 409 }
          );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
          password,
          parseInt(process.env.BCRYPT_ROUNDS || '12')
        );

        // Create user
        const newUser = await prisma.user.create({
          data: {
            username,
            email,
            passwordHash: hashedPassword,
            role,
            isVerified: false, // New users need to verify email
            isMfaEnabled: false,
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isVerified: true,
            isMfaEnabled: true,
            createdAt: true,
          },
        });

        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: newUser,
            message: 'User created successfully',
            timestamp: new Date().toISOString(),
          },
          { status: 201 }
        );
      } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create user',
              details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }
  );
}
