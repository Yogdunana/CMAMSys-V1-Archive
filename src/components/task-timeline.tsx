'use client';

import { TaskWithDependencies, getTaskLevels, getExecutableTasks, getBlockedTasks } from '@/services/task-dependencies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, Lock, ArrowRight, Play } from 'lucide-react';

interface TaskTimelineProps {
  tasks: TaskWithDependencies[];
  onTaskClick?: (taskId: number) => void;
}

export function TaskTimeline({ tasks, onTaskClick }: TaskTimelineProps) {
  // 获取任务层级
  const levels = getTaskLevels(tasks);

  // 获取可执行和阻塞的任务
  const executableTaskIds = getExecutableTasks(tasks);
  const blockedTasks = getBlockedTasks(tasks);

  // 按层级分组任务
  const tasksByLevel = new Map<number, TaskWithDependencies[]>();
  let maxLevel = 0;

  tasks.forEach(task => {
    const level = levels.get(task.id) || 0;
    if (!tasksByLevel.has(level)) {
      tasksByLevel.set(level, []);
    }
    tasksByLevel.get(level)!.push(task);
    maxLevel = Math.max(maxLevel, level);
  });

  const getStatusIcon = (task: TaskWithDependencies) => {
    if (task.status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }

    if (task.status === 'in-progress') {
      return <Play className="h-5 w-5 text-blue-600" />;
    }

    // pending 状态
    const isExecutable = executableTaskIds.includes(task.id);
    if (isExecutable) {
      return <Circle className="h-5 w-5 text-gray-400" />;
    }

    // 被阻塞
    return <Lock className="h-5 w-5 text-orange-600" />;
  };

  const getStatusColor = (task: TaskWithDependencies) => {
    if (task.status === 'completed') return 'bg-green-50 border-green-200';
    if (task.status === 'in-progress') return 'bg-blue-50 border-blue-200';
    if (executableTaskIds.includes(task.id)) return 'bg-gray-50 border-gray-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getTaskCount = (level: number) => {
    return tasksByLevel.get(level)?.length || 0;
  };

  const getCompletedCount = (level: number) => {
    return tasksByLevel.get(level)?.filter(t => t.status === 'completed').length || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          任务时间线
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {/* 层级视图 */}
            {Array.from({ length: maxLevel + 1 }).map((_, level) => {
              const levelTasks = tasksByLevel.get(level) || [];
              if (levelTasks.length === 0) return null;

              return (
                <div key={level} className="relative">
                  {/* 层级标签 */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                      阶段 {level + 1}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getCompletedCount(level)}/{getTaskCount(level)} 已完成
                    </span>
                  </div>

                  {/* 连接线 */}
                  {level < maxLevel && (
                    <div className="absolute left-4 top-12 w-px h-8 bg-gray-200" />
                  )}

                  {/* 任务列表 */}
                  <div className="space-y-2">
                    {levelTasks.map(task => {
                      const isBlocked = blockedTasks.some(bt => bt.taskId === task.id);
                      const blockedBy = blockedTasks.find(bt => bt.taskId === task.id)?.blockedBy || [];

                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick?.(task.id)}
                          className={`relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getStatusColor(task)}`}
                        >
                          <div className="flex items-start gap-3">
                            {/* 状态图标 */}
                            <div className="flex-shrink-0 mt-0.5">
                              {getStatusIcon(task)}
                            </div>

                            {/* 任务内容 */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                任务 {task.id}: {task.text}
                              </div>

                              {/* 依赖信息 */}
                              {task.dependencies.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <ArrowRight className="h-3 w-3" />
                                    <span>依赖任务: {task.dependencies.map(d => d.toTaskId).join(', ')}</span>
                                  </div>
                                </div>
                              )}

                              {/* 阻塞信息 */}
                              {isBlocked && blockedBy.length > 0 && (
                                <div className="mt-2 text-xs text-orange-700">
                                  <div className="flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    <span>等待任务完成: {blockedBy.join(', ')}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 状态标签 */}
                            <Badge
                              variant={
                                task.status === 'completed'
                                  ? 'default'
                                  : task.status === 'in-progress'
                                  ? 'secondary'
                                  : executableTaskIds.includes(task.id)
                                  ? 'outline'
                                  : 'destructive'
                              }
                              className="flex-shrink-0"
                            >
                              {task.status === 'completed' && '已完成'}
                              {task.status === 'in-progress' && '进行中'}
                              {task.status === 'pending' &&
                                (executableTaskIds.includes(task.id) ? '待开始' : '已阻塞')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
