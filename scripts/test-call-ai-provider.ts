import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 复制 callAIProvider 函数逻辑
async function callAIProvider(provider: any, prompt: string) {
  console.log(`[callAIProvider] 调用 ${provider.name} (${provider.type})`);
  console.log(`[callAIProvider] Prompt 长度: ${prompt.length}`);

  const response = {
    content: `模拟回复：${provider.name} 的解题思路。\n\n针对城市共享单车投放优化问题，我建议采用以下方法：\n\n1. 核心算法：遗传算法 + 模拟退火混合算法\n2. 创新点：基于区域需求预测的自适应投放策略\n3. 可行性分析：时间复杂度 O(n²)，能够满足实时调度需求`,
    coreAlgorithms: '遗传算法、蚁群算法',
    innovations: '混合算法设计、自适应参数调整',
    feasibility: '时间复杂度 O(n²)，数据需求适中',
    disagreements: '',
    tokenCount: 500,
  };

  console.log(`[callAIProvider] 返回 content 长度: ${response.content.length}`);
  console.log(`[callAIProvider] 返回 content 预览: ${response.content.substring(0, 100)}...`);

  return response;
}

async function main() {
  console.log('=== 测试 callAIProvider 函数 ===\n');

  // 1. 获取一个 AI Provider
  const provider = await prisma.aIProvider.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!provider) {
    console.error('没有找到可用的 AI Provider');
    return;
  }

  console.log(`Provider: ${provider.name} (${provider.type})`);
  console.log(`ID: ${provider.id}`);
  console.log('');

  // 2. 调用 callAIProvider
  const prompt = '请描述你的解题思路';
  console.log('调用 callAIProvider...\n');

  const response = await callAIProvider(provider, prompt);

  console.log('返回结果:');
  console.log(`  content 长度: ${response.content.length}`);
  console.log(`  content 预览: ${response.content.substring(0, 200)}...`);
  console.log(`  coreAlgorithms: ${response.coreAlgorithms}`);
  console.log(`  innovations: ${response.innovations}`);
  console.log(`  tokenCount: ${response.tokenCount}`);
  console.log('');

  // 3. 尝试创建一条测试消息
  console.log('尝试创建测试消息...\n');

  try {
    // 首先创建一个测试讨论
    const discussion = await prisma.groupDiscussion.create({
      data: {
        discussionTitle: '测试讨论',
        problemTitle: '测试题目',
        competitionType: 'CUMCM',
        problemType: 'OPTIMIZATION',
        status: 'IN_PROGRESS',
        currentRound: 0,
        maxRounds: 2,
        participants: [
          { id: provider.id, name: provider.name, type: provider.type },
        ],
      },
    });

    console.log(`测试讨论创建成功，ID: ${discussion.id}`);

    // 创建测试消息
    const message = await prisma.discussionMessage.create({
      data: {
        discussionId: discussion.id,
        round: 1,
        senderProviderId: provider.id,
        senderName: provider.name,
        messageContent: response.content,
        messageType: 'INITIAL_THOUGHT',
        coreAlgorithms: response.coreAlgorithms,
        innovations: response.innovations,
        feasibility: response.feasibility,
        tokenCount: response.tokenCount,
      },
    });

    console.log(`测试消息创建成功，ID: ${message.id}`);
    console.log(`messageContent 长度: ${message.messageContent.length}`);
    console.log(`messageContent 预览: ${message.messageContent.substring(0, 200)}...`);

    // 清理测试数据
    await prisma.discussionMessage.delete({ where: { id: message.id } });
    await prisma.groupDiscussion.delete({ where: { id: discussion.id } });
    console.log('\n测试数据已清理');

  } catch (error) {
    console.error('创建消息失败:', error);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
