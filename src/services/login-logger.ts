/**
 * Login Logger Service
 * 登录日志记录服务
 */

import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export interface LoginLogData {
  userId?: string;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  failureReason?: string;
}

/**
 * Create a login log entry
 */
export async function createLoginLog(data: LoginLogData) {
  try {
    await prisma.loginLog.create({
      data: {
        userId: data.userId,
        email: data.email,
        success: data.success,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        errorMessage: data.errorMessage,
        failureReason: data.failureReason,
      },
    });
  } catch (error) {
    console.error('Failed to create login log:', error);
    // Don't throw error to avoid disrupting login process
  }
}

/**
 * Extract IP address from request
 */
export function extractIpAddress(request: NextRequest): string | undefined {
  // Check various headers for IP address
  const headers = {
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'x-real-ip': request.headers.get('x-real-ip'),
    'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
    'x-client-ip': request.headers.get('x-client-ip'),
  };

  // Prioritize headers in order
  for (const [header, value] of Object.entries(headers)) {
    if (value) {
      // Extract the first IP if there are multiple (comma-separated)
      const ip = value.split(',')[0].trim();
      // Validate IP address format
      if (/^[0-9a-f:.]+$/i.test(ip)) {
        return ip;
      }
    }
  }

  return undefined;
}

/**
 * Extract user agent from request
 */
export function extractUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * Get recent login logs for a user
 */
export async function getUserRecentLoginLogs(
  userId: string,
  limit: number = 10
) {
  return prisma.loginLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get failed login attempts for an email
 */
export async function getFailedLoginAttempts(
  email: string,
  timeWindow: number = 15 * 60 * 1000 // 15 minutes default
): Promise<number> {
  const since = new Date(Date.now() - timeWindow);

  const count = await prisma.loginLog.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: since,
      },
    },
  });

  return count;
}

/**
 * Get login statistics
 */
export async function getLoginStats(
  startDate?: Date,
  endDate?: Date
) {
  const where = {
    ...(startDate && { createdAt: { gte: startDate } }),
    ...(endDate && { createdAt: { lte: endDate } }),
  };

  const [total, successful, failed, uniqueUsers] = await Promise.all([
    prisma.loginLog.count({ where }),
    prisma.loginLog.count({ where: { ...where, success: true } }),
    prisma.loginLog.count({ where: { ...where, success: false } }),
    prisma.loginLog.findMany({
      where: { ...where, success: true },
      select: { userId: true },
      distinct: ['userId'],
    }),
  ]);

  return {
    total,
    successful,
    failed,
    uniqueUsers: uniqueUsers.length,
    successRate: total > 0 ? (successful / total) * 100 : 0,
  };
}
