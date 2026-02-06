/**
 * Competition Detail Page
 * 竞赛详情页面
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Trophy,
  Settings,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  type: string;
  year: number;
  problemId: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
  tasks: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    createdAt: string;
  }>;
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const competitionId = params.id as string;

  useEffect(() => {
    if (competitionId) {
      loadCompetition(competitionId);
    }
  }, [competitionId]);

  const loadCompetition = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/competitions/${id}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        setCompetition(data.data);
      } else {
        // 如果 API 返回错误，返回 404
        router.push('/dashboard/competitions');
      }
    } catch (error) {
      console.error('Failed to load competition:', error);
      router.push('/dashboard/competitions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>加载竞赛详情...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">竞赛不存在</h2>
            <Button onClick={() => router.push('/dashboard/competitions')}>
              返回竞赛列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      DRAFT: { color: 'bg-yellow-500', label: '草稿' },
      ACTIVE: { color: 'bg-green-500', label: '进行中' },
      IN_PROGRESS: { color: 'bg-blue-500', label: '进行中' },
      COMPLETED: { color: 'bg-gray-500', label: '已完成' },
      CANCELLED: { color: 'bg-red-500', label: '已取消' },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/competitions')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回竞赛列表
            </Button>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1>
                  {getStatusBadge(competition.status)}
                  <Badge variant="outline">{competition.type}</Badge>
                  <Badge variant="outline">{competition.year}</Badge>
                </div>
                <p className="text-muted-foreground">{competition.description || '暂无描述'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
                <Button>
                  <Play className="mr-2 h-4 w-4" />
                  开始
                </Button>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">题目 ID</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competition.problemId}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">任务数</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competition.tasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {competition.tasks.filter(t => t.status === 'COMPLETED').length} 已完成
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">创建者</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competition.createdBy.username}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="tasks">任务</TabsTrigger>
              <TabsTrigger value="files">文件</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>竞赛信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">开始时间</p>
                      <p className="font-medium">
                        {competition.startDate
                          ? new Date(competition.startDate).toLocaleString('zh-CN')
                          : '未设置'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">结束时间</p>
                      <p className="font-medium">
                        {competition.endDate
                          ? new Date(competition.endDate).toLocaleString('zh-CN')
                          : '未设置'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">描述</p>
                    <p className="text-sm">{competition.description || '暂无描述'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>建模任务</CardTitle>
                  <CardDescription>此竞赛的所有建模任务</CardDescription>
                </CardHeader>
                <CardContent>
                  {competition.tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">暂无任务</p>
                      <Button>创建第一个任务</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {competition.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="font-medium">{task.name}</p>
                              <p className="text-sm text-muted-foreground">
                                创建于 {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                            <Badge variant="outline">{task.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{task.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>文件管理</CardTitle>
                  <CardDescription>竞赛相关文件</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">暂无文件</p>
                    <Button variant="outline">上传文件</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>竞赛设置</CardTitle>
                  <CardDescription>管理竞赛配置</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">竞赛名称</label>
                      <input
                        type="text"
                        defaultValue={competition.name}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">描述</label>
                      <textarea
                        defaultValue={competition.description}
                        className="w-full px-3 py-2 border rounded-md"
                        rows={3}
                      />
                    </div>
                    <Button>保存更改</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
