/**
 * AI Provider Service
 * Manages AI provider configurations, API calls, and intelligent model selection
 */

import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { isFeatureAvailable, FeatureFlag } from '@/lib/features';
import {
  AIProviderType,
  AIProviderStatus,
  AIModelType,
} from '@prisma/client';

const logger = createLogger({ category: 'AI_PROVIDER_SERVICE' });

// AI Provider configurations
export interface AIProviderConfig {
  type: AIProviderType;
  endpoint: string;
  models: AIModelConfig[];
  defaultModel?: string;
}

export interface AIModelConfig {
  name: string;
  type: AIModelType;
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
}

// Provider-specific configurations
const PROVIDER_CONFIGS: Record<AIProviderType, AIProviderConfig> = {
  [AIProviderType.DEEPSEEK]: {
    type: AIProviderType.DEEPSEEK,
    endpoint: 'https://api.deepseek.com/v1',
    models: [
      {
        name: 'deepseek-chat',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.000001,
        maxTokens: 128000,
      },
      {
        name: 'deepseek-coder',
        type: AIModelType.CODE_GENERATION,
        capabilities: ['coding', 'completion'],
        costPerToken: 0.000001,
        maxTokens: 128000,
      },
    ],
    defaultModel: 'deepseek-chat',
  },
  [AIProviderType.VOLCENGINE]: {
    type: AIProviderType.VOLCENGINE,
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    models: [
      {
        name: 'doubao-pro-32k',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000008,
        maxTokens: 32768,
      },
      {
        name: 'doubao-pro-128k',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.000001,
        maxTokens: 128000,
      },
    ],
    defaultModel: 'doubao-pro-128k',
  },
  [AIProviderType.ALIYUN_QWEN]: {
    type: AIProviderType.ALIYUN_QWEN,
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      {
        name: 'qwen-turbo',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000004,
        maxTokens: 8192,
      },
      {
        name: 'qwen-plus',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.0000008,
        maxTokens: 32768,
      },
      {
        name: 'qwen-max',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.000002,
        maxTokens: 32768,
      },
    ],
    defaultModel: 'qwen-plus',
  },
  [AIProviderType.BAIDU_WENXIN]: {
    type: AIProviderType.BAIDU_WENXIN,
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    models: [
      {
        name: 'ernie-bot-4',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.000002,
        maxTokens: 8192,
      },
      {
        name: 'ernie-bot-turbo',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000008,
        maxTokens: 8192,
      },
    ],
    defaultModel: 'ernie-bot-4',
  },
  [AIProviderType.ZHIPU]: {
    type: AIProviderType.ZHIPU,
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      {
        name: 'glm-4',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.000001,
        maxTokens: 128000,
      },
      {
        name: 'glm-4-flash',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000001,
        maxTokens: 128000,
      },
    ],
    defaultModel: 'glm-4',
  },
  [AIProviderType.OPENAI]: {
    type: AIProviderType.OPENAI,
    endpoint: 'https://api.openai.com/v1',
    models: [
      {
        name: 'gpt-4o',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning', 'coding'],
        costPerToken: 0.000005,
        maxTokens: 128000,
      },
      {
        name: 'gpt-4o-mini',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.00000015,
        maxTokens: 128000,
      },
    ],
    defaultModel: 'gpt-4o',
  },
  [AIProviderType.ANTHROPIC]: {
    type: AIProviderType.ANTHROPIC,
    endpoint: 'https://api.anthropic.com/v1',
    models: [
      {
        name: 'claude-3-5-sonnet-20241022',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning', 'coding'],
        costPerToken: 0.000003,
        maxTokens: 200000,
      },
      {
        name: 'claude-3-5-haiku-20241022',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000008,
        maxTokens: 200000,
      },
    ],
    defaultModel: 'claude-3-5-sonnet-20241022',
  },
  [AIProviderType.ALIYUN]: {
    type: AIProviderType.ALIYUN,
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      {
        name: 'qwen-turbo',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000004,
        maxTokens: 8192,
      },
      {
        name: 'qwen-plus',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.0000008,
        maxTokens: 32768,
      },
    ],
    defaultModel: 'qwen-plus',
  },
  [AIProviderType.BAIDU]: {
    type: AIProviderType.BAIDU,
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    models: [
      {
        name: 'ernie-bot-4',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.000002,
        maxTokens: 8192,
      },
      {
        name: 'ernie-bot-turbo',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000008,
        maxTokens: 8192,
      },
    ],
    defaultModel: 'ernie-bot-4',
  },
  [AIProviderType.TENCENT]: {
    type: AIProviderType.TENCENT,
    endpoint: 'https://hunyuan.tencentcloudapi.com',
    models: [
      {
        name: 'hunyuan-lite',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000008,
        maxTokens: 8192,
      },
      {
        name: 'hunyuan-pro',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.0000015,
        maxTokens: 32768,
      },
    ],
    defaultModel: 'hunyuan-pro',
  },
  [AIProviderType.HUNGYUAN]: {
    type: AIProviderType.HUNGYUAN,
    endpoint: 'https://hunyuan.tencentcloudapi.com',
    models: [
      {
        name: 'hunyuan-lite',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000008,
        maxTokens: 8192,
      },
      {
        name: 'hunyuan-pro',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.0000015,
        maxTokens: 32768,
      },
    ],
    defaultModel: 'hunyuan-pro',
  },
  [AIProviderType.MINIMAX]: {
    type: AIProviderType.MINIMAX,
    endpoint: 'https://api.minimax.chat/v1',
    models: [
      {
        name: 'abab5.5-chat',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.0000005,
        maxTokens: 32768,
      },
      {
        name: 'abab6.5-chat',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.000001,
        maxTokens: 128000,
      },
    ],
    defaultModel: 'abab6.5-chat',
  },
  [AIProviderType.GOOGLE_GEMINI]: {
    type: AIProviderType.GOOGLE_GEMINI,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      {
        name: 'gemini-1.5-pro',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning', 'coding'],
        costPerToken: 0.00000125,
        maxTokens: 2000000,
      },
      {
        name: 'gemini-1.5-flash',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion'],
        costPerToken: 0.000000075,
        maxTokens: 1000000,
      },
    ],
    defaultModel: 'gemini-1.5-pro',
  },
  [AIProviderType.AZURE_OPENAI]: {
    type: AIProviderType.AZURE_OPENAI,
    endpoint: 'https://{your-resource-name}.openai.azure.com/openai/deployments/{deployment-id}',
    models: [
      {
        name: 'gpt-4',
        type: AIModelType.CHAT,
        capabilities: ['chat', 'completion', 'reasoning'],
        costPerToken: 0.00003,
        maxTokens: 8192,
      },
    ],
    defaultModel: 'gpt-4',
  },
  [AIProviderType.CUSTOM]: {
    type: AIProviderType.CUSTOM,
    endpoint: '',
    models: [],
  },
};

/**
 * Get all AI providers
 */
export async function getAllProviders(userId: string) {
  // Check if user has access to multiple AI providers
  if (!isFeatureAvailable(FeatureFlag.MULTIPLE_AI_PROVIDERS)) {
    throw new Error('Multiple AI providers feature requires Professional plan');
  }

  return await prisma.aIProvider.findMany({
    where: {
      createdById: userId,
    },
    orderBy: [
      { isDefault: 'desc' },
      { priority: 'desc' },
    ],
  });
}

/**
 * Get provider by ID
 */
export async function getProviderById(providerId: string, userId: string) {
  return await prisma.aIProvider.findFirst({
    where: {
      id: providerId,
      createdById: userId,
    },
  });
}

/**
 * Create AI provider
 */
export async function createProvider(
  userId: string,
  data: {
    name: string;
    type: AIProviderType;
    apiKey: string;
    endpoint?: string;
    region?: string;
    priority?: number;
    config?: any;
  }
) {
  if (!isFeatureAvailable(FeatureFlag.MULTIPLE_AI_PROVIDERS)) {
    throw new Error('Multiple AI providers feature requires Professional plan');
  }

  // Get provider config
  const providerConfig = PROVIDER_CONFIGS[data.type as AIProviderType];
  const supportedModels = providerConfig?.models.map((m: AIModelConfig) => m.name) || [];
  const capabilities = providerConfig?.models.flatMap((m: AIModelConfig) => m.capabilities) || [];

  return await prisma.aIProvider.create({
    data: {
      name: data.name,
      type: data.type,
      apiKey: data.apiKey,
      endpoint: data.endpoint || providerConfig?.endpoint,
      region: data.region,
      priority: data.priority || 0,
      config: data.config,
      supportedModels,
      capabilities,
      status: AIProviderStatus.ACTIVE,
      isDefault: false,
      createdById: userId,
    },
  });
}

/**
 * Update AI provider
 */
export async function updateProvider(
  providerId: string,
  userId: string,
  data: Partial<{
    name: string;
    apiKey: string;
    endpoint: string;
    status: AIProviderStatus;
    priority: number;
    isDefault: boolean;
    config: any;
  }>
) {
  // Verify ownership
  const provider = await getProviderById(providerId, userId);
  if (!provider) {
    throw new Error('Provider not found');
  }

  // If setting as default, remove default from others
  if (data.isDefault === true) {
    await prisma.aIProvider.updateMany({
      where: {
        createdById: userId,
        id: { not: providerId },
      },
      data: { isDefault: false },
    });
  }

  return await prisma.aIProvider.update({
    where: { id: providerId },
    data,
  });
}

/**
 * Delete AI provider
 */
export async function deleteProvider(providerId: string, userId: string) {
  const provider = await getProviderById(providerId, userId);
  if (!provider) {
    throw new Error('Provider not found');
  }

  return await prisma.aIProvider.delete({
    where: { id: providerId },
  });
}

/**
 * Select best AI provider based on context
 */
export async function selectBestProvider(
  context: {
    modelType?: AIModelType;
    capabilities?: string[];
    taskId?: string;
    context?: 'modeling' | 'learning' | 'coding';
  },
  userId: string
) {
  const providers = await getAllProviders(userId);

  if (providers.length === 0) {
    throw new Error('No AI providers configured');
  }

  // Filter by status
  const activeProviders = providers.filter((p) => p.status === AIProviderStatus.ACTIVE);

  if (activeProviders.length === 0) {
    throw new Error('No active AI providers available');
  }

  // Filter by capabilities if specified
  let candidateProviders = activeProviders;
  if (context.capabilities && context.capabilities.length > 0) {
    candidateProviders = activeProviders.filter((p) =>
      context.capabilities!.some((cap) => p.capabilities.includes(cap))
    );
  }

  // Fallback to all active providers if no match
  if (candidateProviders.length === 0) {
    candidateProviders = activeProviders;
  }

  // Sort by priority (highest first)
  candidateProviders.sort((a, b) => b.priority - a.priority);

  // Return the best provider (highest priority)
  return candidateProviders[0];
}

/**
 * Select best model for a provider
 */
export function selectBestModel(
  provider: any,
  context: {
    modelType?: AIModelType;
    capabilities?: string[];
    maxTokens?: number;
  }
): string {
  const providerConfig = PROVIDER_CONFIGS[provider.type as AIProviderType];
  if (!providerConfig) {
    return provider.supportedModels[0];
  }

  // Filter by model type if specified
  let models = providerConfig.models;
  if (context.modelType) {
    models = models.filter((m: AIModelConfig) => m.type === context.modelType);
  }

  // Filter by capabilities if specified
  if (context.capabilities && context.capabilities.length > 0) {
    models = models.filter((m: AIModelConfig) =>
      context.capabilities!.some((cap) => m.capabilities.includes(cap))
    );
  }

  // Filter by max tokens if specified
  if (context.maxTokens) {
    models = models.filter((m: AIModelConfig) => m.maxTokens >= context.maxTokens!);
  }

  // If no models match, return default model or first supported model
  if (models.length === 0) {
    return providerConfig.defaultModel || provider.supportedModels[0];
  }

  // Return first matching model
  return models[0].name;
}

/**
 * Call AI API (generic implementation)
 */
export async function callAI(
  providerId: string,
  model: string,
  prompt: string,
  context: {
    modelType: AIModelType;
    taskId?: string;
    context?: 'modeling' | 'learning' | 'coding';
  },
  userId: string
): Promise<{ response: string; tokensUsed: number; latencyMs: number }> {
  const provider = await getProviderById(providerId, userId);
  if (!provider) {
    throw new Error('Provider not found');
  }

  const startTime = Date.now();
  let response = '';
  let tokensUsed = 0;

  try {
    // Generic API call implementation
    // This would be expanded with provider-specific implementations
    const result = await makeProviderRequest(provider, model, prompt);
    response = result.content;
    tokensUsed = result.tokensUsed;

    // Update provider usage stats
    await prisma.aIProvider.update({
      where: { id: providerId },
      data: {
        totalRequests: { increment: 1 },
        totalTokensUsed: { increment: tokensUsed },
        lastUsedAt: new Date(),
      },
    });

    // Log the request
    await prisma.aIRequest.create({
      data: {
        providerId,
        modelName: model,
        modelType: context.modelType,
        prompt,
        response,
        tokensUsed,
        latencyMs: Date.now() - startTime,
        status: 'success',
        taskId: context.taskId,
        context: context.context,
      },
    });

    logger.info(`AI call successful`, {
      providerId,
      model,
      tokensUsed,
      latencyMs: Date.now() - startTime,
    });

    return { response, tokensUsed, latencyMs: Date.now() - startTime };
  } catch (error) {
    logger.error(`AI call failed`, error, { providerId, model });

    // Log failed request
    await prisma.aIRequest.create({
      data: {
        providerId,
        modelName: model,
        modelType: context.modelType,
        prompt,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        taskId: context.taskId,
        context: context.context,
        latencyMs: Date.now() - startTime,
        tokensUsed: 0,
      },
    });

    throw error;
  }
}

/**
 * Make provider-specific API request
 * (This is a placeholder - actual implementation would be provider-specific)
 */
async function makeProviderRequest(
  provider: any,
  model: string,
  prompt: string
): Promise<{ content: string; tokensUsed: number }> {
  // This is a simplified implementation
  // In production, this would use actual API calls to each provider

  const endpoint = provider.endpoint || PROVIDER_CONFIGS[provider.type as AIProviderType]?.endpoint;

  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return { content, tokensUsed };
  } catch (error) {
    logger.error('Provider API request failed', error);
    throw error;
  }
}

/**
 * Get available provider types
 */
export function getAvailableProviderTypes(): {
  type: AIProviderType;
  name: string;
  description: string;
  requiresKey: boolean;
}[] {
  return [
    {
      type: AIProviderType.DEEPSEEK,
      name: 'DeepSeek',
      description: 'High-performance Chinese AI model, excellent for reasoning and coding',
      requiresKey: true,
    },
    {
      type: AIProviderType.VOLCENGINE,
      name: 'VolcEngine (Doubao)',
      description: 'ByteDance AI models, strong Chinese language understanding',
      requiresKey: true,
    },
    {
      type: AIProviderType.ALIYUN_QWEN,
      name: 'Alibaba Qwen',
      description: 'Alibaba cloud AI models, cost-effective and reliable',
      requiresKey: true,
    },
    {
      type: AIProviderType.BAIDU_WENXIN,
      name: 'Baidu WenXin',
      description: 'Baidu ERNIE models, strong knowledge base integration',
      requiresKey: true,
    },
    {
      type: AIProviderType.ZHIPU,
      name: 'Zhipu AI (GLM)',
      description: 'Tsinghua University AI models, excellent academic performance',
      requiresKey: true,
    },
    {
      type: AIProviderType.OPENAI,
      name: 'OpenAI',
      description: 'Industry-leading GPT models, excellent for general tasks',
      requiresKey: true,
    },
    {
      type: AIProviderType.ANTHROPIC,
      name: 'Anthropic Claude',
      description: 'Safe and powerful AI models, excellent for analysis and coding',
      requiresKey: true,
    },
    {
      type: AIProviderType.GOOGLE_GEMINI,
      name: 'Google Gemini',
      description: 'Multimodal AI models, supports 1M+ token context',
      requiresKey: true,
    },
    {
      type: AIProviderType.AZURE_OPENAI,
      name: 'Azure OpenAI',
      description: 'Enterprise-grade OpenAI deployment on Azure',
      requiresKey: true,
    },
    {
      type: AIProviderType.CUSTOM,
      name: 'Custom Provider',
      description: 'Configure a custom AI provider endpoint',
      requiresKey: true,
    },
  ];
}
