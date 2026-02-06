/**
 * Application Initialization API
 * 用于初始化应用和启动定时任务
 */

import { NextResponse } from 'next/server';
import { startLearningCron, getCronStatus } from '@/services/learning-cron';

let isInitialized = false;

/**
 * POST: 初始化应用
 */
export async function POST() {
  try {
    if (isInitialized) {
      return NextResponse.json(
        {
          success: true,
          message: 'Application already initialized',
          cronRunning: getCronStatus(),
        },
        { status: 200 }
      );
    }

    // 启动定时学习服务
    startLearningCron();

    isInitialized = true;

    return NextResponse.json(
      {
        success: true,
        message: 'Application initialized successfully',
        cronRunning: getCronStatus(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INIT_ERROR',
          message: 'Failed to initialize application',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET: 获取初始化状态
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      isInitialized,
      cronRunning: getCronStatus(),
    },
    { status: 200 }
  );
}
