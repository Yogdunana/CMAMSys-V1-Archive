/**
 * 群聊讨论服务
 * 实现多 AI 轮询式讨论功能
 */

import { AIProvider, DiscussionStatus, MessageType } from '@prisma/client';
import prisma from '@/lib/prisma';
import { selectDiscussionProviders, TaskType, selectOptimalProvider } from './auto-provider-selector';

// 讨论规则
const DISCUSSION_RULES = `
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
   - 第三轮（如有）：总结和达成共识
`;

/**
 * 初始化群聊讨论
 */
export async function initializeDiscussion(
  competitionType: string,
  problemType: string,
  problemTitle: string,
  problemContent: string,
  userId: string,
  autoTaskId?: string
) {
  try {
    // 选择参与讨论的 AI Providers
    const providers = await selectDiscussionProviders(
      competitionType as any,
      problemType as any,
      userId
    );

    if (providers.length < 2) {
      throw new Error('至少需要 2 个 AI Provider 参与讨论');
    }

    // 创建讨论记录
    const discussion = await prisma.groupDiscussion.create({
      data: {
        autoTaskId,
        discussionTitle: `${problemTitle} - 群聊讨论`,
        problemTitle,
        competitionType: competitionType as any,
        problemType: problemType as any,
        status: DiscussionStatus.IN_PROGRESS,
        currentRound: 0,
        maxRounds: 2,
        participants: providers.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type,
        })),
      },
    });

    return { discussion, providers };
  } catch (error) {
    console.error('Error initializing discussion:', error);
    throw error;
  }
}

/**
 * 执行一轮讨论
 */
export async function executeDiscussionRound(
  discussionId: string,
  round: number,
  problemContent: string,
  providers: AIProvider[],
  previousMessages?: any[]
) {
  try {
    const messages = [];

    // 为每个 Provider 生成发言
    for (const provider of providers) {
      let prompt = '';

      if (round === 1) {
        // 第一轮：输出初始思路
        prompt = `
${DISCUSSION_RULES}

赛题内容：
${problemContent}

请作为 ${provider.name}（${provider.type}），输出你对这道题目的初始解题思路。
要求：严格遵循「核心算法 + 创新点 + 可行性分析」的格式，控制在 2000 Token 以内。
`;
      } else {
        // 第二轮及以后：点评和补充
        const previousRoundsMessages = previousMessages
          ?.filter((m) => m.round === round - 1)
          .map((m) => `${m.senderName}: ${m.messageContent}`)
          .join('\n\n') || '';

        prompt = `
${DISCUSSION_RULES}

赛题内容：
${problemContent}

上一轮其他 AI 的观点：
${previousRoundsMessages}

请作为 ${provider.name}（${provider.type}），对上述观点进行点评和补充。
要求：
1. 仅补充缺失的创新点
2. 明确指出分歧点，并提供数学依据
3. 不重复已有观点
4. 控制在 2000 Token 以内
`;
      }

      // 调用 AI API 生成回复
      const response = await callAIProvider(provider, prompt);

      // 创建消息记录
      const message = await prisma.discussionMessage.create({
        data: {
          discussionId,
          round,
          senderProviderId: provider.id,
          senderName: provider.name,
          messageContent: response.content,
          messageType: round === 1 ? MessageType.INITIAL_THOUGHT : MessageType.COMMENT,
          coreAlgorithms: response.coreAlgorithms,
          innovations: response.innovations,
          feasibility: response.feasibility,
          disagreements: response.disagreements,
          tokenCount: response.tokenCount || 0,
        },
      });

      messages.push(message);

      // 更新 Provider 的使用统计
      await updateProviderUsage(provider.id, response.tokenCount || 0);
    }

    return messages;
  } catch (error) {
    console.error('Error executing discussion round:', error);
    throw error;
  }
}

/**
 * 完成讨论并生成总结
 */
export async function completeDiscussion(discussionId: string) {
  try {
    // 获取所有讨论消息
    const messages = await prisma.discussionMessage.findMany({
      where: { discussionId },
      orderBy: { round: 'asc' },
    });

    if (messages.length === 0) {
      throw new Error('No messages found for discussion');
    }

  // 提取各 Provider 的核心算法和创新点
  const coreAlgorithms: any[] = [];
  const innovations: any[] = [];
  const disagreements: any[] = [];

  messages.forEach((message) => {
    if (message.coreAlgorithms) {
      coreAlgorithms.push({
        provider: message.senderName,
        content: message.coreAlgorithms,
      });
    }
    if (message.innovations) {
      innovations.push({
        provider: message.senderName,
        content: message.innovations,
      });
    }
    if (message.disagreements) {
      disagreements.push({
        provider: message.senderName,
        content: message.disagreements,
      });
    }
  });

    // 生成观点对比总结
    const summary = {
      coreAlgorithms,
      innovations,
      disagreements,
      consensus: {
        mainAlgorithm: '', // TODO: 提取共识算法
        keyInnovations: innovations.map((i) => i.content).join('\n'),
      },
    };

    // 更新讨论记录
    const updatedDiscussion = await prisma.groupDiscussion.update({
      where: { id: discussionId },
      data: {
        status: DiscussionStatus.COMPLETED,
        summary,
      },
    });

    return { discussion: updatedDiscussion, summary };
  } catch (error) {
    console.error('Error completing discussion:', error);
    throw error;
  }
}

/**
 * 完整执行群聊讨论流程
 */
export async function executeFullDiscussion(
  competitionType: string,
  problemType: string,
  problemTitle: string,
  problemContent: string,
  userId: string,
  autoTaskId?: string
) {
  try {
    // 1. 初始化讨论
    const { discussion, providers } = await initializeDiscussion(
      competitionType,
      problemType,
      problemTitle,
      problemContent,
      userId,
      autoTaskId
    );

    let allMessages: any[] = [];

    // 2. 执行第一轮讨论（初始思路）
    const round1Messages = await executeDiscussionRound(
      discussion.id,
      1,
      problemContent,
      providers
    );
    allMessages = [...allMessages, ...round1Messages];

    // 3. 执行第二轮讨论（点评和补充）
    const round2Messages = await executeDiscussionRound(
      discussion.id,
      2,
      problemContent,
      providers,
      allMessages
    );
    allMessages = [...allMessages, ...round2Messages];

    // 4. 完成讨论并生成总结
    const { summary } = await completeDiscussion(discussion.id);

    // 5. 保存讨论记录到 JSON 文件
    await saveDiscussionRecord(discussion.id, problemTitle, allMessages, summary);

    return {
      discussion,
      messages: allMessages,
      summary,
    };
  } catch (error) {
    console.error('Error executing full discussion:', error);
    throw error;
  }
}

/**
 * 调用 AI Provider 生成回复
 */
async function callAIProvider(provider: AIProvider, prompt: string) {
  // TODO: 实现实际的 AI API 调用
  // 这里需要根据 provider.type 调用不同的 AI 服务
  // 暂时返回模拟数据

  return {
    content: `模拟回复：${provider.name} 的解题思路`,
    coreAlgorithms: '遗传算法、蚁群算法',
    innovations: '混合算法设计、自适应参数调整',
    feasibility: '时间复杂度 O(n²)，数据需求适中',
    disagreements: '',
    tokenCount: 500,
  };
}

/**
 * 更新 Provider 使用统计
 */
async function updateProviderUsage(providerId: string, tokenCount: number) {
  try {
    await prisma.aIProvider.update({
      where: { id: providerId },
      data: {
        totalRequests: { increment: 1 },
        totalTokensUsed: { increment: tokenCount },
        lastUsedAt: new Date(),
      },
    });

    // 更新成本管控记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const costControl = await prisma.costControl.findUnique({
      where: {
        providerId_date: {
          providerId,
          date: today,
        },
      },
    });

    if (costControl) {
      await prisma.costControl.update({
        where: { id: costControl.id },
        data: {
          tokensUsed: { increment: tokenCount },
          callsCount: { increment: 1 },
        },
      });
    } else {
      await prisma.costControl.create({
        data: {
          providerId,
          date: today,
          tokensUsed: tokenCount,
          callsCount: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error updating provider usage:', error);
  }
}

/**
 * 保存讨论记录到 JSON 文件
 */
async function saveDiscussionRecord(
  discussionId: string,
  problemTitle: string,
  messages: any[],
  summary: any
) {
  try {
    const record = {
      discussionId,
      problemTitle,
      timestamp: new Date().toISOString(),
      messages: messages.map((m) => ({
        speaker: m.senderName,
        time: m.createdAt,
        content: m.messageContent,
        type: m.messageType,
        replyTo: m.replyToMessageId,
        coreAlgorithms: m.coreAlgorithms,
        innovations: m.innovations,
        disagreements: m.disagreements,
      })),
      summary: {
        coreAlgorithms: summary.coreAlgorithms,
        innovations: summary.innovations,
        disagreements: summary.disagreements,
      },
    };

    // 保存到文件系统
    // TODO: 实现文件保存逻辑
    const fileName = `${problemTitle.replace(/\s+/g, '_')}_${discussionId}.json`;
    const filePath = `/tmp/discussion_records/${fileName}`;

    // 确保目录存在
    const fs = require('fs');
    const path = require('path');
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');

    return filePath;
  } catch (error) {
    console.error('Error saving discussion record:', error);
    throw error;
  }
}

/**
 * 获取讨论记录
 */
export async function getDiscussionRecord(discussionId: string) {
  try {
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: discussionId },
      include: {
        messages: {
          orderBy: { round: 'asc' },
        },
      },
    });

    if (!discussion) {
      return null;
    }

    return {
      discussion,
      messages: discussion.messages,
      summary: discussion.summary,
    };
  } catch (error) {
    console.error('Error getting discussion record:', error);
    return null;
  }
}
