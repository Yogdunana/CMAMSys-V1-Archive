'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  TrendingUp,
  Target,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationMetrics {
  currentIteration: number;
  totalIterations: number;
  bestSolution: number;
  currentSolution: number;
  convergence: number;
  fitnessScore: number;
}

interface OptimizationPoint {
  iteration: number;
  value: number;
}

interface OptimizationLog {
  timestamp: string;
  iteration: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface OptimizationVisualizerProps {
  taskId: string;
  isOptimizing: boolean;
  onRefresh?: () => void;
}

export function OptimizationVisualizer({
  taskId,
  isOptimizing,
  onRefresh,
}: OptimizationVisualizerProps) {
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    currentIteration: 0,
    totalIterations: 100,
    bestSolution: 0,
    currentSolution: 0,
    convergence: 0,
    fitnessScore: 0,
  });

  const [convergenceData, setConvergenceData] = useState<OptimizationPoint[]>([]);
  const [logs, setLogs] = useState<OptimizationLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 从 localStorage 加载保存的状态
  useEffect(() => {
    const savedState = localStorage.getItem(`optimization-${taskId}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.isCompleted) {
          setMetrics(state.metrics);
          setConvergenceData(state.convergenceData);
          setLogs(state.logs);
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('加载优化状态失败:', error);
      }
    }
  }, [taskId]);

  // 优化完成后自动停止
  useEffect(() => {
    if (metrics.currentIteration >= metrics.totalIterations && !isCompleted) {
      setIsSimulating(false);
      setIsCompleted(true);
      toast.success('优化完成！');

      // 添加完成日志
      const completeLog: OptimizationLog = {
        timestamp: new Date().toISOString(),
        iteration: metrics.currentIteration,
        message: `优化完成！最佳解: ${metrics.bestSolution.toFixed(2)}, 收敛度: ${(metrics.convergence * 100).toFixed(1)}%`,
        type: 'success',
      };
      setLogs((prev) => [...prev, completeLog]);

      // 保存状态到 localStorage
      const state = {
        metrics,
        convergenceData,
        logs: [...logs, completeLog],
        isCompleted: true,
      };
      localStorage.setItem(`optimization-${taskId}`, JSON.stringify(state));
    }
  }, [metrics.currentIteration, metrics.totalIterations, taskId, metrics, convergenceData, logs, isCompleted]);

  // 运行优化模拟
  useEffect(() => {
    if ((isOptimizing || isSimulating) && !isCompleted) {
      const interval = setInterval(() => {
        simulateOptimization();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isOptimizing, isSimulating, isCompleted]);

  const simulateOptimization = () => {
    // 如果已完成，不再模拟
    if (isCompleted || metrics.currentIteration >= metrics.totalIterations) {
      return;
    }

    setMetrics((prev) => {
      const newIteration = Math.min(prev.currentIteration + 1, prev.totalIterations);
      const baseValue = 1000;
      const noise = Math.random() * 100;
      const trend = (newIteration / prev.totalIterations) * 800;
      const currentValue = baseValue - trend + noise;
      const bestValue = Math.min(prev.bestSolution || currentValue, currentValue);
      const convergence = newIteration / prev.totalIterations;
      const fitness = 1 - convergence + Math.random() * 0.1;

      // 更新收敛数据
      setConvergenceData((prev) => [
        ...prev,
        { iteration: newIteration, value: currentValue },
      ]);

      // 添加日志
      if (newIteration % 10 === 0) {
        const newLog: OptimizationLog = {
          timestamp: new Date().toISOString(),
          iteration: newIteration,
          message: `迭代 ${newIteration}: 当前解 = ${currentValue.toFixed(2)}, 最佳解 = ${bestValue.toFixed(2)}`,
          type: 'info',
        };
        setLogs((prev) => [...prev.slice(-20), newLog]);
      }

      return {
        ...prev,
        currentIteration: newIteration,
        currentSolution: currentValue,
        bestSolution: bestValue,
        convergence,
        fitnessScore: fitness,
      };
    });
  };

  const startSimulation = () => {
    // 清除之前保存的状态
    localStorage.removeItem(`optimization-${taskId}`);

    // 重置状态
    setConvergenceData([]);
    setLogs([]);
    setMetrics({
      currentIteration: 0,
      totalIterations: 100,
      bestSolution: 0,
      currentSolution: 0,
      convergence: 0,
      fitnessScore: 0,
    });
    setIsSimulating(true);
    setIsCompleted(false);
    toast.info('开始优化模拟...');
  };

  const getConvergenceChart = () => {
    if (convergenceData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          等待优化数据...
        </div>
      );
    }

    const maxValue = Math.max(...convergenceData.map((d) => d.value));
    const minValue = Math.min(...convergenceData.map((d) => d.value));
    const range = maxValue - minValue || 1;

    return (
      <svg
        viewBox={`0 0 ${convergenceData.length} 100`}
        className="w-full h-[300px]"
        preserveAspectRatio="none"
      >
        {/* 网格线 */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={convergenceData.length}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}

        {/* 收敛曲线 */}
        <path
          d={convergenceData
            .map((point, index) => {
              const x = index;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 最佳解线 */}
        {metrics.bestSolution > 0 && (
          <line
            x1={0}
            y1={100 - ((metrics.bestSolution - minValue) / range) * 100}
            x2={convergenceData.length}
            y2={100 - ((metrics.bestSolution - minValue) / range) * 100}
            stroke="#22c55e"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        )}
      </svg>
    );
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 优化指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>当前迭代</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.currentIteration} / {metrics.totalIterations}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={(metrics.currentIteration / metrics.totalIterations) * 100}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>最佳解</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {metrics.bestSolution.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              目标值
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>当前解</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {metrics.currentSolution.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4" />
              迭代中
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>收敛度</CardDescription>
            <CardTitle className="text-2xl">
              {(metrics.convergence * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.convergence * 100} />
          </CardContent>
        </Card>
      </div>

      {/* 收敛曲线 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            收敛曲线
          </CardTitle>
          <CardDescription>展示优化过程中的目标函数值变化</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-white">
            {getConvergenceChart()}
          </div>
        </CardContent>
      </Card>

      {/* 优化日志 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                优化日志
              </CardTitle>
              <CardDescription>实时优化过程记录</CardDescription>
            </div>
            <div className="flex gap-2">
              {isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem(`optimization-${taskId}`);
                    setIsCompleted(false);
                    setConvergenceData([]);
                    setLogs([]);
                    setMetrics({
                      currentIteration: 0,
                      totalIterations: 100,
                      bestSolution: 0,
                      currentSolution: 0,
                      convergence: 0,
                      fitnessScore: 0,
                    });
                    toast.info('状态已清除，可以重新开始优化');
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  清除状态
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  startSimulation();
                  onRefresh?.();
                }}
                disabled={isSimulating || isOptimizing || isCompleted}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    优化完成
                  </>
                ) : isSimulating || isOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    优化中...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    开始优化
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] bg-gray-900 rounded-lg p-4">
            <div className="space-y-2">
              {logs.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-10">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>优化已完成</p>
                      <p className="text-xs mt-2">最佳解: {metrics.bestSolution.toFixed(2)}</p>
                    </>
                  ) : isSimulating || isOptimizing ? (
                    '正在优化中...'
                  ) : (
                    '点击"开始优化"按钮启动优化过程'
                  )}
                </div>
              )}
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 font-mono text-xs min-w-[80px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {getLogIcon(log.type)}
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-green-400'
                        : log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'warning'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
