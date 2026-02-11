'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscussionHistoryViewer } from '@/components/discussion/DiscussionHistoryViewer';
import { OptimizationVisualizer } from '@/components/optimization/OptimizationVisualizer';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Code2,
  ListTodo,
  Play,
  RefreshCw,
  ChevronRight,
  Terminal,
  ArrowLeft,
  Clock,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface CodeGeneration {
  id: string;
  codeLanguage: string;
  codeContent: string;
  description: string;
  executionStatus: string;
  qualityScore: number | null;
  createdAt: string;
}

interface TodoItem {
  id: number;
  text: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

interface TaskStatus {
  id: string;
  problemTitle: string;
  overallStatus: string;
  discussionStatus: string;
  progress: number;
  discussionId: string | null;
  discussion?: {
    id: string;
    messages: any[];
  };
}

export default function AutoModelingTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [codeGeneration, setCodeGeneration] = useState<CodeGeneration | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 加载任务状态
  useEffect(() => {
    loadTaskStatus();
    
    // 开始状态轮询（每 2 秒）
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, [taskId]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const loadTaskStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/auto-modeling/${taskId}/status`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        setTaskStatus(data.data);

        // 如果任务有代码生成，加载代码
        if (data.data.codeGeneration) {
          setCodeGeneration(data.data.codeGeneration);
        }

        // 加载 TODO 列表（基于任务状态和进度）
        loadTodos(data.data);

        // 如果任务已完成或失败，停止轮询
        if (
          data.data.overallStatus === 'COMPLETED' ||
          data.data.overallStatus === 'FAILED'
        ) {
          stopPolling();
        }
      }
    } catch (error) {
      console.error('加载任务状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // 清除之前的轮询
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // 每 2 秒轮询一次
    pollingRef.current = setInterval(() => {
      fetchTaskStatus();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // 获取任务状态（不带加载状态更新，用于轮询）
  const fetchTaskStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/auto-modeling/${taskId}/status`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        const newTaskStatus = data.data;
        setTaskStatus(newTaskStatus);

        // 如果任务有代码生成，加载代码
        if (newTaskStatus.codeGeneration && !codeGeneration) {
          setCodeGeneration(newTaskStatus.codeGeneration);
        }

        // 更新 TODO 列表
        loadTodos(newTaskStatus);

        // 如果任务已完成或失败，停止轮询
        if (
          newTaskStatus.overallStatus === 'COMPLETED' ||
          newTaskStatus.overallStatus === 'FAILED'
        ) {
          stopPolling();
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error);
    }
  };

  const loadCodeGeneration = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/code-generation/task/${taskId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setCodeGeneration(data.data);
      }
    } catch (error) {
      console.error('加载代码生成失败:', error);
    }
  };

  const loadTodos = (currentTaskStatus?: TaskStatus) => {
    const statusToUse = currentTaskStatus || taskStatus;
    if (!statusToUse) return;

    const progress = statusToUse.progress || 0;
    const status = statusToUse.overallStatus;

    // 基础 TODO 列表
    const baseTodos: TodoItem[] = [
      { id: 1, text: '分析讨论记录，提取核心算法', status: 'pending', estimatedTime: '30s' },
      { id: 2, text: '设计数据结构（Region, Station）', status: 'pending', estimatedTime: '20s' },
      { id: 3, text: '实现遗传算法（GeneticAlgorithm）', status: 'pending', estimatedTime: '60s' },
      { id: 4, text: '实现蚁群算法（AntColonyOptimization）', status: 'pending', estimatedTime: '50s' },
      { id: 5, text: '实现混合优化器（HybridOptimizer）', status: 'pending', estimatedTime: '30s' },
      { id: 6, text: '编写测试用例和验证代码', status: 'pending', estimatedTime: '40s' },
      { id: 7, text: '生成可视化报告', status: 'pending', estimatedTime: '30s' },
    ];

    // 根据进度和状态更新 TODO 状态
    let completedCount = 0;
    let currentTaskIndex = 0;

    if (status === 'COMPLETED' || status === 'PAPER_GENERATING') {
      // 所有任务已完成
      completedCount = 7;
      currentTaskIndex = 7;
    } else if (status === 'VALIDATING' || status === 'RETRYING') {
      // 代码生成完成，正在校验
      completedCount = 5;
      currentTaskIndex = 5;
    } else if (status === 'CODING') {
      // 正在生成代码，根据进度判断
      if (progress >= 60) {
        completedCount = 5;
        currentTaskIndex = 5;
      } else if (progress >= 50) {
        completedCount = 4;
        currentTaskIndex = 4;
      } else if (progress >= 40) {
        completedCount = 3;
        currentTaskIndex = 3;
      } else if (progress >= 30) {
        completedCount = 2;
        currentTaskIndex = 2;
      } else if (progress >= 20) {
        completedCount = 1;
        currentTaskIndex = 1;
      }
    } else if (status === 'DISCUSSING') {
      // 正在讨论
      if (progress >= 30) {
        completedCount = 1;
        currentTaskIndex = 1;
      }
    }

    // 更新 TODO 状态
    const updatedTodos = baseTodos.map((todo, index) => {
      if (index < completedCount) {
        return { ...todo, status: 'completed' as const };
      } else if (index === completedCount && status !== 'COMPLETED' && status !== 'PAPER_GENERATING') {
        return { ...todo, status: 'in-progress' as const };
      } else {
        return { ...todo, status: 'pending' as const };
      }
    });

    setTodos(updatedTodos);
  };

  const simulateCodeWriting = async () => {
    setIsGenerating(true);
    addLog('info', '开始生成代码...');
    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('info', '读取讨论记录摘要...');
    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('success', '提取核心算法: 遗传算法、蚁群算法');
    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('info', '设计数据结构...');
    await new Promise(resolve => setTimeout(resolve, 300));
    addLog('success', '数据结构设计完成');
    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('info', '实现遗传算法...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    addLog('success', '遗传算法实现完成');
    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('info', '实现蚁群算法...');
    await new Promise(resolve => setTimeout(resolve, 800));
    addLog('success', '蚁群算法实现完成');
    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('info', '实现混合优化器...');
    await new Promise(resolve => setTimeout(resolve, 600));
    addLog('success', '混合优化器实现完成');
    addLog('success', '代码生成完成！');
    setIsGenerating(false);
    toast.success('代码生成完成');
  };

  const addLog = (level: string, message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      level,
      message,
    }]);
  };

  const getTodoIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getOverallStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: '待处理', variant: 'secondary' },
      DISCUSSING: { label: '讨论中', variant: 'default' },
      CODING: { label: '代码生成中', variant: 'default' },
      VALIDATING: { label: '校验中', variant: 'default' },
      RETRYING: { label: '优化中', variant: 'default' },
      PAPER_GENERATING: { label: '论文生成中', variant: 'default' },
      COMPLETED: { label: '已完成', variant: 'default' },
      FAILED: { label: '失败', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!taskStatus) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto py-8 px-4">
            <div className="text-center py-20">
              <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">任务不存在</h2>
              <Button onClick={() => router.push('/dashboard/auto-modeling')}>
                返回任务列表
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          {/* 返回按钮和标题 */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/auto-modeling')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回任务列表
            </Button>
            <h1 className="text-3xl font-bold mb-2">{taskStatus.problemTitle}</h1>
            <div className="flex items-center gap-4">
              {getOverallStatusBadge(taskStatus.overallStatus)}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>进度: {taskStatus.progress}%</span>
              </div>
            </div>
            <Progress value={taskStatus.progress} className="mt-4" />
          </div>

          {/* 标签页 */}
          <Tabs defaultValue="code-generation" className="space-y-6">
            <TabsList>
              <TabsTrigger value="code-generation" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                代码生成
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                优化状态
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                群聊讨论
              </TabsTrigger>
            </TabsList>

            {/* 代码生成标签页 */}
            <TabsContent value="code-generation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：TODO 列表 */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <ListTodo className="h-5 w-5" />
                        任务列表
                      </CardTitle>
                      <Badge variant="secondary">
                        {todos.filter(t => t.status === 'completed').length}/{todos.length}
                      </Badge>
                    </div>
                    <CardDescription>AI 正在按顺序完成这些任务</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-3">
                        {todos.map((todo, index) => (
                          <div
                            key={todo.id}
                            className={`p-3 rounded-lg border ${
                              todo.status === 'completed'
                                ? 'bg-green-50 border-green-200'
                                : todo.status === 'in-progress'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {getTodoIcon(todo.status)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{todo.text}</span>
                                  <span className="text-xs text-gray-500">{todo.estimatedTime}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <span>{index + 1}.</span>
                                  {todo.status === 'completed' && (
                                    <span className="text-green-600">已完成</span>
                                  )}
                                  {todo.status === 'in-progress' && (
                                    <span className="text-blue-600">进行中</span>
                                  )}
                                  {todo.status === 'pending' && (
                                    <span className="text-gray-400">待处理</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* 右侧：代码编辑器和日志 */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 代码编辑器 */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Code2 className="h-5 w-5" />
                          生成的代码
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{codeGeneration?.codeLanguage || 'PYTHON'}</Badge>
                          {isGenerating && (
                            <Badge variant="secondary" className="animate-pulse">
                              生成中...
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadCodeGeneration}
                            disabled={isGenerating}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            刷新
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {codeGeneration?.description || '基于讨论记录生成的代码'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="absolute top-0 left-0 w-12 h-full bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 text-xs text-gray-500">
                          {Array.from({ length: Math.max(30, (codeGeneration?.codeContent || '').split('\n').length) }, (_, i) => (
                            <div key={i} className="leading-6">
                              {i + 1}
                            </div>
                          ))}
                        </div>
                        <ScrollArea className="h-[500px] ml-12 bg-gray-900 rounded-lg">
                          <pre className="p-4 text-sm font-mono text-gray-100 whitespace-pre-wrap">
                            {codeGeneration?.codeContent || '// 代码生成中...'}
                          </pre>
                        </ScrollArea>
                      </div>
                      {codeGeneration?.qualityScore && (
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-sm text-gray-600">代码质量评分:</span>
                          <Badge variant="default">
                            {(codeGeneration.qualityScore * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 实时日志 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        生成日志
                      </CardTitle>
                      <CardDescription>实时代码生成日志</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px] bg-gray-900 rounded-lg p-4">
                        <div className="space-y-2">
                          {logs.length === 0 && (
                            <div className="text-gray-500 text-sm">暂无日志</div>
                          )}
                          {logs.map((log, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-gray-500 font-mono text-xs">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                              <span className={getLogLevelColor(log.level)}>
                                <ChevronRight className="h-4 w-4 inline" />
                                {log.message}
                              </span>
                            </div>
                          ))}
                          <div ref={logsEndRef} />
                        </div>
                      </ScrollArea>
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={simulateCodeWriting}
                          disabled={isGenerating}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isGenerating ? '生成中...' : '模拟代码生成'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* 优化状态标签页 */}
            <TabsContent value="optimization" className="space-y-6">
              <OptimizationVisualizer
                taskId={taskId}
                isOptimizing={taskStatus.overallStatus === 'RETRYING'}
                onRefresh={loadTaskStatus}
              />
            </TabsContent>

            {/* 群聊讨论标签页 */}
            <TabsContent value="discussion">
              {taskStatus.discussionId ? (
                <DiscussionHistoryViewer discussionId={taskStatus.discussionId} />
              ) : (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>暂无讨论记录</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
