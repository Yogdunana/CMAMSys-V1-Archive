/**
 * Application Entry Point
 * 初始化应用并启动定时任务
 */

import { startLearningCron } from '@/services/learning-cron';

/**
 * 初始化应用
 */
export function initializeApp() {
  console.log('[App] Initializing CMAMSys...');

  // 启动定时学习服务
  try {
    startLearningCron();
  } catch (error) {
    console.error('[App] Failed to start learning cron:', error);
  }

  console.log('[App] CMAMSys initialized successfully');
}

/**
 * 清理资源
 */
export function cleanupApp() {
  console.log('[App] Cleaning up CMAMSys...');

  // 停止定时学习服务
  const { stopLearningCron } = require('@/services/learning-cron');
  try {
    stopLearningCron();
  } catch (error) {
    console.error('[App] Failed to stop learning cron:', error);
  }

  console.log('[App] CMAMSys cleaned up');
}

// 在 Node.js 环境中处理进程退出
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    cleanupApp();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    cleanupApp();
    process.exit(0);
  });
}
