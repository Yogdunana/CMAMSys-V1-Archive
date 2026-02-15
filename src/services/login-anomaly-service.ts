/**
 * Login Anomaly Detection Service
 * 登录异常检测和告警服务
 */

import prisma from '@/lib/prisma';

export interface AnomalyAlert {
  type: 'BRUTE_FORCE' | 'ACCOUNT_LOCKOUT' | 'UNUSUAL_LOCATION' | 'SUSPICIOUS_PATTERN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: any;
  timestamp: Date;
}

export interface LoginPattern {
  userId: string;
  email: string;
  commonIPs: string[];
  commonUserAgents: string[];
  loginTimes: number[];
  lastSuccessfulLogin: Date | null;
  failedAttempts: number;
}

/**
 * Detect brute force attack on a specific email
 */
export async function detectBruteForceAttack(
  email: string,
  timeWindowMinutes: number = 15
): Promise<AnomalyAlert | null> {
  const since = new Date();
  since.setMinutes(since.getMinutes() - timeWindowMinutes);

  const failedAttempts = await prisma.loginLog.count({
    where: {
      email,
      success: false,
      createdAt: { gte: since },
    },
  });

  const threshold = 10; // 10 failed attempts in time window

  if (failedAttempts >= threshold) {
    return {
      type: 'BRUTE_FORCE',
      severity: failedAttempts >= 20 ? 'CRITICAL' : 'HIGH',
      message: `Brute force attack detected on email: ${email}`,
      details: {
        email,
        failedAttempts,
        timeWindow: `${timeWindowMinutes} minutes`,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    };
  }

  return null;
}

/**
 * Detect account lockout anomaly
 */
export async function detectAccountLockout(email: string): Promise<AnomalyAlert | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      lockedUntil: true,
      failedLoginAttempts: true,
    },
  });

  if (!user || !user.lockedUntil) {
    return null;
  }

  // Check if this is a recent lockout
  const lockoutDuration = user.lockedUntil.getTime() - Date.now();
  if (lockoutDuration > 0 && lockoutDuration < 15 * 60 * 1000) {
    return {
      type: 'ACCOUNT_LOCKOUT',
      severity: 'HIGH',
      message: `Account locked out: ${user.email}`,
      details: {
        userId: user.id,
        email: user.email,
        username: user.username,
        failedAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
      },
      timestamp: new Date(),
    };
  }

  return null;
}

/**
 * Detect unusual login location
 */
export async function detectUnusualLocation(
  userId: string,
  currentIP: string,
  lookbackDays: number = 30
): Promise<AnomalyAlert | null> {
  // Get user's recent login logs
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);

  const recentLogins = await prisma.loginLog.findMany({
    where: {
      userId,
      success: true,
      createdAt: { gte: since },
    },
    select: { ipAddress: true },
    distinct: ['ipAddress'],
    take: 10,
  });

  const knownIPs = recentLogins.map(log => log.ipAddress).filter(Boolean);

  // If we have enough history and current IP is not known
  if (knownIPs.length >= 3 && !knownIPs.includes(currentIP)) {
    return {
      type: 'UNUSUAL_LOCATION',
      severity: 'MEDIUM',
      message: `Unusual login location detected for user`,
      details: {
        userId,
        currentIP,
        knownIPs: knownIPs.slice(0, 5), // Limit to 5 IPs
        lookbackPeriod: `${lookbackDays} days`,
      },
      timestamp: new Date(),
    };
  }

  return null;
}

/**
 * Analyze login patterns for a user
 */
export async function analyzeLoginPattern(userId: string): Promise<LoginPattern> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const recentLogins = await prisma.loginLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const commonIPs = getMostFrequentItems(
    recentLogins.filter(l => l.ipAddress).map(l => l.ipAddress!),
    5
  );

  const commonUserAgents = getMostFrequentItems(
    recentLogins.filter(l => l.userAgent).map(l => l.userAgent!),
    3
  );

  const successfulLogins = recentLogins.filter(l => l.success);
  const lastSuccessfulLogin = successfulLogins.length > 0 
    ? successfulLogins[0].createdAt 
    : null;

  const failedAttempts = recentLogins.filter(l => !l.success).length;

  return {
    userId,
    email: user.email,
    commonIPs,
    commonUserAgents,
    loginTimes: recentLogins.map(l => l.createdAt.getTime()),
    lastSuccessfulLogin,
    failedAttempts,
  };
}

/**
 * Get most frequent items from an array
 */
function getMostFrequentItems<T>(items: T[], limit: number): T[] {
  const frequency = new Map<T, number>();

  for (const item of items) {
    frequency.set(item, (frequency.get(item) || 0) + 1);
  }

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([item]) => item);
}

/**
 * Check for suspicious login patterns
 */
export async function detectSuspiciousPatterns(): Promise<AnomalyAlert[]> {
  const alerts: AnomalyAlert[] = [];

  // Check for users with excessive failed login attempts
  const suspiciousUsers = await prisma.user.findMany({
    where: {
      failedLoginAttempts: {
        gte: 3,
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      failedLoginAttempts: true,
    },
  });

  for (const user of suspiciousUsers) {
    alerts.push({
      type: 'SUSPICIOUS_PATTERN',
      severity: user.failedLoginAttempts >= 5 ? 'HIGH' : 'MEDIUM',
      message: `User has suspicious login pattern: ${user.email}`,
      details: {
        userId: user.id,
        email: user.email,
        username: user.username,
        failedAttempts: user.failedLoginAttempts,
      },
      timestamp: new Date(),
    });
  }

  return alerts;
}

/**
 * Log anomaly alert
 */
export async function logAnomalyAlert(alert: AnomalyAlert): Promise<void> {
  console.error(`[SECURITY ALERT] ${alert.type}: ${alert.message}`, alert.details);

  // In production, send to monitoring service (Sentry, Datadog, etc.)
  // Or send email to security team
}

/**
 * Run anomaly detection checks
 */
export async function runAnomalyDetection(email?: string, userId?: string): Promise<AnomalyAlert[]> {
  const alerts: AnomalyAlert[] = [];

  // Check for brute force attack
  if (email) {
    const bruteForceAlert = await detectBruteForceAttack(email);
    if (bruteForceAlert) {
      alerts.push(bruteForceAlert);
    }

    // Check for account lockout
    const lockoutAlert = await detectAccountLockout(email);
    if (lockoutAlert) {
      alerts.push(lockoutAlert);
    }
  }

  // Check for unusual location
  if (userId) {
    // This would need the current IP from the request
    // For now, we'll skip this check
  }

  // Check for suspicious patterns globally
  const suspiciousPatterns = await detectSuspiciousPatterns();
  alerts.push(...suspiciousPatterns);

  // Log alerts
  for (const alert of alerts) {
    await logAnomalyAlert(alert);
  }

  return alerts;
}

/**
 * Get security statistics
 */
export async function getSecurityStatistics() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    failedLoginsLastHour,
    failedLoginsLastDay,
    accountLockouts,
    uniqueIPsLastDay,
    usersWithFailedAttempts,
  ] = await Promise.all([
    prisma.loginLog.count({
      where: {
        success: false,
        createdAt: { gte: oneHourAgo },
      },
    }),
    prisma.loginLog.count({
      where: {
        success: false,
        createdAt: { gte: oneDayAgo },
      },
    }),
    prisma.user.count({
      where: {
        lockedUntil: { gte: now },
      },
    }),
    prisma.loginLog.findMany({
      where: {
        success: false,
        createdAt: { gte: oneDayAgo },
      },
      select: { ipAddress: true },
      distinct: ['ipAddress'],
    }).then(logins => logins.length),
    prisma.user.count({
      where: {
        failedLoginAttempts: { gte: 3 },
      },
    }),
  ]);

  return {
    failedLoginsLastHour,
    failedLoginsLastDay,
    accountLockouts,
    uniqueIPsLastDay,
    usersWithFailedAttempts,
  };
}
