'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DiscussionHistoryViewer } from '@/components/discussion/DiscussionHistoryViewer';
import { CodeResultViewer } from '@/components/code/CodeResultViewer';
import { PaperViewer } from '@/components/paper/PaperViewer';
import { CostMonitor } from '@/components/cost/CostMonitor';
import { CostAlertManager } from '@/components/cost/CostAlertManager';
import { Toaster } from '@/components/ui/toaster';
import {
  Loader2,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  Code,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Shield,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AutoModelingPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new-task');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // 新任务表单
  const [formData, setFormData] = useState({
    competitionType: '',
    problemType: '',
    problemTitle: '',
    problemContent: '',
    paperFormat: 'MCM',
    paperLanguage: 'ENGLISH',
  });

  // 任务状态
  const [taskStatus, setTaskStatus] = useState<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartAutoProcess = async () => {
    if (!formData.competitionType || !formData.problemType || !formData.problemTitle || !formData.problemContent) {
      toast.error('请填写完整的赛题信息');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auto-modeling/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setActiveTab('task-status');
        // 开始轮询任务状态
        if (data.taskId) {
          setCurrentTaskId(data.taskId);
          startPolling(data.taskId);
        }
      } else {
        toast.error(data.error || '启动失败');
      }
    } catch (error) {
      console.error('启动自动化流程失败:', error);
      toast.error('启动失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (taskId: string) => {
    // 清除之前的轮询
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // 立即查询一次
    fetchTaskStatus(taskId);

    // 每2秒轮询一次
    pollIntervalRef.current = setInterval(() => {
      fetchTaskStatus(taskId);
    }, 2000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchTaskStatus = async (taskId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/auto-modeling/${taskId}/status`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setTaskStatus(data.data);

        // 如果任务完成或失败，停止轮询
        if (['COMPLETED', 'FAILED'].includes(data.data.overallStatus)) {
          stopPolling();
        }
      }
    } catch (error) {
      console.error('查询任务状态失败:', error);
    }
  };

  // 组件卸载时停止轮询
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // 组件加载时获取最新的运行中任务
  useEffect(() => {
    const fetchLatestTask = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/auto-modeling/latest', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const data = await response.json();
        if (data.success && data.data && data.data.id) {
          const latestTask = data.data;
          // 只有当任务未完成时才自动加载
          if (['PENDING', 'DISCUSSING', 'CODING', 'VALIDATING', 'RETRYING', 'PAPER_GENERATING'].includes(latestTask.overallStatus)) {
            setCurrentTaskId(latestTask.id);
            startPolling(latestTask.id);
            console.log(`已加载最新的运行中任务: ${latestTask.id}`);
          }
        }
      } catch (error) {
        console.error('获取最新任务失败:', error);
      }
    };

    fetchLatestTask();
  }, []);

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'DISCUSSING':
        return <MessageSquare className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'CODING':
        return <Code className="h-5 w-5 text-purple-500 animate-pulse" />;
      case 'VALIDATING':
        return <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />;
      case 'RETRYING':
        return <AlertTriangle className="h-5 w-5 text-orange-500 animate-pulse" />;
      case 'PAPER_GENERATING':
        return <FileText className="h-5 w-5 text-cyan-500 animate-pulse" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getOverallStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '待开始',
      DISCUSSING: '群聊讨论中',
      CODING: '代码生成中',
      VALIDATING: '自动校验中',
      RETRYING: '回溯优化中',
      PAPER_GENERATING: '论文生成中',
      COMPLETED: '已完成',
      FAILED: '失败',
    };
    return statusMap[status] || status;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              全自动化数学建模系统
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              从群聊讨论到论文生成，全程无需人工干预
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="new-task">
                <Rocket className="w-4 h-4 mr-2" />
                新建任务
              </TabsTrigger>
              <TabsTrigger value="task-status">
                <Clock className="w-4 h-4 mr-2" />
                任务状态
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-task" className="mt-6">
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    创建全自动化建模任务
                  </CardTitle>
                  <CardDescription>
                    输入赛题信息，系统将自动完成讨论、代码生成、校验、论文生成全流程
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="competitionType">竞赛类型 *</Label>
                      <Select
                        value={formData.competitionType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, competitionType: value })
                        }
                      >
                        <SelectTrigger id="competitionType">
                          <SelectValue placeholder="选择竞赛类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MCM">美赛（MCM）</SelectItem>
                          <SelectItem value="ICM">美赛（ICM）</SelectItem>
                          <SelectItem value="CUMCM">国赛（CUMCM）</SelectItem>
                          <SelectItem value="SHENZHEN_CUP">深圳杯</SelectItem>
                          <SelectItem value="IMMC">IMMC</SelectItem>
                          <SelectItem value="MATHORCUP">MathorCup</SelectItem>
                          <SelectItem value="EMMC">EMMC</SelectItem>
                          <SelectItem value="TEDDY_CUP">泰迪杯</SelectItem>
                          <SelectItem value="BLUE_BRIDGE_MATH">蓝桥杯数学</SelectItem>
                          <SelectItem value="REGIONAL">区域性竞赛</SelectItem>
                          <SelectItem value="OTHER">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="problemType">题目类型 *</Label>
                      <Select
                        value={formData.problemType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, problemType: value })
                        }
                      >
                        <SelectTrigger id="problemType">
                          <SelectValue placeholder="选择题目类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EVALUATION">评价题</SelectItem>
                          <SelectItem value="PREDICTION">预测题</SelectItem>
                          <SelectItem value="OPTIMIZATION">优化题</SelectItem>
                          <SelectItem value="CLASSIFICATION">分类题</SelectItem>
                          <SelectItem value="REGRESSION">回归题</SelectItem>
                          <SelectItem value="CLUSTERING">聚类题</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemTitle">题目标题 *</Label>
                    <Input
                      id="problemTitle"
                      placeholder="输入题目标题"
                      value={formData.problemTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, problemTitle: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemContent">题目内容 *</Label>
                    <Textarea
                      id="problemContent"
                      placeholder="粘贴完整的题目内容..."
                      value={formData.problemContent}
                      onChange={(e) =>
                        setFormData({ ...formData, problemContent: e.target.value })
                      }
                      rows={10}
                    />
                    <p className="text-sm text-slate-500">
                      提示：请粘贴完整的题目内容，包括背景、要求、数据等信息
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paperFormat">论文格式</Label>
                      <Select
                        value={formData.paperFormat}
                        onValueChange={(value) =>
                          setFormData({ ...formData, paperFormat: value })
                        }
                      >
                        <SelectTrigger id="paperFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MCM">美赛格式</SelectItem>
                          <SelectItem value="CUMCM">国赛格式</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paperLanguage">论文语言</Label>
                      <Select
                        value={formData.paperLanguage}
                        onValueChange={(value) =>
                          setFormData({ ...formData, paperLanguage: value })
                        }
                      >
                        <SelectTrigger id="paperLanguage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENGLISH">英文</SelectItem>
                          <SelectItem value="CHINESE">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      全自动化流程将依次执行：群聊讨论（1-2轮）→ 代码生成 → 自动校验（带回溯，最多3次）→ 论文生成。
                      整个过程无需人工干预，预计耗时 5-15 分钟。
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData({
                          competitionType: '',
                          problemType: '',
                          problemTitle: '',
                          problemContent: '',
                          paperFormat: 'MCM',
                          paperLanguage: 'ENGLISH',
                        })
                      }
                    >
                      重置
                    </Button>
                    <Button
                      onClick={handleStartAutoProcess}
                      disabled={loading}
                      className="min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          启动中...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          一键启动全自动化
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="task-status" className="mt-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* 成本监控面板 */}
                <Tabs defaultValue="monitor">
                  <TabsList>
                    <TabsTrigger value="monitor" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      成本监控
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="gap-2">
                      <Bell className="w-4 h-4" />
                      成本预警
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="monitor" className="mt-4">
                    <CostMonitor taskId={currentTaskId || undefined} />
                  </TabsContent>

                  <TabsContent value="alerts" className="mt-4">
                    <CostAlertManager taskId={currentTaskId || undefined} />
                  </TabsContent>
                </Tabs>

                {/* 任务流程状态 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      自动化任务执行状态
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-4">
                        {currentTaskId ? (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {taskStatus ? getOverallStatusIcon(taskStatus.overallStatus) : <Clock className="w-5 h-5 text-yellow-500" />}
                                <div>
                                  <p className="font-medium">
                                    {taskStatus ? getOverallStatusText(taskStatus.overallStatus) : '执行中...'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    任务 ID: {currentTaskId}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/dashboard/auto-modeling/${currentTaskId}`}
                              >
                                查看详情
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={taskStatus?.progress || 0} className="flex-1" />
                              <span className="text-sm font-medium min-w-[50px]">{taskStatus?.progress || 0}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>暂无运行中的任务</p>
                            <p className="text-sm mt-2">在"新建任务"标签页创建任务后，此处将显示执行状态</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* 群聊讨论可视化 */}
                {currentTaskId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        群聊讨论实时展示
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {taskStatus?.discussionId ? (
                        <DiscussionHistoryViewer discussionId={taskStatus.discussionId} />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <Clock className="w-12 h-12 mb-4" />
                          <p>暂无讨论消息</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 代码执行结果 */}
                {currentTaskId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-purple-500" />
                        代码执行结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CodeResultViewer
                        code={`import numpy as np
import matplotlib.pyplot as plt

# 示例代码：数据可视化
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y, label='sin(x)', linewidth=2)
plt.xlabel('x')
plt.ylabel('y')
plt.title('Sinusoidal Function')
plt.legend()
plt.grid(True)
plt.show()

print(f"Generated {len(x)} data points")
print(f"Max value: {y.max():.4f}")
print(f"Min value: {y.min():.4f}")`}
                        language="python"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* 论文预览和编辑 */}
                {currentTaskId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-500" />
                        论文预览与编辑
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PaperViewer
                        paperId={currentTaskId}
                        initialContent={`# Mathematical Modeling Competition Paper

## Abstract

This paper presents a comprehensive mathematical model to address the given problem. Through rigorous analysis and innovative approaches, we develop a solution that...

## 1. Introduction

### 1.1 Problem Background

The problem we are addressing involves...

### 1.2 Problem Statement

Our objective is to...

## 2. Model Development

### 2.1 Assumptions

To simplify the problem, we make the following assumptions:

1. ...
2. ...
3. ...

### 2.2 Notation

We define the following notation:

- $x$: ...
- $y$: ...

### 2.3 Mathematical Model

The core of our model is based on...

## 3. Solution Methodology

### 3.1 Algorithm Design

We propose the following algorithm...

### 3.2 Implementation

Our implementation uses...

## 4. Results and Analysis

### 4.1 Numerical Results

The results show that...

### 4.2 Sensitivity Analysis

We performed sensitivity analysis to...

## 5. Conclusion

In this paper, we...

## References

1. ...
2. ...`}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
              <Toaster />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
