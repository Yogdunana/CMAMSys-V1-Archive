/**
 * 测试仪表盘统计 API
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDashboardStats() {
  try {
    console.log('测试仪表盘统计数据...\n');

    // 统计活跃竞赛
    const activeCompetitions = await prisma.competition.count({
      where: {
        status: {
          in: ['DRAFT', 'IN_PROGRESS'],
        },
      },
    });

    // 统计自动化建模任务（非完成状态）
    const modelingTasks = await prisma.autoModelingTask.count({
      where: {
        overallStatus: {
          in: ['PENDING', 'DISCUSSING', 'CODING', 'VALIDATING', 'RETRYING', 'PAPER_GENERATING'],
        },
      },
    });

    // 统计团队成员（所有非删除用户）
    const teamMembers = await prisma.user.count({
      where: {
        deletedAt: null,
      },
    });

    // 统计 AI 请求总数
    const aiRequests = await prisma.aIRequest.count({});

    // 获取最近创建的自动化建模任务
    const recentTasks = await prisma.autoModelingTask.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    console.log('📊 仪表盘统计数据：');
    console.log(`  活跃竞赛: ${activeCompetitions}`);
    console.log(`  建模任务: ${modelingTasks}`);
    console.log(`  团队成员: ${teamMembers}`);
    console.log(`  AI 请求: ${aiRequests}`);

    console.log('\n📝 最近活动：');
    recentTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.problemTitle}`);
      console.log(`     状态: ${task.overallStatus}`);
      console.log(`     创建时间: ${task.createdAt.toLocaleString('zh-CN')}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardStats();
