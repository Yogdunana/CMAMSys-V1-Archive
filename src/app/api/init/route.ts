/**
 * Application Initialization API
 * 应用程序初始化 API - 启动后台任务
 */

import { NextResponse } from 'next/server';
import { scheduleCleanupTasks } from '@/services/cleanup-service';
import { verifyEmailConfiguration } from '@/lib/email-service';

export async function POST() {
  try {
    // Verify email configuration
    const emailConfigured = await verifyEmailConfiguration();

    // Schedule cleanup tasks
    const cleanupInterval = parseInt(process.env.CLEANUP_EXPIRED_TOKENS_INTERVAL_HOURS || '24');
    scheduleCleanupTasks(cleanupInterval);

    console.log('✅ Application initialization completed');

    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully',
      data: {
        emailConfigured,
        cleanupScheduled: true,
        cleanupIntervalHours: cleanupInterval,
      },
    });
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Application initialization failed',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
