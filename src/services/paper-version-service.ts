/**
 * 论文版本管理服务
 * 提供论文版本创建、恢复、比较等功能
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaperVersionData {
  paperId: string;
  title: string;
  content: string;
  sections?: any;
  wordCount?: number;
  changeDescription?: string;
  isMajorVersion?: boolean;
  createdBy?: string;
}

/**
 * 创建新的论文版本
 */
export async function createPaperVersion(data: PaperVersionData) {
  // 获取论文当前版本号
  const lastVersion = await prisma.paperVersion.findFirst({
    where: { paperId: data.paperId },
    orderBy: { versionNumber: 'desc' },
  });

  const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  // 创建新版本
  const version = await prisma.paperVersion.create({
    data: {
      paperId: data.paperId,
      versionNumber,
      content: data.content,
      changeDescription: data.changeDescription ?? '',
      createdBy: data.createdBy,
    },
  });

  return version;
}

/**
 * 获取论文的所有版本
 */
export async function getPaperVersions(paperId: string) {
  const versions = await prisma.paperVersion.findMany({
    where: { paperId },
    orderBy: { versionNumber: 'desc' },
  });

  return versions;
}

/**
 * 获取论文的特定版本
 */
export async function getPaperVersion(paperId: string, versionNumber: number) {
  const version = await prisma.paperVersion.findUnique({
    where: {
      paperId_versionNumber: {
        paperId,
        versionNumber,
      },
    },
  });

  return version;
}

/**
 * 获取论文的最新版本
 */
export async function getLatestPaperVersion(paperId: string) {
  const version = await prisma.paperVersion.findFirst({
    where: { paperId },
    orderBy: { versionNumber: 'desc' },
  });

  return version;
}

/**
 * 恢复论文到指定版本
 */
export async function restorePaperVersion(paperId: string, versionNumber: number) {
  const version = await getPaperVersion(paperId, versionNumber);

  if (!version) {
    throw new Error(`Version ${versionNumber} not found for paper ${paperId}`);
  }

  // 更新当前论文内容（只恢复 content，其他字段保持不变）
  const updatedPaper = await prisma.generatedPaper.update({
    where: { id: paperId },
    data: {
      content: version.content,
      updatedAt: new Date(),
    },
  });

  // 创建一个新的版本记录这次恢复操作
  await createPaperVersion({
    paperId,
    title: updatedPaper.title,
    content: version.content,
    changeDescription: `Restored from version ${versionNumber}`,
  });

  return updatedPaper;
}

/**
 * 比较两个版本的差异
 */
export function comparePaperVersions(version1: any, version2: any) {
  const changes = {
    titleChanged: version1.title !== version2.title,
    contentChanged: version1.content !== version2.content,
    wordCountDiff: (version2.wordCount || 0) - (version1.wordCount || 0),
  };

  return changes;
}

/**
 * 删除论文版本
 */
export async function deletePaperVersion(paperId: string, versionNumber: number) {
  const version = await prisma.paperVersion.delete({
    where: {
      paperId_versionNumber: {
        paperId,
        versionNumber,
      },
    },
  });

  return version;
}

/**
 * 批量删除旧版本（保留最新的 N 个版本）
 */
export async function cleanupOldVersions(paperId: string, keepCount: number = 10) {
  const versions = await prisma.paperVersion.findMany({
    where: { paperId },
    orderBy: { versionNumber: 'desc' },
  });

  if (versions.length <= keepCount) {
    return { deletedCount: 0 };
  }

  // 删除超过保留数量的旧版本
  const versionsToDelete = versions.slice(keepCount);

  for (const version of versionsToDelete) {
    await deletePaperVersion(paperId, version.versionNumber);
  }

  return { deletedCount: versionsToDelete.length };
}

/**
 * 获取版本统计信息
 */
export async function getVersionStatistics(paperId: string) {
  const versions = await getPaperVersions(paperId);

  const majorVersions = versions.filter(v => v.versionNumber % 10 === 0);
  const minorVersions = versions.filter(v => v.versionNumber % 10 !== 0);

  return {
    totalVersions: versions.length,
    majorVersions: majorVersions.length,
    minorVersions: minorVersions.length,
    latestVersion: versions[0]?.versionNumber || 0,
    firstVersion: versions[versions.length - 1]?.versionNumber || 0,
  };
}
