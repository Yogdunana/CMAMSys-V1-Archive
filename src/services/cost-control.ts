/**
 * 成本管控服务
 * 实现调用限制、Token 上限、本地缓存
 */

import prisma from '@/lib/prisma';

// 默认限制配置
const DEFAULT_LIMITS = {
  DAILY_TOKEN_LIMIT: 100000,  // 每日 Token 上限
  DAILY_CALL_LIMIT: 100,      // 每日调用次数上限
  CACHE_EXPIRY_HOURS: 24,     // 缓存过期时间（小时）
};

/**
 * 检查 Provider 是否超出调用限制
 */
export async function checkProviderLimit(providerId: string): Promise<{
  canUse: boolean;
  reason?: string;
  tokensUsed: number;
  callsCount: number;
}> {
  try {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return { canUse: false, reason: 'Provider not found', tokensUsed: 0, callsCount: 0 };
    }

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

    const tokensUsed = costControl?.tokensUsed || 0;
    const callsCount = costControl?.callsCount || 0;

    const tokenLimit = provider.dailyTokenLimit || DEFAULT_LIMITS.DAILY_TOKEN_LIMIT;
    const callLimit = provider.dailyCallLimit || DEFAULT_LIMITS.DAILY_CALL_LIMIT;

    if (tokensUsed >= tokenLimit) {
      return {
        canUse: false,
        reason: `每日 Token 上限已用完 (${tokensUsed}/${tokenLimit})`,
        tokensUsed,
        callsCount,
      };
    }

    if (callsCount >= callLimit) {
      return {
        canUse: false,
        reason: `每日调用次数上限已用完 (${callsCount}/${callLimit})`,
        tokensUsed,
        callsCount,
      };
    }

    return {
      canUse: true,
      tokensUsed,
      callsCount,
    };
  } catch (error) {
    console.error('Error checking provider limit:', error);
    return { canUse: false, reason: '检查失败', tokensUsed: 0, callsCount: 0 };
  }
}

/**
 * 更新 Provider 使用统计
 */
export async function updateProviderUsage(
  providerId: string,
  tokenCount: number
): Promise<void> {
  try {
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
 * 获取讨论缓存
 */
export async function getDiscussionCache(
  problemType: string,
  problemContent: string
): Promise<any | null> {
  try {
    // 生成缓存 key
    const cacheKey = generateCacheKey(problemType, problemContent);

    const cache = await prisma.discussionCache.findUnique({
      where: { cacheKey },
    });

    if (!cache) {
      return null;
    }

    // 检查是否过期
    if (new Date() > cache.expiresAt) {
      await prisma.discussionCache.delete({
        where: { id: cache.id },
      });
      return null;
    }

    return {
      discussionResult: cache.discussionResult,
      codeResult: cache.codeResult,
    };
  } catch (error) {
    console.error('Error getting discussion cache:', error);
    return null;
  }
}

/**
 * 保存讨论缓存
 */
export async function saveDiscussionCache(
  problemType: string,
  problemContent: string,
  discussionResult: any,
  codeResult?: any
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(problemType, problemContent);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + DEFAULT_LIMITS.CACHE_EXPIRY_HOURS);

    await prisma.discussionCache.create({
      data: {
        cacheKey,
        problemType,
        problemContent,
        discussionResult,
        codeResult,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error saving discussion cache:', error);
  }
}

/**
 * 生成缓存 key
 */
function generateCacheKey(problemType: string, problemContent: string): string {
  // 使用问题内容的前 100 个字符生成 hash
  const content = problemContent.substring(0, 100);
  const hash = require('crypto')
    .createHash('md5')
    .update(problemType + content)
    .digest('hex');
  return `disc_${hash}`;
}

/**
 * 获取成本统计
 */
export async function getCostStatistics(userId: string) {
  try {
    const providers = await prisma.aIProvider.findMany({
      where: { createdById: userId },
    });

    // 获取每个 Provider 的成本控制记录
    const stats = await Promise.all(
      providers.map(async (provider) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCost = await prisma.costControl.findUnique({
          where: {
            providerId_date: {
              providerId: provider.id,
              date: today,
            },
          },
        });

        return {
          providerName: provider.name,
          providerType: provider.type,
          todayTokensUsed: todayCost?.tokensUsed || 0,
          todayCallsCount: todayCost?.callsCount || 0,
          totalTokensUsed: provider.totalTokensUsed,
          totalRequests: provider.totalRequests,
          dailyTokenLimit: provider.dailyTokenLimit || DEFAULT_LIMITS.DAILY_TOKEN_LIMIT,
          dailyCallLimit: provider.dailyCallLimit || DEFAULT_LIMITS.DAILY_CALL_LIMIT,
        };
      })
    );

    return stats;
  } catch (error) {
    console.error('Error getting cost statistics:', error);
    return [];
  }
}

/**
 * 清理过期缓存
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const result = await prisma.discussionCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
    return 0;
  }
}
