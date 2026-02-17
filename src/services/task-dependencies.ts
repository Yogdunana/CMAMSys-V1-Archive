/**
 * 任务依赖关系服务
 * 管理任务之间的依赖关系
 */

export interface TaskDependency {
  id: string;
  fromTaskId: number; // 依赖的任务 ID
  toTaskId: number; // 被依赖的任务 ID
  type: 'sequential' | 'parallel' | 'conditional';
  description?: string;
}

export interface TaskWithDependencies {
  id: number;
  text: string;
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: TaskDependency[]; // 依赖的其他任务
  dependents: TaskDependency[]; // 依赖此任务的其他任务
}

/**
 * 验证依赖关系
 */
export function validateDependencies(
  tasks: TaskWithDependencies[]
): {
  isValid: boolean;
  cycles: number[][];
  issues: string[];
} {
  const issues: string[] = [];
  const cycles: number[][] = [];

  // 检查循环依赖
  const visited = new Set<number>();
  const path = new Set<number>();

  function dfs(taskId: number, currentPath: number[]): boolean {
    if (currentPath.includes(taskId)) {
      // 发现循环
      cycles.push([...currentPath, taskId]);
      return true;
    }

    if (visited.has(taskId)) {
      return false;
    }

    visited.add(taskId);
    currentPath.push(taskId);

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      for (const dep of task.dependencies) {
        if (dfs(dep.toTaskId, [...currentPath])) {
          return true;
        }
      }
    }

    currentPath.pop();
    return false;
  }

  for (const task of tasks) {
    if (dfs(task.id, [])) {
      issues.push(`发现循环依赖：${cycles[cycles.length - 1].join(' -> ')}`);
    }
  }

  // 检查无效依赖
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      const targetTask = tasks.find(t => t.id === dep.toTaskId);
      if (!targetTask) {
        issues.push(`任务 ${task.id} 依赖了不存在的任务 ${dep.toTaskId}`);
      }
    }
  }

  return {
    isValid: cycles.length === 0 && issues.length === 0,
    cycles,
    issues,
  };
}

/**
 * 获取可执行的任务（所有依赖都已完成）
 */
export function getExecutableTasks(tasks: TaskWithDependencies[]): number[] {
  return tasks
    .filter(task => {
      // 任务必须是 pending 状态
      if (task.status !== 'pending') return false;

      // 所有依赖的任务都必须已完成
      const allDependenciesCompleted = task.dependencies.every(dep => {
        const depTask = tasks.find(t => t.id === dep.toTaskId);
        return depTask?.status === 'completed';
      });

      return allDependenciesCompleted;
    })
    .map(task => task.id);
}

/**
 * 获取阻塞的任务（依赖未完成）
 */
export function getBlockedTasks(tasks: TaskWithDependencies[]): {
  taskId: number;
  blockedBy: number[];
}[] {
  return tasks
    .filter(task => {
      if (task.status !== 'pending') return false;

      // 检查是否有未完成的依赖
      const hasIncompleteDependency = task.dependencies.some(dep => {
        const depTask = tasks.find(t => t.id === dep.toTaskId);
        return depTask?.status !== 'completed';
      });

      return hasIncompleteDependency;
    })
    .map(task => ({
      taskId: task.id,
      blockedBy: task.dependencies
        .filter(dep => {
          const depTask = tasks.find(t => t.id === dep.toTaskId);
          return depTask?.status !== 'completed';
        })
        .map(dep => dep.toTaskId),
    }));
}

/**
 * 拓扑排序（根据依赖关系排序任务）
 */
export function topologicalSort(tasks: TaskWithDependencies[]): number[] {
  const result: number[] = [];
  const inDegree = new Map<number, number>();
  const adjacencyList = new Map<number, number[]>();

  // 初始化
  tasks.forEach(task => {
    inDegree.set(task.id, 0);
    adjacencyList.set(task.id, []);
  });

  // 构建图
  tasks.forEach(task => {
    task.dependencies.forEach(dep => {
      adjacencyList.get(dep.fromTaskId)?.push(dep.toTaskId);
      inDegree.set(dep.toTaskId, (inDegree.get(dep.toTaskId) || 0) + 1);
    });
  });

  // Kahn 算法
  const queue: number[] = [];
  inDegree.forEach((degree, taskId) => {
    if (degree === 0) {
      queue.push(taskId);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const neighbors = adjacencyList.get(current) || [];
    neighbors.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result;
}

/**
 * 计算关键路径（最长路径）
 */
export function calculateCriticalPath(tasks: TaskWithDependencies[]): {
  path: number[];
  duration: number;
} {
  // 简化版本：假设每个任务耗时为 1
  const distances = new Map<number, number>();
  const predecessors = new Map<number, number>();

  // 初始化距离
  tasks.forEach(task => {
    distances.set(task.id, 0);
  });

  // 按拓扑顺序更新距离
  const sorted = topologicalSort(tasks);

  sorted.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.dependencies.forEach(dep => {
      const newDistance = (distances.get(dep.fromTaskId) || 0) + 1;
      if (newDistance > (distances.get(taskId) || 0)) {
        distances.set(taskId, newDistance);
        predecessors.set(taskId, dep.fromTaskId);
      }
    });
  });

  // 找到最长路径
  const maxDistance = Math.max(...Array.from(distances.values()));
  const endTask = Array.from(distances.entries()).find(([_, dist]) => dist === maxDistance);

  if (!endTask) {
    return { path: [], duration: 0 };
  }

  // 回溯路径
  const path: number[] = [];
  let current: number | undefined = endTask[0];
  while (current !== undefined) {
    path.unshift(current);
    current = predecessors.get(current);
  }

  return {
    path,
    duration: maxDistance,
  };
}

/**
 * 获取任务层级（距离起点的最短距离）
 */
export function getTaskLevels(tasks: TaskWithDependencies[]): Map<number, number> {
  const levels = new Map<number, number>();

  // 初始化所有任务为 0 级
  tasks.forEach(task => levels.set(task.id, 0));

  // 计算每个任务的层级
  const sorted = topologicalSort(tasks);

  sorted.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.dependencies.length > 0) {
      const maxDepLevel = Math.max(
        ...task.dependencies.map(dep => levels.get(dep.toTaskId) || 0)
      );
      levels.set(taskId, maxDepLevel + 1);
    }
  });

  return levels;
}

/**
 * 添加依赖关系
 */
export function addDependency(
  tasks: TaskWithDependencies[],
  fromTaskId: number,
  toTaskId: number,
  type: TaskDependency['type'] = 'sequential',
  description?: string
): TaskWithDependencies[] {
  return tasks.map(task => {
    if (task.id === fromTaskId) {
      return {
        ...task,
        dependencies: [
          ...task.dependencies,
          {
            id: `dep-${Date.now()}`,
            fromTaskId,
            toTaskId,
            type,
            description,
          },
        ],
      };
    }
    return task;
  });
}

/**
 * 移除依赖关系
 */
export function removeDependency(
  tasks: TaskWithDependencies[],
  dependencyId: string
): TaskWithDependencies[] {
  return tasks.map(task => ({
    ...task,
    dependencies: task.dependencies.filter(dep => dep.id !== dependencyId),
  }));
}

/**
 * 检查是否可以添加依赖
 */
export function canAddDependency(
  tasks: TaskWithDependencies[],
  fromTaskId: number,
  toTaskId: number
): {
  canAdd: boolean;
  reason?: string;
} {
  // 不能依赖自己
  if (fromTaskId === toTaskId) {
    return { canAdd: false, reason: '任务不能依赖自己' };
  }

  // 检查任务是否存在
  const fromTask = tasks.find(t => t.id === fromTaskId);
  const toTask = tasks.find(t => t.id === toTaskId);

  if (!fromTask) {
    return { canAdd: false, reason: '源任务不存在' };
  }

  if (!toTask) {
    return { canAdd: false, reason: '目标任务不存在' };
  }

  // 检查是否已经存在该依赖
  const exists = fromTask.dependencies.some(dep => dep.toTaskId === toTaskId);
  if (exists) {
    return { canAdd: false, reason: '该依赖关系已存在' };
  }

  // 临时添加依赖，检查是否会产生循环
  const tempTasks = addDependency(tasks, fromTaskId, toTaskId, 'sequential');
  const validation = validateDependencies(tempTasks);

  if (!validation.isValid) {
    return { canAdd: false, reason: '添加此依赖会产生循环依赖' };
  }

  return { canAdd: true };
}

/**
 * 导出依赖关系为 JSON
 */
export function exportDependencies(tasks: TaskWithDependencies[]): string {
  return JSON.stringify(
    {
      tasks: tasks.map(task => ({
        id: task.id,
        text: task.text,
        status: task.status,
      })),
      dependencies: tasks.flatMap(task => task.dependencies),
    },
    null,
    2
  );
}

/**
 * 从 JSON 导入依赖关系
 */
export function importDependencies(
  jsonString: string,
  baseTasks: { id: number; text: string }[]
): TaskWithDependencies[] {
  try {
    const data = JSON.parse(jsonString);

    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('无效的格式');
    }

    const tasks: TaskWithDependencies[] = data.tasks.map((task: any) => ({
      ...task,
      dependencies: [],
      dependents: [],
    }));

    // 添加依赖关系
    if (data.dependencies && Array.isArray(data.dependencies)) {
      data.dependencies.forEach((dep: any) => {
        const task = tasks.find(t => t.id === dep.fromTaskId);
        if (task) {
          task.dependencies.push(dep);
        }
      });
    }

    return tasks;
  } catch (error) {
    console.error('导入依赖关系失败:', error);
    throw new Error('导入失败：无效的格式');
  }
}
