/**
 * 论文版本管理服务
 * 管理论文的版本历史、创建新版本、恢复旧版本等
 */

import prisma from '@/lib/prisma';
import { PaperVersion } from '@prisma/client';

export interface CreateVersionParams {
  paperId: string;
  content: string;
  versionNumber?: number;
  changeDescription?: string;
  userId?: string;
}

export interface RestoreVersionParams {
  paperId: string;
  versionId: string;
  userId?: string;
}

/**
 * 创建论文新版本
 */
export async function createPaperVersion(params: CreateVersionParams): Promise<PaperVersion> {
  try {
    console.log(`[PaperVersion] 创建新版本: ${params.paperId}`);

    // 获取当前论文
    const paper = await prisma.generatedPaper.findUnique({
      where: { id: params.paperId },
    });

    if (!paper) {
      throw new Error(`论文不存在: ${params.paperId}`);
    }

    // 获取当前版本号
    const latestVersion = await prisma.paperVersion.findFirst({
      where: { paperId: params.paperId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersionNumber = params.versionNumber || (latestVersion ? latestVersion.versionNumber + 1 : 1);

    // 创建新版本
    const newVersion = await prisma.paperVersion.create({
      data: {
        paperId: params.paperId,
        versionNumber: nextVersionNumber,
        content: params.content,
        changeDescription: params.changeDescription || `版本 ${nextVersionNumber}`,
        createdBy: params.userId || null,
      },
    });

    console.log(`[PaperVersion] 版本 ${nextVersionNumber} 创建成功`);
    return newVersion;
  } catch (error) {
    console.error('[PaperVersion] 创建版本失败:', error);
    throw error;
  }
}

/**
 * 获取论文的所有版本
 */
export async function getPaperVersions(paperId: string) {
  try {
    const versions = await prisma.paperVersion.findMany({
      where: { paperId },
      orderBy: { versionNumber: 'desc' },
    });

    return versions.map(v => ({
      id: v.id,
      versionNumber: v.versionNumber,
      changeDescription: v.changeDescription,
      createdAt: v.createdAt,
      wordCount: v.content.length,
      createdBy: v.createdBy,
    }));
  } catch (error) {
    console.error('[PaperVersion] 获取版本列表失败:', error);
    throw error;
  }
}

/**
 * 获取特定版本的详细信息
 */
export async function getPaperVersion(versionId: string) {
  try {
    const version = await prisma.paperVersion.findUnique({
      where: { id: versionId },
      include: {
        paper: {
          select: {
            id: true,
            title: true,
            format: true,
            language: true,
          },
        },
      },
    });

    if (!version) {
      throw new Error(`版本不存在: ${versionId}`);
    }

    return {
      id: version.id,
      versionNumber: version.versionNumber,
      content: version.content,
      changeDescription: version.changeDescription,
      createdAt: version.createdAt,
      createdBy: version.createdBy,
      paper: version.paper,
      wordCount: version.content.length,
    };
  } catch (error) {
    console.error('[PaperVersion] 获取版本详情失败:', error);
    throw error;
  }
}

/**
 * 比较两个版本的差异
 */
export async function comparePaperVersions(version1Id: string, version2Id: string) {
  try {
    const [v1, v2] = await Promise.all([
      prisma.paperVersion.findUnique({ where: { id: version1Id } }),
      prisma.paperVersion.findUnique({ where: { id: version2Id } }),
    ]);

    if (!v1 || !v2) {
      throw new Error('版本不存在');
    }

    // 计算内容差异（简单的行数和字数差异）
    const lines1 = v1.content.split('\n').length;
    const lines2 = v2.content.split('\n').length;
    const words1 = v1.content.length;
    const words2 = v2.content.length;

    return {
      version1: {
        id: v1.id,
        versionNumber: v1.versionNumber,
        lineCount: lines1,
        wordCount: words1,
      },
      version2: {
        id: v2.id,
        versionNumber: v2.versionNumber,
        lineCount: lines2,
        wordCount: words2,
      },
      differences: {
        lineDiff: lines2 - lines1,
        wordDiff: words2 - words1,
        percentChange: words1 > 0 ? ((words2 - words1) / words1 * 100).toFixed(2) + '%' : 'N/A',
      },
    };
  } catch (error) {
    console.error('[PaperVersion] 比较版本失败:', error);
    throw error;
  }
}

/**
 * 恢复到指定版本
 */
export async function restorePaperVersion(params: RestoreVersionParams): Promise<void> {
  try {
    console.log(`[PaperVersion] 恢复到版本: ${params.versionId}`);

    // 获取要恢复的版本
    const version = await prisma.paperVersion.findUnique({
      where: { id: params.versionId },
    });

    if (!version) {
      throw new Error(`版本不存在: ${params.versionId}`);
    }

    // 保存当前版本作为新版本（如果当前内容与最新版本不同）
    const currentPaper = await prisma.generatedPaper.findUnique({
      where: { id: params.paperId },
    });

    if (currentPaper && currentPaper.content !== version.content) {
      await createPaperVersion({
        paperId: params.paperId,
        content: currentPaper.content,
        changeDescription: `恢复前保存 (v${version.versionNumber})`,
        userId: params.userId,
      });
    }

    // 恢复论文内容
    await prisma.generatedPaper.update({
      where: { id: params.paperId },
      data: {
        content: version.content,
        updatedAt: new Date(),
      },
    });

    console.log(`[PaperVersion] 恢复完成`);
  } catch (error) {
    console.error('[PaperVersion] 恢复版本失败:', error);
    throw error;
  }
}

/**
 * 删除旧版本（保留最新的 N 个版本）
 */
export async function cleanupOldVersions(paperId: string, keepCount: number = 10) {
  try {
    // 获取所有版本
    const versions = await prisma.paperVersion.findMany({
      where: { paperId },
      orderBy: { versionNumber: 'desc' },
    });

    if (versions.length <= keepCount) {
      console.log(`[PaperVersion] 版本数量 ${versions.length} 不超过保留数量 ${keepCount}，无需清理`);
      return;
    }

    // 删除超过保留数量的旧版本
    const versionsToDelete = versions.slice(keepCount);
    const deleteIds = versionsToDelete.map(v => v.id);

    await prisma.paperVersion.deleteMany({
      where: {
        id: { in: deleteIds },
      },
    });

    console.log(`[PaperVersion] 已删除 ${deleteIds.length} 个旧版本`);
  } catch (error) {
    console.error('[PaperVersion] 清理旧版本失败:', error);
    throw error;
  }
}

/**
 * 导出版本历史
 */
export async function exportVersionHistory(paperId: string) {
  try {
    const versions = await getPaperVersions(paperId);

    const history = {
      paperId,
      totalVersions: versions.length,
      versions: versions.map(v => ({
        versionNumber: v.versionNumber,
        description: v.changeDescription,
        createdAt: v.createdAt,
        wordCount: v.wordCount,
      })),
    };

    return history;
  } catch (error) {
    console.error('[PaperVersion] 导出版本历史失败:', error);
    throw error;
  }
}
