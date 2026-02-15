/**
 * Cleanup Service
 * 定时清理服务 - 清理过期的令牌和日志
 */

import prisma from '@/lib/prisma';

export interface CleanupResult {
  deletedPasswordResetTokens: number;
  deletedRefreshTokens: number;
  deletedOldLoginLogs: number;
  deletedOldAuditLogs: number;
  success: boolean;
  error?: string;
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredPasswordResetTokens(): Promise<number> {
  try {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // Expired tokens
          { usedAt: { not: null } }, // Used tokens (cleanup after use)
        ],
      },
    });

    console.log(`Cleaned up ${result.count} expired password reset tokens`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired password reset tokens:', error);
    throw error;
  }
}

/**
 * Clean up expired refresh tokens
 */
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // Expired tokens
          { revokedAt: { not: null } }, // Revoked tokens
        ],
      },
    });

    console.log(`Cleaned up ${result.count} expired/revoked refresh tokens`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired refresh tokens:', error);
    throw error;
  }
}

/**
 * Clean up old login logs
 */
export async function cleanupOldLoginLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.loginLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old login logs (older than ${daysToKeep} days)`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up old login logs:', error);
    throw error;
  }
}

/**
 * Clean up old audit logs
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 365): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old audit logs (older than ${daysToKeep} days)`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up old audit logs:', error);
    throw error;
  }
}

/**
 * Run all cleanup tasks
 */
export async function runCleanupTasks(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedPasswordResetTokens: 0,
    deletedRefreshTokens: 0,
    deletedOldLoginLogs: 0,
    deletedOldAuditLogs: 0,
    success: false,
  };

  try {
    const loginLogsDays = parseInt(process.env.CLEANUP_LOGIN_LOGS_DAYS || '90');
    const auditLogsDays = parseInt(process.env.CLEANUP_AUDIT_LOGS_DAYS || '365');

    // Run cleanup tasks in parallel
    const [deletedPasswordResetTokens, deletedRefreshTokens, deletedOldLoginLogs, deletedOldAuditLogs] = await Promise.all([
      cleanupExpiredPasswordResetTokens(),
      cleanupExpiredRefreshTokens(),
      cleanupOldLoginLogs(loginLogsDays),
      cleanupOldAuditLogs(auditLogsDays),
    ]);

    result.deletedPasswordResetTokens = deletedPasswordResetTokens;
    result.deletedRefreshTokens = deletedRefreshTokens;
    result.deletedOldLoginLogs = deletedOldLoginLogs;
    result.deletedOldAuditLogs = deletedOldAuditLogs;
    result.success = true;

    console.log('✅ All cleanup tasks completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Error running cleanup tasks:', error);
    result.error = String(error);
    return result;
  }
}

/**
 * Get cleanup statistics
 */
export async function getCleanupStatistics() {
  try {
    const [
      expiredPasswordResetTokens,
      expiredRefreshTokens,
      oldLoginLogs,
      oldAuditLogs,
    ] = await Promise.all([
      prisma.passwordResetToken.count({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { usedAt: { not: null } },
          ],
        },
      }),
      prisma.refreshToken.count({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { revokedAt: { not: null } },
          ],
        },
      }),
      prisma.loginLog.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - (parseInt(process.env.CLEANUP_LOGIN_LOGS_DAYS || '90') * 24 * 60 * 60 * 1000)),
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - (parseInt(process.env.CLEANUP_AUDIT_LOGS_DAYS || '365') * 24 * 60 * 60 * 1000)),
          },
        },
      }),
    ]);

    return {
      expiredPasswordResetTokens,
      expiredRefreshTokens,
      oldLoginLogs,
      oldAuditLogs,
    };
  } catch (error) {
    console.error('Error getting cleanup statistics:', error);
    return null;
  }
}

/**
 * Schedule cleanup tasks
 * This should be called during application startup
 */
let cleanupInterval: NodeJS.Timeout | null = null;

export function scheduleCleanupTasks(intervalHours: number = 24): void {
  if (cleanupInterval) {
    console.warn('Cleanup tasks are already scheduled');
    return;
  }

  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`Scheduling cleanup tasks to run every ${intervalHours} hours`);

  // Run immediately
  runCleanupTasks().catch((error) => {
    console.error('Initial cleanup failed:', error);
  });

  // Schedule periodic cleanup
  cleanupInterval = setInterval(() => {
    console.log('Running scheduled cleanup tasks...');
    runCleanupTasks().catch((error) => {
      console.error('Scheduled cleanup failed:', error);
    });
  }, intervalMs);
}

/**
 * Stop scheduled cleanup tasks
 */
export function stopScheduledCleanupTasks(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('Stopped scheduled cleanup tasks');
  }
}

// Graceful shutdown
process.on('beforeExit', stopScheduledCleanupTasks);
