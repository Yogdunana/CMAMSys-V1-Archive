/**
 * 任务列表版本历史服务
 * 记录任务列表的修改历史，支持版本回退
 */

export interface TaskListVersion {
  id: string;
  taskId: string;
  version: number;
  taskList: string[];
  createdAt: string;
  createdBy?: string;
  changeSummary: string;
  changeType: 'create' | 'update' | 'restore' | 'optimize';
  metadata?: {
    qualityScore?: number;
    taskCount?: number;
    source?: 'ai' | 'manual' | 'template';
  };
}

/**
 * 版本历史存储（从 localStorage 读取）
 */
function getVersionHistory(taskId: string): TaskListVersion[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = `task-version-history-${taskId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取版本历史失败:', error);
  }

  return [];
}

/**
 * 保存版本历史
 */
function saveVersionHistory(taskId: string, versions: TaskListVersion[]): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `task-version-history-${taskId}`;
    localStorage.setItem(key, JSON.stringify(versions));
  } catch (error) {
    console.error('保存版本历史失败:', error);
  }
}

/**
 * 创建新版本
 */
export function createVersion(
  taskId: string,
  taskList: string[],
  changeSummary: string,
  changeType: TaskListVersion['changeType'] = 'update',
  metadata?: TaskListVersion['metadata'],
  createdBy?: string
): TaskListVersion {
  const history = getVersionHistory(taskId);
  const versionNumber = history.length + 1;

  const version: TaskListVersion = {
    id: `version-${Date.now()}`,
    taskId,
    version: versionNumber,
    taskList,
    createdAt: new Date().toISOString(),
    createdBy,
    changeSummary,
    changeType,
    metadata: {
      ...metadata,
      taskCount: taskList.length,
    },
  };

  history.push(version);

  // 限制历史记录数量，最多保存 20 个版本
  if (history.length > 20) {
    history.shift();
  }

  saveVersionHistory(taskId, history);

  return version;
}

/**
 * 获取版本历史
 */
export function getVersionHistoryByTaskId(taskId: string): TaskListVersion[] {
  const history = getVersionHistory(taskId);
  // 按版本号降序排列
  return history.sort((a, b) => b.version - a.version);
}

/**
 * 获取最新版本
 */
export function getLatestVersion(taskId: string): TaskListVersion | null {
  const history = getVersionHistory(taskId);
  if (history.length === 0) return null;

  return history.reduce((latest, version) =>
    version.version > latest.version ? version : latest
  );
}

/**
 * 获取指定版本
 */
export function getVersionById(taskId: string, versionId: string): TaskListVersion | null {
  const history = getVersionHistory(taskId);
  return history.find(v => v.id === versionId) || null;
}

/**
 * 回退到指定版本
 */
export function restoreVersion(
  taskId: string,
  versionId: string,
  restoredBy?: string
): TaskListVersion | null {
  const targetVersion = getVersionById(taskId, versionId);
  if (!targetVersion) {
    return null;
  }

  // 创建新的版本记录回退操作
  return createVersion(
    taskId,
    targetVersion.taskList,
    `回退到版本 ${targetVersion.version} (${targetVersion.changeSummary})`,
    'restore',
    targetVersion.metadata,
    restoredBy
  );
}

/**
 * 比较两个版本
 */
export function compareVersions(
  taskId: string,
  version1Id: string,
  version2Id: string
): {
  added: string[];
  removed: string[];
  modified: { index: number; from: string; to: string }[];
} {
  const v1 = getVersionById(taskId, version1Id);
  const v2 = getVersionById(taskId, version2Id);

  if (!v1 || !v2) {
    return { added: [], removed: [], modified: [] };
  }

  const added: string[] = [];
  const removed: string[] = [];
  const modified: { index: number; from: string; to: string }[] = [];

  const tasks1 = v1.taskList;
  const tasks2 = v2.taskList;

  // 查找新增的任务
  tasks2.forEach(task => {
    if (!tasks1.includes(task)) {
      added.push(task);
    }
  });

  // 查找删除的任务
  tasks1.forEach(task => {
    if (!tasks2.includes(task)) {
      removed.push(task);
    }
  });

  // 查找修改的任务（内容不同但索引相同）
  const maxIndex = Math.max(tasks1.length, tasks2.length);
  for (let i = 0; i < maxIndex; i++) {
    const task1 = tasks1[i];
    const task2 = tasks2[i];
    if (task1 && task2 && task1 !== task2) {
      modified.push({ index: i, from: task1, to: task2 });
    }
  }

  return { added, removed, modified };
}

/**
 * 别名导出，用于兼容性
 */
export const createTaskVersion = createVersion;
export const getTaskVersionHistory = getVersionHistoryByTaskId;
export const restoreTaskVersion = restoreVersion;

/**
 * 删除版本历史
 */
export function deleteVersionHistory(taskId: string): boolean {
  try {
    const key = `task-version-history-${taskId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('删除版本历史失败:', error);
    return false;
  }
}

/**
 * 清理旧版本（保留最新的 N 个版本）
 */
export function cleanOldVersions(taskId: string, keepCount: number = 10): void {
  const history = getVersionHistory(taskId);
  if (history.length <= keepCount) return;

  const sortedHistory = history.sort((a, b) => b.version - a.version);
  const toKeep = sortedHistory.slice(0, keepCount);
  saveVersionHistory(taskId, toKeep);
}

/**
 * 导出版本历史
 */
export function exportVersionHistory(taskId: string): string | null {
  const history = getVersionHistory(taskId);
  if (history.length === 0) return null;

  return JSON.stringify(history, null, 2);
}

/**
 * 导入版本历史
 */
export function importVersionHistory(taskId: string, jsonString: string): boolean {
  try {
    const history = JSON.parse(jsonString);

    if (!Array.isArray(history)) {
      throw new Error('无效的版本历史格式');
    }

    // 验证每个版本的结构
    history.forEach((version: any) => {
      if (!version.id || !version.version || !version.taskList) {
        throw new Error('无效的版本格式');
      }
    });

    saveVersionHistory(taskId, history);
    return true;
  } catch (error) {
    console.error('导入版本历史失败:', error);
    return false;
  }
}

/**
 * 获取版本统计信息
 */
export function getVersionStats(taskId: string): {
  totalVersions: number;
  firstVersion: TaskListVersion | null;
  lastVersion: TaskListVersion | null;
  byType: Record<string, number>;
  timeRange: { start: string | null; end: string | null };
} {
  const history = getVersionHistory(taskId);
  const byType: Record<string, number> = {};

  history.forEach(version => {
    byType[version.changeType] = (byType[version.changeType] || 0) + 1;
  });

  const sortedHistory = history.sort((a, b) => a.version - b.version);

  return {
    totalVersions: history.length,
    firstVersion: sortedHistory[0] || null,
    lastVersion: sortedHistory[sortedHistory.length - 1] || null,
    byType,
    timeRange: {
      start: sortedHistory[0]?.createdAt || null,
      end: sortedHistory[sortedHistory.length - 1]?.createdAt || null,
    },
  };
}
