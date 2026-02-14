/**
 * 测试群聊讨论功能
 */

import { PrismaClient } from '@prisma/client';
import { executeFullDiscussion } from '../src/services/group-discussion';

const prisma = new PrismaClient();

async function testDiscussion() {
  try {
    // 获取用户 ID
    const user = await prisma.user.findFirst({
      where: { username: 'Yogdunana' },
    });

    if (!user) {
      console.log('User Yogdunana not found');
      return;
    }

    console.log('Starting group discussion...\n');

    // 执行群聊讨论
    const taskId = `test-task-${Date.now()}`;
    const result = await executeFullDiscussion(
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
      user.id,
      taskId
    );

    console.log('\n\nDiscussion completed!');
    console.log(`Discussion ID: ${result.discussion.id}`);
    console.log(`Messages: ${result.discussion.messages.length}`);
    console.log(`Status: ${result.discussion.status}`);
    console.log('\nSummary:');
    console.log(`Main Algorithm: ${result.summary.consensus?.mainAlgorithm}`);
    console.log(`Innovations: ${result.summary.consensus?.keyInnovations}`);
    console.log(`Core Algorithms: ${result.summary.coreAlgorithms.map((a: any) => a.content).join(', ')}`);

    // 显示第一条消息
    if (result.discussion.messages.length > 0) {
      const firstMessage = result.discussion.messages[0];
      console.log('\nFirst Message:');
      console.log(`Sender: ${firstMessage.senderName}`);
      console.log(`Content: ${firstMessage.messageContent.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDiscussion();
