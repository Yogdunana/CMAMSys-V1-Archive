import { diffLines, diffWords, diffChars } from 'diff';

export interface DiffResult {
  type: 'line' | 'word' | 'char';
  changes: DiffChange[];
  statistics: DiffStatistics;
}

export interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffStatistics {
  addedLines: number;
  removedLines: number;
  addedWords: number;
  removedWords: number;
  totalChanges: number;
}

/**
 * 比较两个版本的差异（按行）
 */
export function compareTextByLine(oldText: string, newText: string): DiffResult {
  const changes = diffLines(oldText, newText);

  let addedLines = 0;
  let removedLines = 0;

  changes.forEach(change => {
    if (change.added) {
      addedLines += change.value.split('\n').filter(l => l.trim()).length;
    }
    if (change.removed) {
      removedLines += change.value.split('\n').filter(l => l.trim()).length;
    }
  });

  return {
    type: 'line',
    changes,
    statistics: {
      addedLines,
      removedLines,
      addedWords: 0,
      removedWords: 0,
      totalChanges: addedLines + removedLines,
    },
  };
}

/**
 * 比较两个版本的差异（按词）
 */
export function compareTextByWord(oldText: string, newText: string): DiffResult {
  const changes = diffWords(oldText, newText);

  let addedWords = 0;
  let removedWords = 0;

  changes.forEach(change => {
    if (change.added) {
      addedWords += change.value.split(/\s+/).filter(w => w.trim()).length;
    }
    if (change.removed) {
      removedWords += change.value.split(/\s+/).filter(w => w.trim()).length;
    }
  });

  return {
    type: 'word',
    changes,
    statistics: {
      addedLines: 0,
      removedLines: 0,
      addedWords,
      removedWords,
      totalChanges: addedWords + removedWords,
    },
  };
}

/**
 * 比较两个版本的差异（按字符）
 */
export function compareTextByChar(oldText: string, newText: string): DiffResult {
  const changes = diffChars(oldText, newText);

  let addedChars = 0;
  let removedChars = 0;

  changes.forEach(change => {
    if (change.added) {
      addedChars += change.value.length;
    }
    if (change.removed) {
      removedChars += change.value.length;
    }
  });

  return {
    type: 'char',
    changes,
    statistics: {
      addedLines: 0,
      removedLines: 0,
      addedWords: addedChars,
      removedWords: removedChars,
      totalChanges: addedChars + removedChars,
    },
  };
}

/**
 * 综合比较（行+词）
 */
export function compareTextComprehensive(oldText: string, newText: string): DiffResult {
  const lineDiff = compareTextByLine(oldText, newText);
  const wordDiff = compareTextByWord(oldText, newText);

  return {
    type: 'word',
    changes: wordDiff.changes,
    statistics: {
      addedLines: lineDiff.statistics.addedLines,
      removedLines: lineDiff.statistics.removedLines,
      addedWords: wordDiff.statistics.addedWords,
      removedWords: wordDiff.statistics.removedWords,
      totalChanges: lineDiff.statistics.totalChanges + wordDiff.statistics.totalChanges,
    },
  };
}

/**
 * 将 Diff 转换为 HTML（带样式）
 */
export function diffToHtml(diff: DiffResult): string {
  let html = '';

  diff.changes.forEach(change => {
    if (change.added) {
      html += `<span class="diff-added">${escapeHtml(change.value)}</span>`;
    } else if (change.removed) {
      html += `<span class="diff-removed">${escapeHtml(change.value)}</span>`;
    } else {
      html += `<span class="diff-unchanged">${escapeHtml(change.value)}</span>`;
    }
  });

  return html;
}

/**
 * 生成并排对比视图
 */
export function generateSideBySideComparison(oldText: string, newText: string): {
  oldSide: string;
  newSide: string;
} {
  const changes = diffLines(oldText, newText);

  let oldSide = '';
  let newSide = '';

  changes.forEach(change => {
    if (change.removed) {
      oldSide += `<div class="diff-line diff-removed">${escapeHtml(change.value)}</div>`;
    } else if (change.added) {
      newSide += `<div class="diff-line diff-added">${escapeHtml(change.value)}</div>`;
    } else {
      oldSide += `<div class="diff-line diff-unchanged">${escapeHtml(change.value)}</div>`;
      newSide += `<div class="diff-line diff-unchanged">${escapeHtml(change.value)}</div>`;
    }
  });

  return { oldSide, newSide };
}

/**
 * 生成统一对比视图
 */
export function generateUnifiedComparison(oldText: string, newText: string): string {
  const changes = diffLines(oldText, newText);

  let html = '';

  changes.forEach(change => {
    if (change.removed) {
      html += `<div class="diff-line diff-removed">- ${escapeHtml(change.value)}</div>`;
    } else if (change.added) {
      html += `<div class="diff-line diff-added">+ ${escapeHtml(change.value)}</div>`;
    } else {
      html += `<div class="diff-line diff-unchanged">  ${escapeHtml(change.value)}</div>`;
    }
  });

  return html;
}

/**
 * 检测文本变化类型
 */
export function detectChangeType(oldText: string, newText: string): {
  isMinorEdit: boolean;
  isMajorRevision: boolean;
  isContentAddition: boolean;
  isContentRemoval: boolean;
  changePercentage: number;
} {
  const lineDiff = compareTextByLine(oldText, newText);
  const wordDiff = compareTextByWord(oldText, newText);

  const oldLines = oldText.split('\n').filter(l => l.trim()).length || 1;
  const oldWords = oldText.split(/\s+/).filter(w => w.trim()).length || 1;

  const lineChangePercentage = (lineDiff.statistics.totalChanges / oldLines) * 100;
  const wordChangePercentage = (wordDiff.statistics.totalChanges / oldWords) * 100;
  const changePercentage = Math.max(lineChangePercentage, wordChangePercentage);

  const isMinorEdit = changePercentage < 10 && lineDiff.statistics.addedLines < 5 && lineDiff.statistics.removedLines < 5;
  const isMajorRevision = changePercentage > 30 || lineDiff.statistics.addedLines > 20 || lineDiff.statistics.removedLines > 20;
  const isContentAddition = lineDiff.statistics.addedLines > lineDiff.statistics.removedLines * 1.5;
  const isContentRemoval = lineDiff.statistics.removedLines > lineDiff.statistics.addedLines * 1.5;

  return {
    isMinorEdit,
    isMajorRevision,
    isContentAddition,
    isContentRemoval,
    changePercentage,
  };
}

/**
 * 生成变更摘要
 */
export function generateChangeSummary(oldText: string, newText: string): string {
  const statistics = compareTextComprehensive(oldText, newText).statistics;
  const changeType = detectChangeType(oldText, newText);

  let summary = [];

  if (statistics.addedLines > 0) {
    summary.push(`新增 ${statistics.addedLines} 行`);
  }
  if (statistics.removedLines > 0) {
    summary.push(`删除 ${statistics.removedLines} 行`);
  }
  if (statistics.addedWords > 0) {
    summary.push(`新增 ${statistics.addedWords} 词`);
  }
  if (statistics.removedWords > 0) {
    summary.push(`删除 ${statistics.removedWords} 词`);
  }

  let typeSummary = '';

  if (changeType.isMinorEdit) {
    typeSummary = '（小幅编辑）';
  } else if (changeType.isMajorRevision) {
    typeSummary = '（重大修订）';
  } else if (changeType.isContentAddition) {
    typeSummary = '（内容扩充）';
  } else if (changeType.isContentRemoval) {
    typeSummary = '（内容精简）';
  } else {
    typeSummary = '（常规修改）';
  }

  return summary.join('，') + typeSummary;
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}
