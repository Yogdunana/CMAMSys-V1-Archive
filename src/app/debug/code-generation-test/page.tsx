'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  taskId: string;
  discussionId: string;
  language: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
  codeGenerationId?: string;
  codeLength?: number;
}

export function CodeGenerationTestPage() {
  const [taskId, setTaskId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTest = async () => {
    if (!taskId) {
      toast.error('请输入任务 ID');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 检查任务状态
      const statusResponse = await fetchWithAuth('/api/debug/test-code-generation', {
        method: 'POST',
        body: JSON.stringify({ taskId }),
      });

      if (!statusResponse.success) {
        toast.error(statusResponse.error || '检查任务状态失败');
        return;
      }

      const statusData = statusResponse.data;

      // 显示任务状态
      setTestResult({
        success: true,
        taskId,
        discussionId: statusData.taskId,
        language: 'PYTHON',
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        codeGenerationId: statusData.codeGenerationId,
      });

      toast.success('任务状态检查完成');
    } catch (error) {
      console.error('测试失败:', error);
      toast.error('测试失败');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCheckStuck = async () => {
    if (!taskId) {
      toast.error('请输入任务 ID');
      return;
    }

    setIsTesting(true);

    try {
      const response = await fetchWithAuth('/api/debug/test-code-generation', {
        method: 'POST',
        body: JSON.stringify({ taskId }),
      });

      if (response.success) {
        const stuckCheck = response.data.stuckCheck;

        if (stuckCheck.isStuck) {
          toast.error(`任务卡住: ${stuckCheck.reason}`);
        } else {
          toast.success('任务状态正常');
        }

        setTestResult({
          success: !stuckCheck.isStuck,
          taskId,
          discussionId: taskId,
          language: 'PYTHON',
          startTime: Date.now(),
          endTime: Date.now(),
          duration: 0,
          error: stuckCheck.isStuck ? stuckCheck.reason : undefined,
        });
      } else {
        toast.error(response.error || '检查失败');
      }
    } catch (error) {
      console.error('检查失败:', error);
      toast.error('检查失败');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunCodeGeneration = async () => {
    if (!taskId) {
      toast.error('请输入任务 ID');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetchWithAuth(`/api/auto-modeling/${taskId}/regenerate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'PYTHON',
        }),
      });

      if (response.success) {
        toast.success('代码生成已开始，请在任务详情页查看进度');
        setTestResult({
          success: true,
          taskId,
          discussionId: taskId,
          language: 'PYTHON',
          startTime: Date.now(),
        });
      } else {
        toast.error(response.error || '代码生成启动失败');
        setTestResult({
          success: false,
          taskId,
          discussionId: taskId,
          language: 'PYTHON',
          startTime: Date.now(),
          endTime: Date.now(),
          error: response.error,
        });
      }
    } catch (error) {
      console.error('代码生成失败:', error);
      toast.error('代码生成失败');
      setTestResult({
        success: false,
        taskId,
        discussionId: taskId,
        language: 'PYTHON',
        startTime: Date.now(),
        endTime: Date.now(),
        error: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">代码生成测试工具</h1>
        <p className="text-muted-foreground">
          用于测试和验证代码生成流程的诊断工具
        </p>
      </div>

      <div className="space-y-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>测试配置</CardTitle>
            <CardDescription>输入任务 ID 进行测试</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="taskId">任务 ID</Label>
                <Input
                  id="taskId"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  placeholder="输入自动化建模任务的 ID"
                  disabled={isTesting}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleTest}
                  disabled={isTesting || !taskId}
                  variant="outline"
                >
                  {isTesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="mr-2 h-4 w-4" />
                  )}
                  检查状态
                </Button>
                <Button
                  onClick={handleCheckStuck}
                  disabled={isTesting || !taskId}
                  variant="outline"
                >
                  {isTesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertCircle className="mr-2 h-4 w-4" />
                  )}
                  检查是否卡住
                </Button>
                <Button
                  onClick={handleRunCodeGeneration}
                  disabled={isTesting || !taskId}
                >
                  {isTesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  运行代码生成
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 结果显示 */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>任务 ID</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {testResult.taskId}
                  </p>
                </div>
                <div>
                  <Label>状态</Label>
                  <div className="mt-1">
                    {testResult.success ? (
                      <Alert variant="default" className="border-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          {testResult.duration !== undefined
                            ? `成功，耗时 ${(testResult.duration / 1000).toFixed(2)} 秒`
                            : '成功'}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {testResult.error || '测试失败'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                {testResult.codeGenerationId && (
                  <div>
                    <Label>代码生成 ID</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                      {testResult.codeGenerationId}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>检查状态：</strong>查看任务的当前状态和代码生成进度
            </p>
            <p>
              <strong>检查是否卡住：</strong>检测任务是否在中间状态停留过长时间（超过 5 分钟）
            </p>
            <p>
              <strong>运行代码生成：</strong>手动触发代码生成流程，异步执行，立即返回
            </p>
            <p className="text-yellow-600">
              <strong>注意：</strong>代码生成是异步执行的，请到任务详情页查看实时进度
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
