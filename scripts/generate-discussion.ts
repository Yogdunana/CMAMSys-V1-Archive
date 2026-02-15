import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

/**
 * 调用 AI Provider 生成讨论内容
 */
async function generateDiscussionMessage(provider: any, prompt: string) {
  try {
    // 解密 API Key
    const apiKey = decrypt(provider.apiKey);
    const model = provider.supportedModels?.[0] || 'deepseek-chat';
    const endpoint = provider.endpoint;

    console.log(`🤖 Calling ${provider.name} with model: ${model}`);

    // 构建请求
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log(`✅ ${provider.name} generated ${content.length} chars`);
    return content;
  } catch (error) {
    console.error(`❌ ${provider.name} error:`, error);
    return null;
  }
}

/**
 * 构建讨论 Prompt
 */
function buildDiscussionPrompt(discussion: any, provider: any) {
  return `
你是参与数学建模竞赛讨论的 AI 助手。请严格遵守以下规则：

1. 输出格式要求：
   - 核心思路格式：「核心算法 + 创新点 + 可行性分析」
   - 核心算法：明确算法名称、数学模型、计算步骤
   - 创新点：列出 2-3 个创新点，每个创新点需有数学依据
   - 可行性分析：评估算法的时间复杂度、数据需求、实现难度

2. 点评其他 API 观点时：
   - 仅补充缺失的创新点
   - 明确指出分歧点，并提供数学依据
   - 不重复已有观点

3. 内容控制：
   - 输出内容控制在 2000 Token 以内
   - 使用简洁、专业的数学建模术语
   - 避免冗长的开场白和结束语

4. 讨论轮次：
   - 第一轮：输出初始思路
   - 第二轮：点评其他观点并补充

请作为 ${provider.name}（${provider.type}），输出你对这道题目的解题思路。
要求：严格遵循「核心算法 + 创新点 + 可行性分析」的格式，控制在 2000 Token 以内。

赛题信息：
- 竞赛类型：${discussion.competitionType}
- 题目类型：${discussion.problemType}
- 题目标题：${discussion.problemTitle}
`;
}

async function main() {
  console.log('🚀 Starting discussion generation...\n');

  const discussionId = 'cmlnxdhx5000qvf0flyyl3l9i';

  // 获取讨论信息
  const discussion = await prisma.groupDiscussion.findUnique({
    where: { id: discussionId },
  });

  if (!discussion) {
    console.error('❌ Discussion not found');
    process.exit(1);
  }

  console.log('📋 Discussion Info:');
  console.log(`   Title: ${discussion.discussionTitle}`);
  console.log(`   Competition Type: ${discussion.competitionType}`);
  console.log(`   Problem Type: ${discussion.problemType}`);
  console.log(`   Problem Title: ${discussion.problemTitle}`);
  console.log('');

  // 获取参与者
  const participants = discussion.participants as Array<{ id: string; name: string }>;
  console.log(`👥 Participants: ${participants.length}`);

  // 获取 Provider 信息
  const providers = await prisma.aIProvider.findMany({
    where: {
      id: { in: participants.map((p) => p.id) },
    },
  });

  console.log(`🤖 Found ${providers.length} providers\n`);

  // 为每个 Provider 生成讨论消息
  for (const provider of providers) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${provider.name}`);
    console.log(`${'='.repeat(60)}\n`);

    // 构建 Prompt
    const prompt = buildDiscussionPrompt(discussion, provider);

    // 生成消息
    const content = await generateDiscussionMessage(provider, prompt);

    if (content) {
      // 保存消息到数据库
      const message = await prisma.discussionMessage.create({
        data: {
          discussionId: discussion.id,
          round: 1, // 第一轮讨论
          senderProviderId: provider.id,
          senderName: provider.name,
          messageContent: content,
          messageType: 'INITIAL_THOUGHT', // 初始思路
          tokenCount: content.length,
        },
      });

      console.log(`✅ Message saved: ${message.id}`);
      console.log(`   Content preview: ${content.substring(0, 200)}...`);
    } else {
      console.log(`❌ Failed to generate message for ${provider.name}`);
    }

    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n✅ Discussion generation completed!');
  console.log(`💬 Total messages: ${participants.length}`);

  // 显示所有消息
  const allMessages = await prisma.discussionMessage.findMany({
    where: { discussionId },
    orderBy: { createdAt: 'asc' },
  });

  console.log('\n📨 Generated Messages:');
  allMessages.forEach((msg, index) => {
    console.log(`\n${index + 1}. [${msg.senderName}]`);
    console.log(`   ${msg.messageContent?.substring(0, 150)}...`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
