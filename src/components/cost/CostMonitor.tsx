'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Clock,
  BarChart3,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface TokenUsage {
  providerId: string;
  providerName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  requests: number;
  timestamp: number;
}

interface TokenUsageStats {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
  averageTokensPerRequest: number;
  topProvider: string;
  hourlyUsage: Array<{
    hour: number;
    tokens: number;
    cost: number;
  }>;
  providers: TokenUsage[];
}

interface CostMonitorProps {
  taskId?: string;
  onWarning?: (type: 'limit' | 'rate') => void;
}

export function CostMonitor({ taskId, onWarning }: CostMonitorProps) {
  const [stats, setStats] = useState<TokenUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [costLimit, setCostLimit] = useState(10); // 默认 $10
  const [rateLimit, setRateLimit] = useState(100); // 默认 100 tokens/min

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000); // 每 5 秒刷新
      return () => clearInterval(interval);
    }
  }, [autoRefresh, taskId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `/api/cost/stats${taskId ? `?taskId=${taskId}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);

      // 检查是否超过限制
      checkLimits(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLimits = (data: TokenUsageStats) => {
    // 检查总成本
    if (data.totalCost >= costLimit * 0.9) {
      onWarning?.('limit');
    }

    // 检查使用率（最近一小时）
    if (data.hourlyUsage.length > 0) {
      const latestHour = data.hourlyUsage[data.hourlyUsage.length - 1];
      if (latestHour.tokens >= rateLimit * 0.9) {
        onWarning?.('rate');
      }
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toLocaleString();
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    }
    if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  const getUsagePercentage = () => {
    if (!stats) return 0;
    return Math.min((stats.totalCost / costLimit) * 100, 100);
  };

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                实时 Token 消耗监控
              </CardTitle>
              <CardDescription>实时追踪 API 调用成本</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? '自动刷新: 开' : '自动刷新: 关'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">总 Token 数</p>
                <p className="text-2xl font-bold">
                  {stats ? formatNumber(stats.totalTokens) : '-'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            {stats && stats.providers.length > 1 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                {getTrendIcon(
                  stats.providers[stats.providers.length - 1].totalTokens,
                  stats.providers[stats.providers.length - 2]?.totalTokens || 0
                )}
                <span>较上次请求</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">总成本</p>
                <p className="text-2xl font-bold">
                  {stats ? formatCurrency(stats.totalCost) : '-'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={getUsagePercentage()} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {getUsagePercentage().toFixed(1)}% / ${costLimit}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">请求次数</p>
                <p className="text-2xl font-bold">
                  {stats ? stats.totalRequests.toLocaleString() : '-'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            {stats && (
              <p className="text-xs text-muted-foreground mt-2">
                平均 {stats.averageTokensPerRequest.toLocaleString()} tokens/请求
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">最常用 Provider</p>
                <p className="text-lg font-bold">
                  {stats ? stats.topProvider : '-'}
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Top
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider 详情 */}
      <Card>
        <CardHeader>
          <CardTitle>Provider 使用详情</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.providers && stats.providers.length > 0 ? (
            <div className="space-y-4">
              {stats.providers.map((provider, index) => (
                <div
                  key={provider.providerId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{provider.providerName}</span>
                      <Badge variant="outline" className="text-xs">
                        {provider.requests || 0} 请求
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">输入:</span>{' '}
                        <span className="font-medium">
                          {formatNumber(provider.inputTokens)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">输出:</span>{' '}
                        <span className="font-medium">
                          {formatNumber(provider.outputTokens)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">成本:</span>{' '}
                        <span className="font-medium">
                          {formatCurrency(provider.cost)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Progress
                      value={(provider.totalTokens / (stats.totalTokens || 1)) * 100}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {(
                        (provider.totalTokens / (stats.totalTokens || 1)) *
                        100
                      ).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无数据
            </div>
          )}
        </CardContent>
      </Card>

      {/* 小时使用趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>使用趋势（最近24小时）</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.hourlyUsage && stats.hourlyUsage.length > 0 ? (
            <div className="space-y-2">
              {stats.hourlyUsage.map((hour, index) => {
                const maxTokens = Math.max(
                  ...stats.hourlyUsage.map(h => h.tokens)
                );
                const percentage = (hour.tokens / maxTokens) * 100;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-16">
                      {hour.hour}:00
                    </span>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm font-medium w-24 text-right">
                      {formatNumber(hour.tokens)} tokens
                    </span>
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      {formatCurrency(hour.cost)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无趋势数据
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
