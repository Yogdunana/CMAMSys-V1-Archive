/**
 * 论文优化服务
 * 对生成的论文进行优化和改进
 */

import { PaperFormat, PaperLanguage, PaperStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { callAI } from '@/services/ai-provider';
import { createPaperVersion } from '@/services/paper-version';

export interface OptimizationRequest {
  paperId: string;
  optimizationType: 'grammar' | 'structure' | 'content' | 'references' | 'full';
  userId?: string;
}

export interface OptimizationResult {
  optimized: boolean;
  improvedContent?: string;
  changes?: string[];
  suggestions?: string[];
}

/**
 * 优化论文
 */
export async function optimizePaper(request: OptimizationRequest): Promise<OptimizationResult> {
  try {
    console.log(`[PaperOptimization] 开始优化论文: ${request.paperId}`);
    console.log(`[PaperOptimization] 优化类型: ${request.optimizationType}`);

    // 获取论文
    const paper = await prisma.generatedPaper.findUnique({
      where: { id: request.paperId },
    });

    if (!paper) {
      throw new Error(`论文不存在: ${request.paperId}`);
    }

    // 构建优化 Prompt
    const prompt = buildOptimizationPrompt(paper, request.optimizationType);

    // 调用 AI 进行优化
    // 获取默认 Provider
    const providers = await prisma.aIProvider.findMany({
      where: {
        status: 'ACTIVE',
        ...(request.userId && { createdById: request.userId }),
      },
      orderBy: [
        { isDefault: 'desc' },
        { priority: 'desc' },
      ],
      take: 1,
    });

    const provider = providers[0];
    if (!provider) {
      throw new Error('没有可用的 AI Provider');
    }

    const { response: optimizedContent } = await callAI(
      provider.id,
      provider.supportedModels[0] || 'deepseek-chat',
      prompt,
      {
        modelType: 'CHAT',
        context: 'paper-generation',
      },
      request.userId
    );

    // 解析 AI 返回的优化结果
    const result = parseOptimizationResult(optimizedContent);

    // 如果有优化内容，更新论文
    if (result.optimized && result.improvedContent) {
      // 创建新版本（保存当前内容）
      await createPaperVersion({
        paperId: paper.id,
        content: paper.content,
        changeDescription: `优化前版本 (${request.optimizationType})`,
        userId: request.userId,
      });

      // 更新论文内容
      await prisma.generatedPaper.update({
        where: { id: paper.id },
        data: {
          content: result.improvedContent,
          status: PaperStatus.COMPLETED,
          updatedAt: new Date(),
        },
      });

      console.log(`[PaperOptimization] 论文优化完成`);
    } else {
      console.log(`[PaperOptimization] 论文无需优化`);
    }

    return result;
  } catch (error) {
    console.error('[PaperOptimization] 论文优化失败:', error);
    throw error;
  }
}

/**
 * 构建优化 Prompt
 */
function buildOptimizationPrompt(paper: any, optimizationType: string): string {
  const typeDescriptions: Record<string, string> = {
    grammar: '语法和拼写检查，修正语言错误',
    structure: '结构调整，优化段落组织',
    content: '内容增强，丰富论述和分析',
    references: '参考文献格式化，补充缺失的引用',
    full: '全面优化，包括语法、结构、内容和参考文献',
  };

  return `
你是一位专业的学术编辑，请优化以下数学建模竞赛论文。

【优化类型】
${typeDescriptions[optimizationType] || '全面优化'}

【论文内容】
${paper.content}

【优化要求】
1. 保持原有的学术风格和格式
2. 修正所有的语法和拼写错误
3. 确保段落逻辑清晰，过渡自然
4. 增强论证的严谨性和说服力
5. 优化图表说明和引用
6. 补充必要的参考文献

【输出格式】
请按照以下格式输出：

<OPTIMIZED_PAPER>
（优化后的完整论文内容）
</OPTIMIZED_PAPER>

<CHANGES>
- 修改点1
- 修改点2
- ...
</CHANGES>

<SUGGESTIONS>
- 改进建议1
- 改进建议2
- ...
</SUGGESTIONS>
`;
}

/**
 * 解析优化结果
 */
function parseOptimizationResult(response: string): OptimizationResult {
  try {
    // 提取优化后的论文
    const optimizedMatch = response.match(/<OPTIMIZED_PAPER>([\s\S]*?)<\/OPTIMIZED_PAPER>/);
    const improvedContent = optimizedMatch ? optimizedMatch[1].trim() : undefined;

    // 提取修改点
    const changesMatch = response.match(/<CHANGES>([\s\S]*?)<\/CHANGES>/);
    const changesText = changesMatch ? changesMatch[1].trim() : '';
    const changes = changesText
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line);

    // 提取建议
    const suggestionsMatch = response.match(/<SUGGESTIONS>([\s\S]*?)<\/SUGGESTIONS>/);
    const suggestionsText = suggestionsMatch ? suggestionsMatch[1].trim() : '';
    const suggestions = suggestionsText
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line);

    return {
      optimized: !!improvedContent,
      improvedContent,
      changes,
      suggestions,
    };
  } catch (error) {
    console.error('[PaperOptimization] 解析优化结果失败:', error);
    return {
      optimized: false,
      suggestions: ['优化结果解析失败，请手动检查论文'],
    };
  }
}

/**
 * 获取默认 Provider ID
 */
async function getProviderId(userId?: string): Promise<string> {
  const providers = await prisma.aIProvider.findMany({
    where: {
      status: 'ACTIVE',
      ...(userId && { createdById: userId }),
    },
    orderBy: [
      { isDefault: 'desc' },
      { priority: 'desc' },
    ],
    take: 1,
  });

  return providers[0]?.id || '';
}
