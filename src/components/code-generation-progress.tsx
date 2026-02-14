'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code2, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface CodeGenerationProgressProps {
  taskId: string;
  isGenerating: boolean;
  onComplete?: () => void;
}

export default function CodeGenerationProgress({
  taskId,
  isGenerating,
  onComplete,
}: CodeGenerationProgressProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'generating' | 'validating' | 'completed' | 'failed'>('idle');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<ReadableStreamDefaultReader | null>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs]);

  // 开始连接 SSE
  useEffect(() => {
    if (!isGenerating) return;

    const startSSE = async () => {
      try {
        setStatus('generating');
        setCurrentStep('正在初始化...');
        setLogs([
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: '🚀 开始连接进度流...',
          },
        ]);

        const token = localStorage.getItem('accessToken');

        const response = await fetch(`/api/auto-modeling/${taskId}/generation-logs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('无法获取响应流');
        }

        eventSourceRef.current = reader;

        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            // 处理 SSE 数据行（以 data: 开头，以 \n\n 结尾）
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const match = line.match(/^data: (.+)$/);
              if (match) {
                try {
                  const data = JSON.parse(match[1]);

                  if (data.type === 'log') {
                    setLogs((prev) => [...prev, data.log]);

                    // 更新当前步骤
                    if (data.log.message.includes('调用 AI')) {
                      setCurrentStep('正在调用 AI Provider 生成代码...');
                    } else if (data.log.message.includes('验证代码语法')) {
                      setCurrentStep('正在验证代码语法...');
                      setStatus('validating');
                    } else if (data.log.message.includes('检查代码基本要求')) {
                      setCurrentStep('正在检查代码基本要求...');
                    } else if (data.log.message.includes('快速执行验证')) {
                      setCurrentStep('正在快速执行验证...');
                    }
                  } else if (data.type === 'complete') {
                    if (data.success) {
                      setStatus('completed');
                      setCurrentStep('代码生成完成');
                      onComplete?.();
                    } else {
                      setStatus('failed');
                      setCurrentStep('代码生成失败');
                    }
                    return;
                  }
                } catch (e) {
                  console.error('解析 SSE 数据失败:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        console.error('连接 SSE 失败:', error);
        setStatus('failed');
        setCurrentStep('连接失败');
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `❌ 连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
          },
        ]);
      }
    };

    startSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.cancel();
        eventSourceRef.current = null;
      }
    };
  }, [isGenerating, taskId, onComplete]);

  if (status === 'idle' && !isGenerating) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          代码生成进度
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 当前状态 */}
        <div className="flex items-center gap-3">
          {status === 'generating' || status === 'validating' ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="font-medium">{currentStep}</span>
          {retryCount > 0 && (
            <Badge variant="secondary">重试次数: {retryCount}</Badge>
          )}
        </div>

        {/* 进度条 */}
        {status === 'generating' || status === 'validating' ? (
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min((logs.length / 4) * 100, 100)}%` }}
            />
          </div>
        ) : null}

        {/* 日志输出 */}
        <ScrollArea className="h-[300px] bg-gray-900 rounded-lg p-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-gray-500 text-xs flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                </span>
                {log.level === 'info' ? (
                  <span className="text-blue-400">{log.message}</span>
                ) : log.level === 'warn' ? (
                  <span className="text-yellow-400">⚠️ {log.message}</span>
                ) : log.level === 'error' ? (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {log.message}
                  </span>
                ) : (
                  <span className="text-green-400">{log.message}</span>
                )}
              </div>
            ))}
            {status === 'generating' || status === 'validating' ? (
              <div className="flex gap-2 text-sm text-gray-500">
                <span className="text-gray-500 text-xs flex-shrink-0">
                  {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
                </span>
                <span>等待更新...</span>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
