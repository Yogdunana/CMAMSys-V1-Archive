/**
 * Modeling Tasks Page
 * 建模任务管理页面
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
  Settings,
  Trash2,
  Search,
  Filter,
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
  reportFilePath?: string;
  metrics?: any;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export default function ModelingTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ModelingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // 加载任务列表
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/modeling-tasks', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const problemTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'EVALUATION', label: '评估问题' },
    { value: 'PREDICTION', label: '预测问题' },
    { value: 'OPTIMIZATION', label: '优化问题' },
    { value: 'CLASSIFICATION', label: '分类问题' },
    { value: 'REGRESSION', label: '回归问题' },
    { value: 'CLUSTERING', label: '聚类问题' },
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'PENDING', label: '待处理' },
    { value: 'PREPROCESSING', label: '预处理中' },
    { value: 'MODELING', label: '建模中' },
    { value: 'EVALUATING', label: '评估中' },
    { value: 'REPORTING', label: '生成报告中' },
    { value: 'COMPLETED', label: '已完成' },
    { value: 'FAILED', label: '失败' },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      PENDING: { icon: Clock, color: 'bg-yellow-500', label: '待处理' },
      PREPROCESSING: { icon: Play, color: 'bg-blue-500', label: '预处理中' },
      MODELING: { icon: Play, color: 'bg-blue-500', label: '建模中' },
      EVALUATING: { icon: BarChart3, color: 'bg-purple-500', label: '评估中' },
      REPORTING: { icon: FileText, color: 'bg-indigo-500', label: '生成报告中' },
      COMPLETED: { icon: CheckCircle, color: 'bg-green-500', label: '已完成' },
      FAILED: { icon: AlertCircle, color: 'bg-red-500', label: '失败' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.problemType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // 处理设置按钮点击
  const handleSettingsClick = (task: ModelingTask) => {
    toast({
      title: '设置',
      description: `打开任务 "${task.name}" 的设置`,
    });
    // TODO: 打开设置对话框
  };

  // 处理删除按钮点击
  const handleDeleteClick = async (task: ModelingTask) => {
    if (!window.confirm(`确定要删除任务 "${task.name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/modeling-tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '删除成功',
          description: `任务 "${task.name}" 已删除`,
        });
        // 重新加载任务列表
        loadTasks();
      } else {
        toast({
          title: '删除失败',
          description: data.error || '删除任务失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      toast({
        title: '删除失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>加载建模任务...</p>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">建模任务</h1>
              <p className="text-muted-foreground mt-2">
                管理您的数学建模任务
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建任务
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新任务</DialogTitle>
                  <DialogDescription>
                    创建一个新的数学建模任务
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">任务名称 *</Label>
                    <Input id="name" placeholder="输入任务名称" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problemType">问题类型</Label>
                    <Select defaultValue="EVALUATION">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {problemTypes.slice(1).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">描述</Label>
                    <Textarea
                      id="description"
                      placeholder="输入任务描述"
                      rows={3}
                    />
                  </div>
                  <Button className="w-full">创建任务</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索任务..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {problemTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <CardTitle>任务列表</CardTitle>
              <CardDescription>
                共 {filteredTasks.length} 个任务
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">暂无任务</h3>
                  <p className="text-muted-foreground mb-4">
                    您还没有创建任何建模任务
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建第一个任务
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>进度</TableHead>
                      <TableHead>算法</TableHead>
                      <TableHead>竞赛</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/dashboard/modeling-tasks/${task.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{task.name}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.problemType}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{task.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{task.algorithm || '-'}</TableCell>
                        <TableCell>
                          {task.competitionName ? (
                            <Badge variant="secondary">{task.competitionName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSettingsClick(task)}
                              title="设置"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(task)}
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
