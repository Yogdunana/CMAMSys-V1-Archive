'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Play, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface CodeExecutionLogViewerProps {
  taskId: string;
  autoScroll?: boolean;
}

export default function CodeExecutionLogViewer({ taskId, autoScroll = true }: CodeExecutionLogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startExecution = async () => {
    try {
      setIsExecuting(true);
      setStatus('running');
      setLogs([]);
      setExecutionTime(0);

      // 获取 Token
      const token = localStorage.getItem('accessToken');

      // 使用 fetch + ReadableStream 替代 EventSource，以支持自定义请求头
      const response = await fetch(`/api/auto-modeling/${taskId}/execution-logs`, {
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

      // 计时器
      const timer = setInterval(() => {
        setExecutionTime((prev) => prev + 1);
      }, 1000);

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            clearInterval(timer);
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
                } else if (data.type === 'complete') {
                  setStatus(data.success ? 'success' : 'error');
                  setIsExecuting(false);
                  clearInterval(timer);
                  return;
                } else if (data.type === 'error') {
                  setStatus('error');
                  setIsExecuting(false);
                  clearInterval(timer);
                  return;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            } else if (line.includes(': heartbeat')) {
              // 心跳包，忽略
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
        clearInterval(timer);
      }

    } catch (error) {
      console.error('Failed to start execution:', error);
      setStatus('error');
      setIsExecuting(false);

      // 添加错误日志
      setLogs((prev) => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }]);
    }
  };

  const stopExecution = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsExecuting(false);
    setStatus('idle');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Terminal className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Terminal className="h-4 w-4" />;
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            代码执行日志
          </CardTitle>
          <div className="flex items-center gap-2">
            {isExecuting && (
              <Badge variant="outline" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                运行中 {executionTime}s
              </Badge>
            )}
            {!isExecuting && status === 'success' && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                执行成功
              </Badge>
            )}
            {!isExecuting && status === 'error' && (
              <Badge variant="outline" className="bg-red-50 text-red-700">
                <XCircle className="h-3 w-3 mr-1" />
                执行失败
              </Badge>
            )}
            {!isExecuting && !isExecuting && status === 'idle' && (
              <Badge variant="outline">
                等待执行
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              disabled={isExecuting || logs.length === 0}
            >
              清空日志
            </Button>
            {!isExecuting ? (
              <Button size="sm" onClick={startExecution}>
                <Play className="h-4 w-4 mr-1" />
                执行
              </Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={stopExecution}>
                停止
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4" ref={scrollAreaRef}>
          {logs.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Terminal className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>点击"执行"按钮开始运行代码</p>
                <p className="text-sm mt-1">将实时显示控制台输出和日志</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                  <span className="text-muted-foreground text-xs flex-shrink-0">
                    {log.timestamp}
                  </span>
                  <Badge className={`flex-shrink-0 ${getLevelBadgeColor(log.level)}`} variant="secondary">
                    {getLevelIcon(log.level)}
                    <span className="ml-1">{log.level.toUpperCase()}</span>
                  </Badge>
                  <pre className="flex-1 whitespace-pre-wrap break-words">{log.message}</pre>
                </div>
              ))}
              {isExecuting && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>等待新日志...</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
