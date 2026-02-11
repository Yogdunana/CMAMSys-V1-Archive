'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Shield,
  Bell,
  Settings,
  CheckCircle2,
  Info,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CostLimit {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'per_task';
  limit: number;
  threshold: number; // 警告阈值（百分比）
  enabled: boolean;
  notifications: 'email' | 'in_app' | 'both';
}

interface CostAlert {
  id: string;
  type: 'limit' | 'rate' | 'anomaly';
  severity: 'low' | 'medium' | 'high';
  message: string;
  current: number;
  limit: number;
  timestamp: number;
  acknowledged: boolean;
}

interface CostAlertManagerProps {
  taskId?: string;
  onLimitReached?: (limit: CostLimit) => void;
}

export function CostAlertManager({ taskId, onLimitReached }: CostAlertManagerProps) {
  const [limits, setLimits] = useState<CostLimit[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [currentCost, setCurrentCost] = useState(0);
  const { toast } = useToast();

  // 默认成本限制
  const defaultLimits: CostLimit[] = [
    { id: 'daily', type: 'daily', limit: 50, threshold: 80, enabled: true, notifications: 'both' },
    { id: 'weekly', type: 'weekly', limit: 200, threshold: 80, enabled: true, notifications: 'both' },
    { id: 'monthly', type: 'monthly', limit: 500, threshold: 80, enabled: true, notifications: 'both' },
    { id: 'per_task', type: 'per_task', limit: 20, threshold: 90, enabled: true, notifications: 'both' },
  ];

  useEffect(() => {
    // 初始化默认限制
    setLimits(defaultLimits);

    // 加载当前成本
    fetchCurrentCost();

    // 定期检查成本
    const interval = setInterval(checkCostLimits, 30000); // 每 30 秒检查
    return () => clearInterval(interval);
  }, [taskId]);

  const fetchCurrentCost = async () => {
    try {
      const response = await fetch(
        `/api/cost/stats${taskId ? `?taskId=${taskId}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentCost(data.totalCost || 0);
      }
    } catch (error) {
      console.error('Failed to fetch current cost:', error);
    }
  };

  const checkCostLimits = async () => {
    await fetchCurrentCost();

    limits.forEach(limit => {
      if (!limit.enabled) return;

      const percentage = (currentCost / limit.limit) * 100;

      // 检查是否超过阈值
      if (percentage >= limit.threshold) {
        const existingAlert = alerts.find(
          a => a.type === 'limit' && a.limit === limit.limit && !a.acknowledged
        );

        if (!existingAlert) {
          createAlert({
            type: 'limit',
            severity: percentage >= 100 ? 'high' : percentage >= 90 ? 'medium' : 'low',
            message: getLimitWarningMessage(limit, percentage),
            current: currentCost,
            limit: limit.limit,
          });

          // 如果达到 100%，触发回调
          if (percentage >= 100) {
            onLimitReached?.(limit);
          }
        }
      }
    });

    // 检查异常使用情况（快速增长）
    checkUsageAnomaly();
  };

  const getLimitWarningMessage = (limit: CostLimit, percentage: number) => {
    const typeNames = {
      daily: '日',
      weekly: '周',
      monthly: '月',
      per_task: '单任务',
    };

    if (percentage >= 100) {
      return `${typeNames[limit.type]}成本限制已超出！当前: ¥${currentCost.toFixed(2)} / ¥${limit.limit}`;
    }

    return `${typeNames[limit.type]}成本即将达到限制！当前: ¥${currentCost.toFixed(2)} / ¥${limit.limit} (${percentage.toFixed(0)}%)`;
  };

  const checkUsageAnomaly = async () => {
    try {
      const response = await fetch('/api/cost/anomaly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.hasAnomaly && !alerts.find(a => a.type === 'anomaly' && !a.acknowledged)) {
          createAlert({
            type: 'anomaly',
            severity: data.severity,
            message: data.message,
            current: currentCost,
            limit: 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check usage anomaly:', error);
    }
  };

  const createAlert = (alert: Omit<CostAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: CostAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: Date.now(),
      acknowledged: false,
    };

    setAlerts(prev => [newAlert, ...prev]);

    // 显示 toast 通知
    const icon = alert.severity === 'high' ? AlertTriangle : alert.severity === 'medium' ? Info : Shield;

    toast({
      title: alert.type === 'limit' ? '成本警告' : alert.type === 'rate' ? '使用率警告' : '异常检测',
      description: alert.message,
      variant: alert.severity === 'high' ? 'destructive' : 'default',
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const updateLimit = (limitId: string, updates: Partial<CostLimit>) => {
    setLimits(prev =>
      prev.map(limit => (limit.id === limitId ? { ...limit, ...updates } : limit))
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <Info className="w-5 h-5" />;
      case 'low':
        return <Shield className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                智能成本预警与提示
              </CardTitle>
              <CardDescription>自动监控成本并提供智能预警</CardDescription>
            </div>
            <Button
              variant={showSettings ? 'default' : 'outline'}
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              {showSettings ? '隐藏设置' : '显示设置'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 实时状态 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">当前成本</p>
              <p className="text-3xl font-bold">¥{currentCost.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span>系统正常运行</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 智能提示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            智能建议
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <DollarSign className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">成本优化建议</p>
              <p className="text-xs mt-1">
                建议使用更经济的模型进行初步讨论，仅在关键时刻使用高级模型
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <ArrowUpRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">使用效率提示</p>
              <p className="text-xs mt-1">
                当前任务的使用效率良好，建议保持当前的配置策略
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预警设置 */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>成本限制设置</CardTitle>
            <CardDescription>配置不同时间维度的成本阈值</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {limits.map(limit => (
              <div key={limit.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="flex items-center gap-2 mb-2">
                    <Switch
                      checked={limit.enabled}
                      onCheckedChange={checked => updateLimit(limit.id, { enabled: checked })}
                    />
                    <span className="font-medium">
                      {limit.type === 'daily'
                        ? '日限制'
                        : limit.type === 'weekly'
                        ? '周限制'
                        : limit.type === 'monthly'
                        ? '月限制'
                        : '单任务限制'}
                    </span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">¥</span>
                    <Input
                      type="number"
                      value={limit.limit}
                      onChange={e => updateLimit(limit.id, { limit: Number(e.target.value) })}
                      disabled={!limit.enabled}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">警告阈值</span>
                    <Input
                      type="number"
                      value={limit.threshold}
                      onChange={e => updateLimit(limit.id, { threshold: Number(e.target.value) })}
                      disabled={!limit.enabled}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 预警列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>预警记录</span>
            <Badge variant="outline" className="text-xs">
              {alerts.filter(a => !a.acknowledged).length} 未确认
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        确认
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无预警记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
