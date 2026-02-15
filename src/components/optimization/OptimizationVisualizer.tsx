'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Play, Pause, Download, Filter, Search, CheckCircle, XCircle, AlertCircle, Info, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OptimizationData {
  taskId: string;
  status: string;
  convergence: {
    data: Array<{
      iteration: number;
      fitness: number;
      bestSolution: number;
    }>;
    isConverged: boolean;
    finalFitness: number | null;
  };
  performance: {
    metrics: Array<{
      timestamp: Date;
      cpuUsage: number;
      memoryUsage: number;
      gpuUsage: number | null;
      networkUsage: number;
      diskUsage: number;
    }>;
    stats: {
      avgCpuUsage: number;
      avgMemoryUsage: number;
      maxCpuUsage: number;
      maxMemoryUsage: number;
      hasGpuData: boolean;
      avgGpuUsage: number;
    };
  };
  logs: Array<{
    id: string;
    level: string;
    source: string;
    message: string;
    timestamp: Date;
  }>;
  discussions: Array<{
    id: string;
    timestamp: Date;
    participant: string;
    message: string;
  }>;
  codeGenerations: Array<{
    id: string;
    timestamp: Date;
    language: string;
    codeLength: number;
    isValid: boolean;
    errorMessage?: string;
  }>;
  paper: {
    id: string;
    title: string;
    version: number;
    contentLength: number;
    wordCount: number;
  } | null;
}

const OptimizationVisualizer = ({ taskId }: { taskId: string }) => {
  const [data, setData] = useState<OptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 获取优化数据
  const fetchOptimizationData = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (logFilter !== 'ALL') searchParams.append('logLevel', logFilter);
      if (logSearch) searchParams.append('logSearch', logSearch);
      searchParams.append('logLimit', '100');

      const response = await fetch(`/api/auto-modeling/${taskId}/optimization?${searchParams}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchOptimizationData();

    // 自动刷新
    let refreshInterval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        fetchOptimizationData();
      }, 5000); // 每 5 秒刷新一次
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [taskId, autoRefresh, logFilter, logSearch]);

  // 回放动画
  const togglePlayback = () => {
    if (!data?.convergence.data.length) return;

    if (isPlaying) {
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    } else {
      setIsPlaying(true);
      if (currentIteration >= data.convergence.data.length - 1) {
        setCurrentIteration(0);
      }
      playIntervalRef.current = setInterval(() => {
        setCurrentIteration((prev) => {
          if (prev >= data.convergence.data.length - 1) {
            setIsPlaying(false);
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current);
              playIntervalRef.current = null;
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // 每秒一帧
    }
  };

  // 导出 JSON 报告
  const exportJsonReport = async () => {
    if (!data) return;

    const reportData = {
      taskId,
      status: data.status,
      timestamp: new Date().toISOString(),
      convergence: data.convergence,
      performance: data.performance,
      logs: data.logs,
      discussions: data.discussions,
      codeGenerations: data.codeGenerations,
      paper: data.paper,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization-report-${taskId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出 Word 报告
  const exportWordReport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/auto-modeling/${taskId}/optimization/export`);
      if (!response.ok) {
        throw new Error('导出失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimization-report-${taskId}-${Date.now()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出报告失败:', err);
      alert('导出报告失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  // 日志图标
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WARN':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'DEBUG':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // 获取过滤后的日志
  const getFilteredLogs = () => {
    if (!data?.logs) return [];
    return data.logs.filter(log => {
      if (logFilter !== 'ALL' && log.level !== logFilter) return false;
      if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase())) return false;
      return true;
    });
  };

  // 获取当前回放数据
  const getPlaybackData = () => {
    if (!data?.convergence.data || !data.convergence.data.length) return [];
    return data.convergence.data.slice(0, currentIteration + 1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>优化状态可视化</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>正在加载优化数据...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>优化状态可视化</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchOptimizationData}>重试</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>优化状态可视化</CardTitle>
          <CardDescription>暂无数据</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和控制 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>优化状态可视化</CardTitle>
              <CardDescription>
                任务 ID: {taskId} · 状态: <Badge>{data.status}</Badge>
                {data.convergence.isConverged && (
                  <Badge variant="outline" className="ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    已收敛
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? '暂停刷新' : '启用刷新'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportJsonReport}
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportWordReport}
                disabled={exporting}
              >
                <FileText className="h-4 w-4 mr-2" />
                {exporting ? '导出中...' : 'Word'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="convergence">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="convergence">收敛曲线</TabsTrigger>
          <TabsTrigger value="performance">性能指标</TabsTrigger>
          <TabsTrigger value="logs">优化日志</TabsTrigger>
          <TabsTrigger value="replay">过程回放</TabsTrigger>
          <TabsTrigger value="summary">统计摘要</TabsTrigger>
        </TabsList>

        {/* 收敛曲线 */}
        <TabsContent value="convergence">
          <Card>
            <CardHeader>
              <CardTitle>优化收敛曲线</CardTitle>
              <CardDescription>
                {data.convergence.finalFitness
                  ? `最终最优解: ${data.convergence.finalFitness.toFixed(2)}`
                  : '暂无收敛结果'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.convergence.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="iteration" label={{ value: '迭代次数', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: '适应度', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="fitness"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="当前适应度"
                  />
                  <Area
                    type="monotone"
                    dataKey="bestSolution"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    name="最优解"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 性能指标 */}
        <TabsContent value="performance">
          <div className="space-y-4">
            {/* 性能统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">CPU 平均使用率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.stats.avgCpuUsage.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">最高: {data.performance.stats.maxCpuUsage.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">内存平均使用</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(data.performance.stats.avgMemoryUsage / 1024).toFixed(1)} GB</div>
                  <div className="text-xs text-gray-500">最高: {(data.performance.stats.maxMemoryUsage / 1024).toFixed(1)} GB</div>
                </CardContent>
              </Card>

              {data.performance.stats.hasGpuData && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">GPU 平均使用率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.performance.stats.avgGpuUsage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">GPU 加速已启用</div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">数据点数量</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.metrics.length}</div>
                  <div className="text-xs text-gray-500">采样点总数</div>
                </CardContent>
              </Card>
            </div>

            {/* CPU/内存使用率图表 */}
            <Card>
              <CardHeader>
                <CardTitle>CPU & 内存使用率</CardTitle>
                <CardDescription>实时性能监控</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.performance.metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      stroke="#3b82f6"
                      name="CPU 使用率 (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#10b981"
                      name="内存使用 (MB)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* GPU 使用率图表 */}
            {data.performance.stats.hasGpuData && (
              <Card>
                <CardHeader>
                  <CardTitle>GPU 使用率</CardTitle>
                  <CardDescription>GPU 加速性能监控</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.performance.metrics.filter(m => m.gpuUsage !== null)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="gpuUsage"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.3}
                        name="GPU 使用率 (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 网络和磁盘使用率 */}
            <Card>
              <CardHeader>
                <CardTitle>网络 & 磁盘使用率</CardTitle>
                <CardDescription>I/O 性能监控</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.performance.metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="networkUsage"
                      stroke="#8b5cf6"
                      name="网络使用 (MB/s)"
                    />
                    <Line
                      type="monotone"
                      dataKey="diskUsage"
                      stroke="#ef4444"
                      name="磁盘使用 (MB/s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 优化日志 */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>优化日志</CardTitle>
                  <CardDescription>实时优化过程记录</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="搜索日志..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-48"
                  />
                  <div className="flex gap-1">
                    {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((level) => (
                      <Button
                        key={level}
                        variant={logFilter === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLogFilter(level as any)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {getFilteredLogs().map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 mt-0.5">
                        {getLogIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm break-words">{log.message}</p>
                      </div>
                    </div>
                  ))}
                  {getFilteredLogs().length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      没有找到匹配的日志
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 过程回放 */}
        <TabsContent value="replay">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>优化过程回放</CardTitle>
                  <CardDescription>
                    迭代 {currentIteration + 1} / {data.convergence.data.length}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIteration(0)}
                    disabled={isPlaying}
                  >
                    重置
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <><Pause className="h-4 w-4 mr-2" /> 暂停</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" /> 播放</>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 收敛曲线动画 */}
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getPlaybackData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="iteration" label={{ value: '迭代次数', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: '适应度', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="fitness"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="当前适应度"
                    />
                    <Area
                      type="monotone"
                      dataKey="bestSolution"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="最优解"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* 当前迭代详情 */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                      当前迭代详情
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {data.convergence.data[currentIteration] && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">迭代次数</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {data.convergence.data[currentIteration].iteration}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">当前适应度</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {data.convergence.data[currentIteration].fitness.toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">最优解</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {data.convergence.data[currentIteration].bestSolution.toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">种群多样性</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {data.convergence.data[currentIteration].populationDiversity?.toFixed(3) || 'N/A'}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* 讨论记录 */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
                          讨论记录 ({data.discussions.length})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {data.discussions.map((d) => (
                              <div key={d.id} className="p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline">{d.participant}</Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(d.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm">{d.message}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* 代码生成记录 */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
                          代码生成记录 ({data.codeGenerations.length})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {data.codeGenerations.map((c) => (
                              <div key={c.id} className="p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline">{c.language}</Badge>
                                  <Badge variant={c.isValid ? 'default' : 'destructive'}>
                                    {c.isValid ? '有效' : '无效'}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(c.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm">代码长度: {c.codeLength} 字符</p>
                                {c.errorMessage && (
                                  <p className="text-sm text-red-500 mt-1">
                                    错误: {c.errorMessage}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CollapsibleContent>
                    </Collapsible>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 统计摘要 */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 优化摘要 */}
            <Card>
              <CardHeader>
                <CardTitle>优化摘要</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">总迭代次数</dt>
                    <dd className="text-sm font-medium">{data.convergence.data.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">初始适应度</dt>
                    <dd className="text-sm font-medium">
                      {data.convergence.data[0]?.fitness.toFixed(2) || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">最终适应度</dt>
                    <dd className="text-sm font-medium">
                      {data.convergence.data[data.convergence.data.length - 1]?.bestSolution.toFixed(2) || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">收敛状态</dt>
                    <dd>
                      {data.convergence.isConverged ? (
                        <Badge><CheckCircle className="h-3 w-3 mr-1" /> 已收敛</Badge>
                      ) : (
                        <Badge variant="outline">未收敛</Badge>
                      )}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* 性能摘要 */}
            <Card>
              <CardHeader>
                <CardTitle>性能摘要</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">平均 CPU 使用率</dt>
                    <dd className="text-sm font-medium">{data.performance.stats.avgCpuUsage.toFixed(1)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">平均内存使用</dt>
                    <dd className="text-sm font-medium">
                      {(data.performance.stats.avgMemoryUsage / 1024).toFixed(1)} GB
                    </dd>
                  </div>
                  {data.performance.stats.hasGpuData && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">平均 GPU 使用率</dt>
                        <dd className="text-sm font-medium">{data.performance.stats.avgGpuUsage.toFixed(1)}%</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">采样点数量</dt>
                    <dd className="text-sm font-medium">{data.performance.metrics.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* 论文信息 */}
            {data.paper && (
              <Card>
                <CardHeader>
                  <CardTitle>生成论文</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">标题</dt>
                      <dd className="text-sm font-medium">{data.paper.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">版本</dt>
                      <dd className="text-sm font-medium">{data.paper.version}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">字数</dt>
                      <dd className="text-sm font-medium">{data.paper.wordCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">内容长度</dt>
                      <dd className="text-sm font-medium">{data.paper.contentLength}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* 日志统计 */}
            <Card>
              <CardHeader>
                <CardTitle>日志统计</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">总日志数</dt>
                    <dd className="text-sm font-medium">{data.logs.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">错误日志</dt>
                    <dd className="text-sm font-medium text-red-500">
                      {data.logs.filter(l => l.level === 'ERROR').length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">警告日志</dt>
                    <dd className="text-sm font-medium text-yellow-500">
                      {data.logs.filter(l => l.level === 'WARN').length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">信息日志</dt>
                    <dd className="text-sm font-medium text-blue-500">
                      {data.logs.filter(l => l.level === 'INFO').length}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizationVisualizer;
