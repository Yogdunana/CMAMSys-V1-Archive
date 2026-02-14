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
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { toast } from 'sonner';

interface TaskIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  fixType: string;
}

export function TaskStatusFixPage() {
  const [taskId, setTaskId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [issues, setIssues] = useState<TaskIssue[]>([]);
  const [taskData, setTaskData] = useState<any>(null);

  const checkTaskStatus = async () => {
    if (!taskId) {
      toast.error('请输入任务 ID');
      return;
    }

    setIsLoading(true);
    setIssues([]);
    setTaskData(null);

    try {
      const response = await fetchWithAuth(
        `/api/debug/debug-code-generation?taskId=${taskId}`
      );

      if (!response.success) {
        toast.error(response.error || '检查失败');
        return;
      }

      const data = response.data;
      setTaskData(data);

      // 分析问题
      const foundIssues: TaskIssue[] = [];

      const task = data.task;
      const codeGens = data.codeGenerations;

      // 问题 1: 任务状态为 CODING，但没有代码生成记录
      if (task.overallStatus === 'CODING' && codeGens.allCount === 0) {
        foundIssues.push({
          type: 'error',
          message: '任务状态为 CODING，但没有代码生成记录',
          suggestion: '建议重置到讨论阶段或编码阶段',
          fixType: 'reset-to-discussion',
        });
      }

      // 问题 2: 验证状态为 PASSED，但没有验证记录
      if (task.validationStatus === 'PASSED' && data.validations.count === 0) {
        foundIssues.push({
          type: 'error',
          message: '验证状态为 PASSED，但没有验证记录',
          suggestion: '建议重置验证状态',
          fixType: 'sync-to-actual',
        });
      }

      // 问题 3: codeGenerationId 不为空，但没有对应的代码生成记录
      if (task.codeGenerationId && codeGens.allCount === 0) {
        foundIssues.push({
          type: 'error',
          message: 'codeGenerationId 不为空，但没有对应的代码生成记录',
          suggestion: '建议清除无效的 codeGenerationId',
          fixType: 'sync-to-actual',
        });
      }

      // 问题 4: 讨论状态为 COMPLETED，但没有讨论记录
      if (
        task.discussionStatus === 'COMPLETED' &&
        !taskData.discussion
      ) {
        foundIssues.push({
          type: 'warning',
          message: '讨论状态为 COMPLETED，但没有讨论记录',
          suggestion: '建议重置讨论状态',
          fixType: 'sync-to-actual',
        });
      }

      if (foundIssues.length === 0) {
        foundIssues.push({
          type: 'info',
          message: '任务状态正常',
          suggestion: '无需修复',
          fixType: 'none',
        });
      }

      setIssues(foundIssues);
    } catch (error) {
      console.error('检查失败:', error);
      toast.error('检查失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fixIssue = async (fixType: string) => {
    if (!taskId) {
      toast.error('请输入任务 ID');
      return;
    }

    if (!confirm('确定要修复任务状态吗？此操作不可撤销。')) {
      return;
    }

    setIsFixing(true);

    try {
      const response = await fetchWithAuth('/api/debug/fix-task-status', {
        method: 'POST',
        body: JSON.stringify({
          taskId,
          fixType,
        }),
      });

      if (response.success) {
        toast.success(response.message || '修复成功');
        // 重新检查
        checkTaskStatus();
      } else {
        toast.error(response.error || '修复失败');
      }
    } catch (error) {
      console.error('修复失败:', error);
      toast.error('修复失败');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">任务状态修复工具</h1>
        <p className="text-muted-foreground">
          检测和修复任务状态不一致的问题
        </p>
      </div>

      <div className="space-y-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>检查任务状态</CardTitle>
            <CardDescription>输入任务 ID 检查是否有状态不一致的问题</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="taskId">任务 ID</Label>
                <Input
                  id="taskId"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  placeholder="输入任务 ID"
                  disabled={isLoading || isFixing}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={checkTaskStatus}
                  disabled={isLoading || !taskId}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wrench className="mr-2 h-4 w-4" />
                  )}
                  检查
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 任务数据 */}
        {taskData && (
          <Card>
            <CardHeader>
              <CardTitle>当前任务状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>任务 ID</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.task.id}
                  </p>
                </div>
                <div>
                  <Label>题目</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.task.problemTitle}
                  </p>
                </div>
                <div>
                  <Label>整体状态</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.task.overallStatus}
                  </p>
                </div>
                <div>
                  <Label>进度</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.task.progress}%
                  </p>
                </div>
                <div>
                  <Label>讨论状态</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.task.discussionStatus}
                  </p>
                </div>
                <div>
                  <Label>验证状态</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.task.validationStatus}
                  </p>
                </div>
                <div>
                  <Label>代码生成记录数</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.codeGenerations.allCount}
                  </p>
                </div>
                <div>
                  <Label>验证记录数</Label>
                  <p className="font-mono bg-muted p-2 rounded mt-1">
                    {taskData.validations.count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 问题列表 */}
        {issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>检测到的问题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <Alert
                    key={index}
                    variant={issue.type === 'error' ? 'destructive' : 'default'}
                  >
                    {issue.type === 'error' && (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {issue.type === 'warning' && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {issue.type === 'info' && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{issue.message}</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <p className="mb-2">{issue.suggestion}</p>
                        {issue.fixType !== 'none' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fixIssue(issue.fixType)}
                            disabled={isFixing}
                          >
                            {isFixing ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            修复
                          </Button>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>修复类型说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>sync-to-actual：</strong> 根据实际记录同步状态（保守修复）
            </p>
            <p>
              <strong>reset-to-discussion：</strong> 重置到讨论阶段（删除所有代码和验证记录）
            </p>
            <p>
              <strong>reset-to-coding：</strong> 重置到编码阶段（保留讨论，删除代码和验证）
            </p>
            <p>
              <strong>reset-to-validation：</strong> 重置到验证阶段（保留代码，删除验证）
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
