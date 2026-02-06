'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, Trophy, Users, Zap, Clock } from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  problemNumber: string;
  competitionName: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  activeCompetitions: number;
  modelingTasks: number;
  teamMembers: number;
  aiRequests: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeCompetitions: 0,
    modelingTasks: 0,
    teamMembers: 0,
    aiRequests: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 尝试从 API 获取数据
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activities'),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        if (activitiesData.success) {
          setRecentActivities(activitiesData.data);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // 如果 API 不可用，使用 mock 数据
      setStats({
        activeCompetitions: 3,
        modelingTasks: 12,
        teamMembers: 8,
        aiRequests: 1234,
      });
      setRecentActivities([
        {
          id: 'prob-001',
          name: '2025-MCM-A - 持续捕鱼',
          problemNumber: 'A',
          competitionName: '2025-MCM',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'prob-002',
          name: '2024-MCM-B - 地球生态系统的碳汇',
          problemNumber: 'B',
          competitionName: '2024-MCM',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    return `${diffDays} 天前`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
              <p className="text-muted-foreground">
                欢迎回到 CMAMSys - 数学建模自动化系统
              </p>
            </div>

            {/* 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  活跃竞赛
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCompetitions}</div>
                <p className="text-xs text-muted-foreground">
                  正在进行
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  建模任务
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.modelingTasks}</div>
                <p className="text-xs text-muted-foreground">
                  待处理
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  团队成员
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.teamMembers}</div>
                <p className="text-xs text-muted-foreground">
                  活跃用户
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AI 请求
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.aiRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  总请求数
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {/* 最近活动 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>最近活动</CardTitle>
                    <CardDescription>
                      您最近的建模竞赛活动
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/competitions">
                    <Button variant="ghost" size="sm">
                      查看全部
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">加载中...</div>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">暂无最近活动</p>
                    <Link href="/dashboard/competitions" className="mt-4">
                      <Button variant="outline" size="sm">
                        创建第一个竞赛
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <Link
                        key={activity.id}
                        href={`/dashboard/problems/${activity.id}`}
                        className="block hover:bg-accent/50 rounded-lg p-3 -mx-3 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="ml-4 space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">
                              {activity.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.competitionName} • {formatTimeAgo(activity.createdAt)}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 快速开始 */}
            <Card>
              <CardHeader>
                <CardTitle>快速开始</CardTitle>
                <CardDescription>
                  开始您的下一个建模竞赛
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/competitions" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">创建新项目</span>
                      <span className="text-xs text-muted-foreground">
                        选择模板并开始您的建模工作
                      </span>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/teams" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">加入团队</span>
                      <span className="text-xs text-muted-foreground">
                        与其他建模爱好者协作
                      </span>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/ai-providers" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">配置 AI Provider</span>
                      <span className="text-xs text-muted-foreground">
                        添加您的 AI 服务提供商
                      </span>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
