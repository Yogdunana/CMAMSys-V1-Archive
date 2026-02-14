'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5" />
          优化状态可视化
        </CardTitle>
        <CardDescription>
          等待真实优化数据 API 开发完成
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            优化状态可视化功能正在开发中，将显示真实的优化过程数据、收敛曲线和实时日志。
            目前请在"代码执行"标签页中查看代码运行结果。
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
