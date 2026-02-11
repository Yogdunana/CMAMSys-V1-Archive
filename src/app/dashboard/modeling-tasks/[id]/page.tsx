/**
 * Modeling Task Detail Page
 * 建模任务详情页面（支持实时日志）
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Download,
  FileText,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Terminal,
  Brain,
  Zap,
  Activity,
  Database,
  File,
  Image,
} from 'lucide-react';

interface ModelingTask {
  id: string;
  name: string;
  description?: string;
  problemType: string;
  status: string;
  progress: number;
  competitionId?: string;
  competitionName?: string;
  algorithm?: string;
  approachNumber?: number;
  dataFilePath?: string;
  problemFilePath?: string;
  modelFilePath?: string;
  reportFilePath?: string;
  visualizations: string[];
  hyperparameters?: any;
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rmse?: number;
  };
  logs?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<ModelingTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const taskId = params.id as string;

  useEffect(() => {
    if (taskId) {
      loadTask(taskId);
      connectToLogs(taskId);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [taskId]);

  // 自动滚动到日志底部
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const loadTask = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/modeling-tasks/${id}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        setTask(data.data);
      } else {
        router.push('/dashboard/modeling-tasks');
      }
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToLogs = (id: string) => {
    try {
      // 清除之前的重连定时器
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // 关闭之前的连接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // 使用 SSE 连接实时日志
      const eventSource = new EventSource(`/api/modeling-tasks/${id}/logs`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        addLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: '已连接到任务日志流',
        });
      };

      eventSource.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data);
          
          // 如果收到完成消息，关闭连接
          if (log.message === '模拟日志流演示完成' || log.message === '任务执行完成') {
            eventSource.close();
            setIsConnected(false);
          }
          
          // 过滤掉 debug 级别的消息（如心跳包）
          if (log.level !== 'debug') {
            addLog(log);
          }
        } catch (e) {
          addLog({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: event.data,
          });
        }
      };

      eventSource.onerror = (error) => {
        setIsConnected(false);
        eventSource.close();
        
        // 添加一条错误日志
        addLog({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: '日志连接断开',
        });

        // 延迟 3 秒后尝试重连
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect to logs...');
          connectToLogs(id);
        }, 3000);
      };

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error('Failed to connect to logs:', error);
    }
  };

  const addLog = (log: TaskLog) => {
    setLogs((prev) => [...prev, log]);
  };

  const handleStartTask = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/modeling-tasks/${taskId}/start`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        loadTask(taskId);
        addLog({
          timestamp: new Date().toISOString(),
          level: 'success',
          message: '任务已启动',
        });
      }
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const handlePauseTask = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/modeling-tasks/${taskId}/pause`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        loadTask(taskId);
        addLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: '任务已暂停',
        });
      }
    } catch (error) {
      console.error('Failed to pause task:', error);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Activity className="h-3 w-3 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-500', label: '待处理' },
      PREPROCESSING: { color: 'bg-blue-500', label: '预处理中' },
      MODELING: { color: 'bg-blue-500', label: '建模中' },
      EVALUATING: { color: 'bg-purple-500', label: '评估中' },
      REPORTING: { color: 'bg-indigo-500', label: '生成报告中' },
      COMPLETED: { color: 'bg-green-500', label: '已完成' },
      FAILED: { color: 'bg-red-500', label: '失败' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>加载任务详情...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">任务不存在</h2>
            <Button onClick={() => router.push('/dashboard/modeling-tasks')}>
              返回任务列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/modeling-tasks')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回任务列表
            </Button>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">{task.name}</h1>
                  {getStatusBadge(task.status)}
                  {task.competitionName && (
                    <Badge variant="outline">{task.competitionName}</Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-muted-foreground">{task.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {task.status === 'PENDING' && (
                  <Button onClick={handleStartTask}>
                    <Play className="mr-2 h-4 w-4" />
                    开始任务
                  </Button>
                )}
                {['PREPROCESSING', 'MODELING', 'EVALUATING', 'REPORTING'].includes(task.status) && (
                  <Button onClick={handlePauseTask} variant="outline">
                    <Pause className="mr-2 h-4 w-4" />
                    暂停任务
                  </Button>
                )}
                {task.status === 'FAILED' && (
                  <Button onClick={handleStartTask} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重试
                  </Button>
                )}
                {task.reportFilePath && (
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    下载报告
                  </Button>
                )}
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
              </div>
            </div>
          </div>

          {/* Progress */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">任务进度</span>
                <span className="text-sm text-muted-foreground">{task.progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-muted-foreground">
                  创建于: {new Date(task.createdAt).toLocaleString('zh-CN')}
                </span>
                {task.startedAt && (
                  <span className="text-muted-foreground">
                    开始于: {new Date(task.startedAt).toLocaleString('zh-CN')}
                  </span>
                )}
                {task.completedAt && (
                  <span className="text-muted-foreground">
                    完成于: {new Date(task.completedAt).toLocaleString('zh-CN')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="logs">
                <Terminal className="mr-2 h-4 w-4" />
                实时日志 {isConnected && <Zap className="ml-1 h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="info">任务信息</TabsTrigger>
              <TabsTrigger value="metrics">评估指标</TabsTrigger>
              <TabsTrigger value="results">结果文件</TabsTrigger>
            </TabsList>

            {/* Real-time Logs */}
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>实时执行日志</CardTitle>
                      <CardDescription>
                        显示 AI 思考过程、执行步骤和系统状态
                      </CardDescription>
                    </div>
                    <Badge variant={isConnected ? 'default' : 'secondary'}>
                      {isConnected ? '已连接' : '未连接'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 font-mono text-sm rounded-lg p-4 h-[500px] overflow-y-auto">
                    {logs.length === 0 && (
                      <div className="text-gray-500">
                        等待任务开始执行...
                      </div>
                    )}
                    {logs.map((log, index) => (
                      <div key={index} className="mb-2 flex items-start gap-2">
                        <span className="text-gray-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                        </span>
                        {getLevelIcon(log.level)}
                        <span className={getLevelColor(log.level)}>{log.message}</span>
                        {log.data && (
                          <pre className="text-xs text-gray-400 mt-1 ml-6 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Task Info */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>任务信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">问题类型</p>
                      <p className="font-medium">{task.problemType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">算法</p>
                      <p className="font-medium">{task.algorithm || '未指定'}</p>
                    </div>
                    {task.approachNumber !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">方法编号</p>
                        <p className="font-medium">{task.approachNumber}</p>
                      </div>
                    )}
                  </div>

                  {task.hyperparameters && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">超参数配置</p>
                      <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(task.hyperparameters, null, 2)}
                      </pre>
                    </div>
                  )}

                  {task.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="font-medium text-red-500">错误信息</p>
                      </div>
                      <p className="text-sm text-red-700">{task.errorMessage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics */}
            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>评估指标</CardTitle>
                  <CardDescription>模型性能评估结果</CardDescription>
                </CardHeader>
                <CardContent>
                  {!task.metrics ? (
                    <div className="text-center py-12 text-muted-foreground">
                      暂无评估指标，任务完成后显示
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {task.metrics.accuracy !== undefined && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">准确率</p>
                          <p className="text-2xl font-bold">
                            {(task.metrics.accuracy * 100).toFixed(2)}%
                          </p>
                        </div>
                      )}
                      {task.metrics.precision !== undefined && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">精确率</p>
                          <p className="text-2xl font-bold">
                            {(task.metrics.precision * 100).toFixed(2)}%
                          </p>
                        </div>
                      )}
                      {task.metrics.recall !== undefined && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">召回率</p>
                          <p className="text-2xl font-bold">
                            {(task.metrics.recall * 100).toFixed(2)}%
                          </p>
                        </div>
                      )}
                      {task.metrics.f1Score !== undefined && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">F1 分数</p>
                          <p className="text-2xl font-bold">
                            {task.metrics.f1Score.toFixed(4)}
                          </p>
                        </div>
                      )}
                      {task.metrics.rmse !== undefined && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">均方根误差</p>
                          <p className="text-2xl font-bold">
                            {task.metrics.rmse.toFixed(4)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results */}
            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>结果文件</CardTitle>
                  <CardDescription>任务生成的文件和可视化</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.dataFilePath && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">数据文件</p>
                          <p className="text-sm text-muted-foreground">
                            {task.dataFilePath}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        下载
                      </Button>
                    </div>
                  )}

                  {task.modelFilePath && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">模型文件</p>
                          <p className="text-sm text-muted-foreground">
                            {task.modelFilePath}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        下载
                      </Button>
                    </div>
                  )}

                  {task.reportFilePath && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">分析报告</p>
                          <p className="text-sm text-muted-foreground">
                            {task.reportFilePath}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        下载
                      </Button>
                    </div>
                  )}

                  {task.visualizations && task.visualizations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">可视化图表</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        {task.visualizations.map((viz, index) => (
                          <div
                            key={index}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted p-3">
                              <p className="text-sm font-medium">{viz}</p>
                            </div>
                            <div className="aspect-video bg-muted/30 flex items-center justify-center">
                              <BarChart3 className="h-12 w-12 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
