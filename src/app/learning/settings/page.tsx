'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Pause, RefreshCw } from 'lucide-react';

interface LearningConfig {
  autoLearningEnabled: boolean;
  dailyVideoTarget: number;
  learningStartTime: string;
  learningEndTime: string;
  allowedDaysOfWeek: string[];
  maxConcurrentTasks: number;
  pauseOnHighLoad: boolean;
  cpuThreshold: number;
  memoryThreshold: number;
  searchKeywords: string[];
  searchResultsLimit: number;
  minVideoDuration: number;
  maxVideoDuration: number;
  minViewCount: number;
  learningMode: string;
  requiredTags: string[];
}

interface LearningStats {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  totalVideos: number;
  videosByStatus: Record<string, number>;
  totalKnowledge: number;
  autoLearningEnabled: boolean;
  recentLogs: Array<{
    id: string;
    action: string;
    message: string;
    createdAt: string;
  }>;
}

const DAYS_OF_WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function LearningSettingsPage() {
  const [config, setConfig] = useState<LearningConfig | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
    fetchStats();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/learning/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法加载学习配置',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/learning/control');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/learning/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '保存成功',
          description: '学习配置已更新',
        });
        fetchStats();
      } else {
        throw new Error(data.error?.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error instanceof Error ? error.message : '无法保存配置',
      });
    } finally {
      setSaving(false);
    }
  };

  const triggerAutoSearch = async () => {
    try {
      const response = await fetch('/api/learning/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_search' }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '搜索成功',
          description: `已创建 ${data.data.tasksCreated} 个学习任务`,
        });
        fetchStats();
      } else {
        throw new Error(data.error?.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '搜索失败',
        description: error instanceof Error ? error.message : '无法执行搜索',
      });
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
        <h1 className="text-3xl font-bold">B 端视频学习配置</h1>
        <p className="text-muted-foreground mt-2">配置系统自动学习 B 端数学建模相关视频</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">学习设置</TabsTrigger>
          <TabsTrigger value="schedule">学习计划</TabsTrigger>
          <TabsTrigger value="keywords">搜索设置</TabsTrigger>
          <TabsTrigger value="status">学习状态</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>自动学习设置</CardTitle>
              <CardDescription>配置系统的自动学习行为</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoLearning">启用自动学习</Label>
                <Switch
                  id="autoLearning"
                  checked={config.autoLearningEnabled}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, autoLearningEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyTarget">每日学习视频数：{config.dailyVideoTarget}</Label>
                <Slider
                  id="dailyTarget"
                  value={[config.dailyVideoTarget]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, dailyVideoTarget: value })
                  }
                  min={1}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTasks">最大并发任务数：{config.maxConcurrentTasks}</Label>
                <Slider
                  id="maxTasks"
                  value={[config.maxConcurrentTasks]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, maxConcurrentTasks: value })
                  }
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pauseOnHighLoad">高负载时暂停</Label>
                <Switch
                  id="pauseOnHighLoad"
                  checked={config.pauseOnHighLoad}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, pauseOnHighLoad: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpuThreshold">CPU 阈值 (%)</Label>
                  <Input
                    id="cpuThreshold"
                    type="number"
                    value={config.cpuThreshold}
                    onChange={(e) =>
                      setConfig({ ...config, cpuThreshold: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memoryThreshold">内存阈值 (%)</Label>
                  <Input
                    id="memoryThreshold"
                    type="number"
                    value={config.memoryThreshold}
                    onChange={(e) =>
                      setConfig({ ...config, memoryThreshold: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={saveConfig} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存配置
            </Button>
            <Button variant="outline" onClick={fetchConfig}>
              重置
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>学习时间设置</CardTitle>
              <CardDescription>配置系统的学习时间窗口</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">开始时间</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={config.learningStartTime}
                    onChange={(e) =>
                      setConfig({ ...config, learningStartTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">结束时间</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={config.learningEndTime}
                    onChange={(e) =>
                      setConfig({ ...config, learningEndTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>允许学习的星期</Label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <Button
                      key={day}
                      variant={config.allowedDaysOfWeek.includes(index.toString()) ? 'default' : 'outline'}
                      onClick={() => {
                        const newDays = config.allowedDaysOfWeek.includes(index.toString())
                          ? config.allowedDaysOfWeek.filter((d) => d !== index.toString())
                          : [...config.allowedDaysOfWeek, index.toString()];
                        setConfig({ ...config, allowedDaysOfWeek: newDays });
                      }}
                      className="w-full"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveConfig} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存配置
          </Button>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>搜索关键词设置</CardTitle>
              <CardDescription>配置系统搜索视频的关键词</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="keywords">搜索关键词（每行一个）</Label>
                <Textarea
                  id="keywords"
                  placeholder="数学建模&#10;matlab&#10;python"
                  value={config.searchKeywords.join('\n')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      searchKeywords: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultsLimit">搜索结果数：{config.searchResultsLimit}</Label>
                <Slider
                  id="resultsLimit"
                  value={[config.searchResultsLimit]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, searchResultsLimit: value })
                  }
                  min={1}
                  max={50}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minDuration">最小时长（秒）</Label>
                  <Input
                    id="minDuration"
                    type="number"
                    value={config.minVideoDuration}
                    onChange={(e) =>
                      setConfig({ ...config, minVideoDuration: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDuration">最大时长（秒）</Label>
                  <Input
                    id="maxDuration"
                    type="number"
                    value={config.maxVideoDuration}
                    onChange={(e) =>
                      setConfig({ ...config, maxVideoDuration: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minViews">最小观看量</Label>
                  <Input
                    id="minViews"
                    type="number"
                    value={config.minViewCount}
                    onChange={(e) =>
                      setConfig({ ...config, minViewCount: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveConfig} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存配置
          </Button>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总任务数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总视频数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalVideos || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">知识点数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalKnowledge || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">自动学习</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={stats?.autoLearningEnabled ? 'default' : 'secondary'}>
                  {stats?.autoLearningEnabled ? '启用' : '禁用'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>学习操作</CardTitle>
              <CardDescription>手动触发学习任务</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={triggerAutoSearch}>
                  <Play className="mr-2 h-4 w-4" />
                  立即搜索视频
                </Button>
                <Button variant="outline" onClick={fetchStats}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新状态
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近学习日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-muted-foreground flex-1">{log.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
                {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    暂无学习日志
                  </div>
                )}
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
