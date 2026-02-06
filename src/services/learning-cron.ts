/**
 * Learning Cron Service
 * 定时执行学习任务的服务
 */

import CronJob from 'node-cron';
import prisma from '@/lib/prisma';
import { autoSearchAndCreateTasks, executeLearningTask } from '@/services/bilibili-learning';
import { Prisma } from '@prisma/client';

/**
 * 检查是否应该在当前时间执行学习
 */
async function shouldExecuteLearning(): Promise<boolean> {
  const config = await prisma.learningConfig.findFirst();

  if (!config || !config.autoLearningEnabled) {
    return false;
  }

  // 检查星期
  const today = new Date().getDay();
  const allowedDays = config.allowedDaysOfWeek.map(Number);
  if (!allowedDays.includes(today)) {
    return false;
  }

  // 检查时间段
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  if (currentTime < config.learningStartTime || currentTime > config.learningEndTime) {
    return false;
  }

  // 检查服务器负载
  if (config.pauseOnHighLoad) {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (memoryPercent > config.memoryThreshold) {
      console.log(`[${new Date().toISOString()}] Learning paused: High memory usage (${memoryPercent.toFixed(2)}%)`);
      return false;
    }
  }

  return true;
}

/**
 * 检查今日是否已完成学习目标
 */
async function isDailyTargetMet(): Promise<boolean> {
  const config = await prisma.learningConfig.findFirst();

  if (!config) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedToday = await prisma.videoLearningTask.count({
    where: {
      status: 'completed',
      createdAt: {
        gte: today,
      },
    },
  });

  return completedToday >= config.dailyVideoTarget;
}

/**
 * 执行学习循环
 */
async function executeLearningCycle(): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] Starting learning cycle...`);

    // 检查是否应该执行
    const shouldExecute = await shouldExecuteLearning();
    if (!shouldExecute) {
      console.log(`[${new Date().toISOString()}] Learning conditions not met, skipping`);
      return;
    }

    // 检查是否已达到目标
    const targetMet = await isDailyTargetMet();
    if (targetMet) {
      console.log(`[${new Date().toISOString()}] Daily target already met, skipping`);
      return;
    }

    // 获取配置
    const config = await prisma.learningConfig.findFirst();
    if (!config) {
      console.error(`[${new Date().toISOString()}] No learning config found`);
      return;
    }

    // 自动搜索并创建学习任务
    const tasks = await autoSearchAndCreateTasks();
    console.log(`[${new Date().toISOString()}] Created ${tasks.length} learning tasks`);

    if (tasks.length === 0) {
      console.log(`[${new Date().toISOString()}] No new tasks created, exiting`);
      return;
    }

    // 获取可用的 AI Provider
    const aiProvider = await prisma.aIProvider.findFirst({
      where: {
        status: 'ACTIVE',
        isDefault: true,
      },
    });

    if (!aiProvider) {
      console.error(`[${new Date().toISOString()}] No active AI provider found`);
      return;
    }

    // 计算剩余需要完成的任务数
    const completedToday = await prisma.videoLearningTask.count({
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const remainingTasks = config.dailyVideoTarget - completedToday;
    const tasksToExecute = tasks.slice(0, Math.min(remainingTasks, config.maxConcurrentTasks));

    console.log(`[${new Date().toISOString()}] Executing ${tasksToExecute.length} tasks...`);

    // 执行学习任务
    for (const task of tasksToExecute) {
      try {
        console.log(`[${new Date().toISOString()}] Executing task ${task.id}...`);
        await executeLearningTask(task.id, aiProvider.id);
        console.log(`[${new Date().toISOString()}] Task ${task.id} completed`);

        // 检查是否达到目标
        const newCompleted = await prisma.videoLearningTask.count({
          where: {
            status: 'completed',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        if (newCompleted >= config.dailyVideoTarget) {
          console.log(`[${new Date().toISOString()}] Daily target reached, stopping`);
          break;
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to execute task ${task.id}:`, error);
        await prisma.videoLearningTask.update({
          where: { id: task.id },
          data: { status: 'failed' },
        });
      }
    }

    console.log(`[${new Date().toISOString()}] Learning cycle completed`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Learning cycle error:`, error);

    // 记录错误日志
    try {
      await prisma.learningLog.create({
        data: {
          action: 'learning_cycle_error',
          message: error instanceof Error ? error.message : String(error),
          status: 'error',
        },
      });
    } catch (logError) {
      console.error(`[${new Date().toISOString()}] Failed to log error:`, logError);
    }
  }
}

/**
 * 启动定时学习服务
 */
let cronTask: any = null;

export function startLearningCron(): void {
  if (cronTask) {
    console.log(`[${new Date().toISOString()}] Learning cron already running`);
    return;
  }

  // 每小时执行一次（cron 表达式：0 * * * *）
  cronTask = CronJob.schedule('0 * * * *', executeLearningCycle);

  console.log(`[${new Date().toISOString()}] Learning cron started (runs every hour)`);
}

/**
 * 停止定时学习服务
 */
export function stopLearningCron(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log(`[${new Date().toISOString()}] Learning cron stopped`);
  }
}

/**
 * 获取 Cron 状态
 */
export function getCronStatus(): boolean {
  return cronTask !== null;
}
