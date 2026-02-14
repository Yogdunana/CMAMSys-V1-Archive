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
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AutoModelingPage() {
  const router = useRouter();
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
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
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

  // 加载历史任务列表
  useEffect(() => {
    loadTasksList();
  }, []);

  const loadTasksList = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auto-modeling/tasks');
      const data = await response.json();
      if (data.success) {
        setTasksList(data.data || []);
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
      toast.error('加载任务列表失败');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 重新开始任务
  const handleRestartTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/auto-modeling/${taskId}/manage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('任务已重新启动');
        loadTasksList();
      } else {
        toast.error(data.error || '重新启动失败');
      }
    } catch (error) {
      console.error('重新启动任务失败:', error);
      toast.error('重新启动任务失败');
    }
  };

  // 停止任务
  const handleStopTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/auto-modeling/${taskId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('任务已停止');
        loadTasksList();
      } else {
        toast.error(data.error || '停止任务失败');
      }
    } catch (error) {
      console.error('停止任务失败:', error);
      toast.error('停止任务失败');
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除此任务吗？此操作不可恢复。')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/auto-modeling/${taskId}/manage`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('任务已删除');
        loadTasksList();
      } else {
        toast.error(data.error || '删除任务失败');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败');
    }
  };

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
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="new-task">
                <Rocket className="w-4 h-4 mr-2" />
                新建任务
              </TabsTrigger>
              <TabsTrigger value="task-status">
                <Clock className="w-4 h-4 mr-2" />
                当前任务
              </TabsTrigger>
              <TabsTrigger value="history" onClick={() => loadTasksList()}>
                <BarChart3 className="w-4 h-4 mr-2" />
                历史任务
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
              <div className="max-w-7xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      当前任务执行状态
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentTaskId ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getOverallStatusIcon(taskStatus?.overallStatus)}
                            <div>
                              <p className="font-medium">
                                {taskStatus?.problemTitle || '未知任务'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getOverallStatusText(taskStatus?.overallStatus)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/auto-modeling/${currentTaskId}`)}
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
                  </CardContent>
                </Card>
              </div>
              <Toaster />
            </TabsContent>

            {/* 历史任务标签页 */}
            <TabsContent value="history" className="mt-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* 筛选和搜索栏 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      历史任务管理
                    </CardTitle>
                    <CardDescription>
                      查看和管理所有的自动化建模任务
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">筛选：</span>
                        <div className="flex gap-2">
                          <Button
                            variant={taskFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTaskFilter('all')}
                          >
                            全部
                          </Button>
                          <Button
                            variant={taskFilter === 'running' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTaskFilter('running')}
                          >
                            运行中
                          </Button>
                          <Button
                            variant={taskFilter === 'completed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTaskFilter('completed')}
                          >
                            已完成
                          </Button>
                          <Button
                            variant={taskFilter === 'failed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTaskFilter('failed')}
                          >
                            失败
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadTasksList}
                        disabled={historyLoading}
                      >
                        <Loader2 className={`w-4 h-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
                        刷新
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 任务列表 */}
                {historyLoading ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">加载任务列表中...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : tasksList.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">暂无任务</p>
                        <p className="text-sm mt-2">在"新建任务"标签页创建第一个任务</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasksList
                      .filter((task) => {
                        if (taskFilter === 'all') return true;
                        if (taskFilter === 'running') {
                          return ['PENDING', 'DISCUSSING', 'CODING', 'VALIDATING', 'RETRYING', 'PAPER_GENERATING'].includes(task.overallStatus);
                        }
                        if (taskFilter === 'completed') return task.overallStatus === 'COMPLETED';
                        if (taskFilter === 'failed') return task.overallStatus === 'FAILED';
                        return true;
                      })
                      .map((task) => (
                        <Card
                          key={task.id}
                          className="hover:shadow-lg transition-all hover:border-primary"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getOverallStatusIcon(task.overallStatus)}
                                <Badge variant="outline" className="text-xs">
                                  {getOverallStatusText(task.overallStatus)}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {task.progress || 0}%
                              </div>
                            </div>
                            <CardTitle 
                              className="text-base line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/auto-modeling/${task.id}`);
                              }}
                            >
                              {task.problemTitle}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {task.competitionType} · {task.problemType}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Progress value={task.progress || 0} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(task.createdAt).toLocaleString('zh-CN')}</span>
                              </div>
                              {task.overallStatus === 'COMPLETED' && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>已完成</span>
                                </div>
                              )}
                              {task.overallStatus === 'FAILED' && (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="w-3 h-3" />
                                  <span>失败</span>
                                </div>
                              )}
                            </div>
                            {task.errorLog && (
                              <Alert className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  {task.errorLog.substring(0, 50)}...
                                </AlertDescription>
                              </Alert>
                            )}
                            {/* 任务管理按钮 */}
                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestartTask(task.id);
                                }}
                                disabled={task.overallStatus === 'PENDING' || task.overallStatus === 'DISCUSSING' || task.overallStatus === 'CODING' || task.overallStatus === 'VALIDATING' || task.overallStatus === 'RETRYING' || task.overallStatus === 'PAPER_GENERATING'}
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                重新开始
                              </Button>
                              <Button
                                variant={task.overallStatus === 'PENDING' || task.overallStatus === 'DISCUSSING' || task.overallStatus === 'CODING' || task.overallStatus === 'VALIDATING' || task.overallStatus === 'RETRYING' || task.overallStatus === 'PAPER_GENERATING' ? 'destructive' : 'outline'}
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStopTask(task.id);
                                }}
                                disabled={task.overallStatus === 'COMPLETED' || task.overallStatus === 'FAILED'}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                {task.overallStatus === 'PENDING' || task.overallStatus === 'DISCUSSING' || task.overallStatus === 'CODING' || task.overallStatus === 'VALIDATING' || task.overallStatus === 'RETRYING' || task.overallStatus === 'PAPER_GENERATING' ? '停止' : '已停止'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
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
