'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Play,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { toast } from 'sonner';

interface TaskInfo {
  id: string;
  taskId: string;
  problemTitle: string;
  overallStatus: string;
  progress: number;
  isStuck: boolean;
  stuckReason: string | null;
  lastValidationStatus: string | null;
  minutesSinceUpdate: number;
}

export function TaskMonitorPage() {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/debug/tasks-status');
      if (response.success) {
        setTasks(response.data.tasks);
      } else {
        toast.error(response.error || '加载任务失败');
      }
    } catch (error) {
      console.error('加载任务失败:', error);
      toast.error('加载任务失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetStatus = async () => {
    if (!selectedTaskId || !newStatus) {
      toast.error('请选择任务和新状态');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/debug/reset-task-status', {
        method: 'POST',
        body: JSON.stringify({
          taskId: selectedTaskId,
          newStatus,
        }),
      });

      if (response.success) {
        toast.success(response.message);
        loadTasks();
      } else {
        toast.error(response.error || '重置失败');
      }
    } catch (error) {
      console.error('重置失败:', error);
      toast.error('重置失败');
    }
  };

  const handleForceRegenerate = async () => {
    if (!selectedTaskId) {
      toast.error('请选择任务');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/debug/force-regenerate-code', {
        method: 'POST',
        body: JSON.stringify({ taskId: selectedTaskId }),
      });

      if (response.success) {
        toast.success(response.message);
        loadTasks();
      } else {
        toast.error(response.error || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('操作失败');
    }
  };

  const handleClearTokens = async () => {
    if (!confirm('确定要清除所有 token 并重新登录吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/debug/force-clear-all-tokens', {
        method: 'POST',
      });

      if (response.success) {
        toast.success('Token 已清除，请重新登录');

        // 清除本地存储
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // 重定向到登录页
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1000);
      } else {
        toast.error(response.error || '清除失败');
      }
    } catch (error) {
      console.error('清除失败:', error);
      toast.error('清除失败');
    }
  };

  const stuckTasks = tasks.filter((t) => t.isStuck);
  const activeTasks = tasks.filter(
    (t) => t.overallStatus !== 'COMPLETED' && t.overallStatus !== 'FAILED'
  );

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">任务监控面板</h1>
        <p className="text-muted-foreground">
          实时监控和管理自动化建模任务
        </p>
      </div>

      <div className="space-y-6">
        {/* 操作区域 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>管理和重置任务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={loadTasks} disabled={isLoading} variant="outline">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  刷新任务列表
                </Button>
                <Button onClick={handleClearTokens} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  清除 Token（重新登录）
                </Button>
              </div>

              <div className="border-t pt-4">
                <Label>选择任务</Label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">请选择任务</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.taskId} - {task.problemTitle} ({task.overallStatus})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTaskId && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>重置状态</Label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">选择新状态</option>
                      <option value="READY">准备中</option>
                      <option value="DISCUSSING">讨论中</option>
                      <option value="CODING">编码中</option>
                      <option value="VALIDATING">验证中</option>
                      <option value="PAPER">论文生成中</option>
                      <option value="COMPLETED">已完成</option>
                      <option value="FAILED">失败</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={handleResetStatus}
                      disabled={!newStatus}
                      variant="outline"
                      className="flex-1"
                    >
                      重置状态
                    </Button>
                    <Button
                      onClick={handleForceRegenerate}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      强制重新生成
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        {stuckTasks.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>检测到 {stuckTasks.length} 个卡住的任务</AlertTitle>
            <AlertDescription>
              {stuckTasks.map((task) => (
                <div key={task.id} className="mt-1">
                  {task.taskId}: {task.stuckReason}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">活跃任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">卡住的任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stuckTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* 任务列表 */}
        <Card>
          <CardHeader>
            <CardTitle>任务列表</CardTitle>
            <CardDescription>
              共 {tasks.length} 个任务，{stuckTasks.length} 个卡住
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-md ${
                    task.isStuck ? 'border-destructive bg-destructive/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{task.taskId}</span>
                        {task.isStuck && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {task.problemTitle}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        状态: {task.overallStatus} | 进度: {task.progress}% |{' '}
                        {task.minutesSinceUpdate.toFixed(1)} 分钟前更新
                      </div>
                      {task.isStuck && (
                        <div className="text-xs text-destructive mt-1">
                          {task.stuckReason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.overallStatus === 'COMPLETED' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : task.overallStatus === 'FAILED' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
