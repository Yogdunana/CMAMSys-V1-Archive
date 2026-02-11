import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查系统状态 ===\n');

  // 1. 检查自动化任务状态
  console.log('### 1. 自动化任务状态 ###');
  const autoTasks = await prisma.autoModelingTask.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log(`找到 ${autoTasks.length} 个自动化任务\n`);
  autoTasks.forEach((task, index) => {
    console.log(`${index + 1}. Task ID: ${task.id}`);
    console.log(`   标题: ${task.problemTitle}`);
    console.log(`   状态: ${task.overallStatus}`);
    console.log(`   讨论状态: ${task.discussionStatus}`);
    console.log(`   校验状态: ${task.validationStatus}`);
    console.log(`   论文状态: ${task.paperStatus}`);
    console.log(`   错误日志: ${task.errorLog || '无'}`);
    console.log(`   创建时间: ${task.createdAt}`);
    console.log('');
  });

  // 2. 检查那个神秘的 Provider ID
  console.log('### 2. 检查 Provider ID cmlhkskw20001qdtc8rmm6o1e ###');
  const mysteriousId = 'cmlhkskw20001qdtc8rmm6o1e';
  
  // 检查是否是 AI Provider
  const aiProvider = await prisma.aIProvider.findUnique({
    where: { id: mysteriousId },
  });
  if (aiProvider) {
    console.log('✅ 这是 AI Provider:');
    console.log(`   名称: ${aiProvider.name}`);
    console.log(`   类型: ${aiProvider.type}`);
    console.log(`   状态: ${aiProvider.status}`);
  } else {
    console.log('❌ 不是 AI Provider');
  }

  // 检查讨论消息中的发送者
  const message = await prisma.discussionMessage.findFirst({
    where: { senderProviderId: mysteriousId },
  });
  if (message) {
    console.log('✅ 这是讨论消息中的发送者:');
    console.log(`   发送者名称: ${message.senderName}`);
    console.log(`   讨论ID: ${message.discussionId}`);
    console.log(`   回合: ${message.round}`);
  } else {
    console.log('❌ 不是讨论消息中的发送者');
  }

  // 3. 检查建模任务状态
  console.log('\n### 3. 建模任务状态 ###');
  const modelingTasks = await prisma.modelingTask.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`找到 ${modelingTasks.length} 个建模任务\n`);
  modelingTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.name}`);
    console.log(`   ID: ${task.id}`);
    console.log(`   状态: ${task.status}`);
    console.log(`   进度: ${task.progress}%`);
    console.log(`   算法: ${task.algorithm || '未设置'}`);
    console.log(`   开始时间: ${task.startedAt || '未开始'}`);
    console.log(`   完成时间: ${task.completedAt || '未完成'}`);
    console.log(`   错误信息: ${task.errorMessage || '无'}`);
    console.log('');
  });

  // 4. 检查群聊讨论记录
  console.log('### 4. 群聊讨论记录 ###');
  const discussions = await prisma.groupDiscussion.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      messages: {
        orderBy: { round: 'asc' },
        take: 5,
      },
    },
  });

  console.log(`找到 ${discussions.length} 个讨论记录\n`);
  discussions.forEach((discussion, index) => {
    console.log(`${index + 1}. Discussion ID: ${discussion.id}`);
    console.log(`   Auto Task ID: ${discussion.autoTaskId}`);
    console.log(`   标题: ${discussion.discussionTitle}`);
    console.log(`   状态: ${discussion.status}`);
    console.log(`   回合: ${discussion.currentRound}/${discussion.maxRounds}`);
    console.log(`   消息数量: ${discussion.messages.length}`);
    console.log('');
  });

  // 5. 检查 AI Provider 统计
  console.log('### 5. AI Provider 使用统计 ###');
  const providers = await prisma.aIProvider.findMany({
    where: { deletedAt: null },
  });

  console.log(`找到 ${providers.length} 个 AI Providers\n`);
  providers.forEach((provider, index) => {
    console.log(`${index + 1}. ${provider.name} (${provider.type})`);
    console.log(`   请求次数: ${provider.totalRequests}`);
    console.log(`   Token使用: ${provider.totalTokensUsed}`);
    console.log(`   最后使用: ${provider.lastUsedAt || '从未使用'}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
