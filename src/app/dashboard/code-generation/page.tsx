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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

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

export default function CodeGenerationPage() {
  const [loading, setLoading] = useState(true);
  const [codeGeneration, setCodeGeneration] = useState<CodeGeneration | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const taskId = 'cmlhktmot0000uguh5r4wpvgy';

  useEffect(() => {
    loadCodeGeneration();
    loadTodos();
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const loadCodeGeneration = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/code-generation/task/${taskId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        setCodeGeneration(data.data);
      }
    } catch (error) {
      console.error('加载代码生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodos = () => {
    setTodos([
      { id: 1, text: '分析讨论记录，提取核心算法', status: 'completed', estimatedTime: '30s' },
      { id: 2, text: '设计数据结构（Region, Station）', status: 'completed', estimatedTime: '20s' },
      { id: 3, text: '实现遗传算法（GeneticAlgorithm）', status: 'in-progress', estimatedTime: '60s' },
      { id: 4, text: '实现蚁群算法（AntColonyOptimization）', status: 'pending', estimatedTime: '50s' },
      { id: 5, text: '实现混合优化器（HybridOptimizer）', status: 'pending', estimatedTime: '30s' },
      { id: 6, text: '编写测试用例和验证代码', status: 'pending', estimatedTime: '40s' },
      { id: 7, text: '生成可视化报告', status: 'pending', estimatedTime: '30s' },
    ]);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">AI 代码生成可视化</h1>
            <p className="text-gray-600">实时查看 AI 编写代码的过程和进度</p>
          </div>

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
                      <Badge variant="outline">{codeGeneration?.codeLanguage}</Badge>
                      {isGenerating && (
                        <Badge variant="secondary" className="animate-pulse">
                          生成中...
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {codeGeneration?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-12 h-full bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 text-xs text-gray-500">
                      {Array.from({ length: 30 }, (_, i) => (
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
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={loadCodeGeneration}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button
              onClick={simulateCodeWriting}
              disabled={isGenerating}
            >
              <Play className="h-4 w-4 mr-2" />
              {isGenerating ? '生成中...' : '模拟代码生成'}
            </Button>
          </div>
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
