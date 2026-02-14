/**
 * 测试自动化建模流程
 */

import { PrismaClient } from '@prisma/client';
import { executeFullAutoProcess } from '../src/services/auto-process-coordinator';

const prisma = new PrismaClient();

async function testAutoProcess() {
  try {
    // 获取用户 ID
    const user = await prisma.user.findFirst({
      where: { username: 'Yogdunana' },
    });

    if (!user) {
      console.log('User Yogdunana not found');
      return;
    }

    console.log('Starting automated modeling process...\n');

    // 执行自动化流程
    const result = await executeFullAutoProcess(
      user.id,
      'MCM',
      'OPTIMIZATION',
      '城市共享单车投放优化问题',
      `
某城市计划在主要商业区、居民区、地铁站等地投放共享单车，以提高市民出行的便利性和减少交通拥堵。

已知数据：
1. 城市12个主要区域的坐标和人口密度
2. 各区域的日出行需求量（人次/天）
3. 共享单车投放成本：每辆车3000元，每个投放点建设成本5000元
4. 运营成本：每辆车每天5元

要求：
1. 确定最优的投放点位置和投放数量
2. 最小化总成本（建设成本 + 车辆成本 + 运营成本）
3. 满足各区域90%以上的出行需求
4. 考虑用户步行距离不超过500米

请建立数学模型，给出最优投放方案。
      `,
      'MCM',
      'ENGLISH'
    );

    console.log('\n\nAutomated modeling process completed!');
    console.log(`Success: ${result.success}`);
    if (result.success) {
      console.log(`Task ID: ${result.task.id}`);
      console.log(`Status: ${result.task.overallStatus}`);
      console.log(`Progress: ${result.task.progress}%`);
    } else {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoProcess();
