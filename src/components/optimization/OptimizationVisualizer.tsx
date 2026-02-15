'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFetchWithAuth } from '@/lib/fetch-with-auth';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Activity,
  Clock,
  RefreshCw,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface OptimizationVisualizerProps {
  taskId: string;
  isOptimizing: boolean;
  onRefresh?: () => void;
}

interface OptimizationData {
  taskId: string;
  title: string;
  overallStatus: string;
  progress: number;
  timestamp: string;
  discussion: {
    id: string | null;
    status: string;
    messageCount: number;
    consensus: any;
    optimizationHistory: Array<{
      iteration: number;
      fitness: number;
      bestSolution: number;
      populationDiversity: number;
      convergenceRate: number;
      timestamp: string;
    }>;
  };
  codeGeneration: {
    id: string;
    language: string;
    status: string;
    codeLength: number;
    qualityScore: number | null;
    validations: Array<{
      id: string;
      type: string;
      status: string;
      result: any;
      errorMessage: string | null;
    }>;
  } | null;
  convergence: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
    source: string;
  }>;
  metrics: {
    executionTime: string;
    memoryUsage: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
      }>;
    };
    cpuUsage: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
      }>;
    };
  };
}

export function OptimizationVisualizer({
  taskId,
  isOptimizing,
  onRefresh,
}: OptimizationVisualizerProps) {
  const { fetchWithAuth } = useFetchWithAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OptimizationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('convergence');

  useEffect(() => {
    loadOptimizationData();
  }, [taskId]);

  useEffect(() => {
    if (isOptimizing) {
      const interval = setInterval(() => {
        loadOptimizationData();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOptimizing]);

  const loadOptimizationData = async () => {
    try {
      const response = await fetchWithAuth(`/api/auto-modeling/${taskId}/optimization`);
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.error || '加载优化数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载优化数据失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>加载优化数据...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || '无法加载优化数据'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 状态概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              优化状态可视化
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isOptimizing ? 'default' : 'secondary'}>
                {data.overallStatus}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadOptimizationData();
                  onRefresh?.();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
          <CardDescription>
            {data.title} · 执行时间: {data.metrics.executionTime}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 进度 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">总体进度</span>
                <span className="font-medium">{data.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>

            {/* 讨论消息数 */}
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">讨论消息</div>
                <div className="font-medium">{data.discussion.messageCount} 条</div>
              </div>
            </div>

            {/* 代码状态 */}
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">代码状态</div>
                <div className="font-medium">
                  {data.codeGeneration?.status || '未生成'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 收敛曲线 */}
      <CollapsibleSection
        title="收敛曲线"
        icon={<TrendingUp className="h-5 w-5" />}
        expanded={expandedSection === 'convergence'}
        onToggle={() => toggleSection('convergence')}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformConvergenceData(data.convergence)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.convergence.datasets.map((dataset, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`value${index}`}
                  stroke={dataset.borderColor}
                  fill={dataset.backgroundColor}
                  name={dataset.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      {/* 性能指标 */}
      <CollapsibleSection
        title="性能指标"
        icon={<Activity className="h-5 w-5" />}
        expanded={expandedSection === 'performance'}
        onToggle={() => toggleSection('performance')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU 使用率 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">CPU 使用率</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transformChartData(data.metrics.cpuUsage)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value0"
                    stroke={data.metrics.cpuUsage.datasets[0]?.borderColor}
                    fill={data.metrics.cpuUsage.datasets[0]?.backgroundColor}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 内存使用 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">内存使用</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformChartData(data.metrics.memoryUsage)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value0"
                    fill={data.metrics.memoryUsage.datasets[0]?.backgroundColor}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 实时日志 */}
      <CollapsibleSection
        title="实时日志"
        icon={<Clock className="h-5 w-5" />}
        expanded={expandedSection === 'logs'}
        onToggle={() => toggleSection('logs')}
      >
        <ScrollArea className="h-96 w-full">
          <div className="space-y-2">
            {data.logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Badge
                  variant={
                    log.level === 'ERROR'
                      ? 'destructive'
                      : log.level === 'WARN'
                      ? 'default'
                      : 'secondary'
                  }
                  className="shrink-0"
                >
                  {log.level}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>{format(new Date(log.timestamp), 'HH:mm:ss', { locale: zhCN })}</span>
                    <span className="text-gray-400">·</span>
                    <span>{log.source}</span>
                  </div>
                  <p className="text-sm text-gray-900">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleSection>

      {/* 验证结果 */}
      {data.codeGeneration?.validations && data.codeGeneration.validations.length > 0 && (
        <CollapsibleSection
          title="验证结果"
          icon={<Activity className="h-5 w-5" />}
          expanded={expandedSection === 'validation'}
          onToggle={() => toggleSection('validation')}
        >
          <div className="space-y-4">
            {data.codeGeneration.validations.map((validation) => (
              <Card key={validation.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{validation.type}</span>
                    <Badge
                      variant={validation.status === 'COMPLETED' ? 'default' : 'secondary'}
                    >
                      {validation.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                {validation.errorMessage && (
                  <CardContent>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{validation.errorMessage}</AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// 辅助组件：可折叠区块
function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </CardHeader>
      {expanded && <CardContent>{children}</CardContent>}
    </Card>
  );
}

// 辅助函数：转换收敛数据
function transformConvergenceData(convergence: any) {
  return convergence.labels.map((label: string, index: number) => ({
    name: label,
    ...convergence.datasets.reduce(
      (acc: any, dataset: any, datasetIndex: number) => ({
        ...acc,
        [`value${datasetIndex}`]: dataset.data[index],
      }),
      {}
    ),
  }));
}

// 辅助函数：转换图表数据
function transformChartData(chartData: any) {
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return [];
  }

  return chartData.labels.map((label: string, index: number) => ({
    name: label,
    ...chartData.datasets.reduce(
      (acc: any, dataset: any, datasetIndex: number) => ({
        ...acc,
        [`value${datasetIndex}`]: dataset.data[index] || 0,
      }),
      {}
    ),
  }));
}
