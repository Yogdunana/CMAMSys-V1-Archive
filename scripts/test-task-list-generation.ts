import { prisma } from '@/lib/prisma';
import { initializeDiscussion, executeDiscussionRound, completeDiscussion } from '@/services/group-discussion';

const TEST_PROBLEM = `
2025年美赛A题：能源系统优化

背景：
随着全球能源需求的增长和可再生能源的快速发展，如何优化电力系统的运行成为一个重要问题。

问题描述：
某地区有5个发电站（2个火电站、2个水电站、1个风电场），需要满足10个城市的电力需求。
每个发电站的发电能力、运营成本和碳排放量不同。每个城市的电力需求在不同时间段内变化。

要求：
1. 设计一个优化模型，最小化总运营成本
2. 考虑碳排放限制
3. 确保电力供应稳定性
4. 给出未来24小时的调度方案
`;

async function testTaskListGeneration() {
  console.log('===== 开始测试任务列表生成功能 =====\n');

  try {
    // 1. 初始化讨论
    console.log('1. 初始化讨论...');
    const { discussion, providers } = await initializeDiscussion(
      'MCM',
      'OPTIMIZATION',
      '能源系统优化',
      TEST_PROBLEM,
      'test-user'
    );

    console.log(`   讨论ID: ${discussion.id}`);
    console.log(`   参与者: ${providers.map(p => p.name).join(', ')}`);
    console.log('   ✓ 讨论初始化成功\n');

    // 2. 执行第一轮讨论
    console.log('2. 执行第一轮讨论（初始思路）...');
    const round1Messages = await executeDiscussionRound(
      discussion.id,
      1,
      TEST_PROBLEM,
      providers,
      undefined,
      'test-user'
    );

    console.log(`   第一轮消息数: ${round1Messages.length}`);
    round1Messages.forEach((msg, idx) => {
      console.log(`   - ${msg.senderName}: ${msg.messageContent.substring(0, 50)}...`);
    });
    console.log('   ✓ 第一轮讨论完成\n');

    // 3. 执行第二轮讨论
    console.log('3. 执行第二轮讨论（点评和补充，包含任务列表）...');
    const round2Messages = await executeDiscussionRound(
      discussion.id,
      2,
      TEST_PROBLEM,
      providers,
      round1Messages,
      'test-user'
    );

    console.log(`   第二轮消息数: ${round2Messages.length}`);
    round2Messages.forEach((msg, idx) => {
      console.log(`   - ${msg.senderName}: ${msg.messageContent.substring(0, 50)}...`);

      // 检查是否包含任务列表
      if (msg.messageContent.includes('【任务列表】')) {
        console.log(`     ★ 包含任务列表标记`);
        const taskListMatch = msg.messageContent.match(/【任务列表】([\s\S]*?)(?=\n\n|$)/);
        if (taskListMatch) {
          console.log(`     任务列表内容:\n${taskListMatch[1].substring(0, 200)}...`);
        }
      }
    });
    console.log('   ✓ 第二轮讨论完成\n');

    // 4. 完成讨论
    console.log('4. 完成讨论并生成总结...');
    const { summary } = await completeDiscussion(discussion.id);

    console.log(`   - 核心算法数量: ${summary.coreAlgorithms.length}`);
    console.log(`   - 创新点数量: ${summary.innovations.length}`);
    console.log(`   - 任务列表数量: ${summary.taskList?.length || 0}`);

    if (summary.taskList && summary.taskList.length > 0) {
      console.log('\n   任务列表:');
      summary.taskList.forEach((task, idx) => {
        console.log(`   ${idx + 1}. ${task}`);
      });
      console.log('\n   ✓ 任务列表生成成功！');
    } else {
      console.log('\n   ⚠ 警告：未提取到任务列表');
    }

    // 5. 从数据库验证
    console.log('\n5. 从数据库验证...');
    const savedDiscussion = await prisma.groupDiscussion.findUnique({
      where: { id: discussion.id },
      select: { summary: true },
    });

    if (savedDiscussion?.summary) {
      console.log(`   数据库中的任务列表数量: ${(savedDiscussion.summary as any).taskList?.length || 0}`);
      console.log('   ✓ 数据库验证通过');
    }

    console.log('\n===== 测试完成 =====');
    process.exit(0);

  } catch (error) {
    console.error('\n===== 测试失败 =====');
    console.error('错误:', error);
    process.exit(1);
  }
}

testTaskListGeneration();
