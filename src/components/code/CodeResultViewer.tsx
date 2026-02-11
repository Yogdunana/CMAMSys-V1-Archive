'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
}

interface CodeResultViewerProps {
  code: string;
  language: string;
  input?: string;
  onExecute?: (result: CodeExecutionResult) => void;
}

export function CodeResultViewer({
  code,
  language,
  input,
  onExecute,
}: CodeResultViewerProps) {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleExecute = async () => {
    setExecuting(true);
    setResult(null);

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          code,
          language: language.toUpperCase(),
          input: input || '',
        }),
      });

      const data = await response.json();
      const executionResult: CodeExecutionResult = {
        success: data.success,
        output: data.output || '',
        error: data.error,
        executionTime: data.executionTime || 0,
        memoryUsage: data.memoryUsage,
      };

      setResult(executionResult);
      onExecute?.(executionResult);
    } catch (error) {
      setResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result?.output || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderOutput = (output: string) => {
    // 尝试解析 JSON 输出
    try {
      const json = JSON.parse(output);
      return (
        <div className="space-y-2">
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            {JSON.stringify(json, null, 2)}
          </SyntaxHighlighter>
        </div>
      );
    } catch {
      // 检测是否是表格格式
      const lines = output.trim().split('\n');
      if (lines.length > 2 && lines[0].includes('|')) {
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, index) => {
                  const cells = line.split('|').filter((c, i) => i > 0 && i < line.split('|').length - 1);
                  if (cells.length === 0) return null;

                  return (
                    <tr
                      key={index}
                      className={index === 1 ? 'border-b border-muted' : index > 1 ? 'hover:bg-muted/50' : 'bg-muted'}
                    >
                      {index === 0 ? (
                        cells.map((cell, cellIndex) => (
                          <th
                            key={cellIndex}
                            className="px-4 py-2 text-left font-medium text-sm"
                          >
                            {cell.trim()}
                          </th>
                        ))
                      ) : index === 1 ? (
                        <td colSpan={cells.length} className="px-4 py-1">
                          <div className="h-px bg-border" />
                        </td>
                      ) : (
                        cells.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-2 text-sm"
                          >
                            {cell.trim()}
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      // 检测是否是图表数据（简单的条形图）
      if (lines.some(line => line.match(/^[#\-*]+/))) {
        return (
          <div className="font-mono text-sm whitespace-pre-wrap">
            {lines.map((line, index) => (
              <div key={index} className="py-1">
                {line}
              </div>
            ))}
          </div>
        );
      }

      // 普通文本输出
      return (
        <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
          {output}
        </pre>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>代码执行</CardTitle>
              <CardDescription>支持 Python 和 JavaScript</CardDescription>
            </div>
            <Button
              onClick={handleExecute}
              disabled={executing}
              className="gap-2"
            >
              {executing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  执行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  执行代码
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 输入参数面板 */}
      {(input || showInput) && (
        <Card>
          <CardHeader
            className="pb-3 cursor-pointer flex items-center justify-between"
            onClick={() => setShowInput(!showInput)}
          >
            <CardTitle className="flex items-center gap-2 text-base">
              {showInput ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              输入参数
            </CardTitle>
          </CardHeader>
          {showInput && (
            <CardContent>
              <SyntaxHighlighter
                language={language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                {input || ''}
              </SyntaxHighlighter>
            </CardContent>
          )}
        </Card>
      )}

      {/* 执行结果面板 */}
      {result && (
        <>
          {/* 执行状态栏 */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {result.success ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">执行成功</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">执行失败</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {result.executionTime.toFixed(2)}ms
                  </div>
                  {result.memoryUsage && (
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-4 h-4" />
                      {(result.memoryUsage / 1024 / 1024).toFixed(2)}MB
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 输出内容 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  执行结果
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!result.output}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制输出
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                {result.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-mono text-sm">
                    {result.error}
                  </div>
                ) : result.output ? (
                  renderOutput(result.output)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    无输出
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
