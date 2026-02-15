'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  compareTextComprehensive,
  compareTextByLine,
  generateSideBySideComparison,
  generateUnifiedComparison,
  generateChangeSummary,
  detectChangeType,
} from '@/lib/diff-service';

interface EnhancedVersionComparisonProps {
  version1: {
    id: string;
    versionNumber: number;
    title: string;
    content: string;
    wordCount?: number;
    createdAt: string;
  };
  version2: {
    id: string;
    versionNumber: number;
    title: string;
    content: string;
    wordCount?: number;
    createdAt: string;
  };
}

/**
 * 增强版版本对比组件
 */
export function EnhancedVersionComparison({
  version1,
  version2,
}: EnhancedVersionComparisonProps) {
  const [comparisonType, setComparisonType] = useState<'unified' | 'sideBySide' | 'statistics'>('unified');

  // 计算差异
  const diff = React.useMemo(
    () => compareTextComprehensive(version1.content, version2.content),
    [version1.content, version2.content]
  );

  const changeType = React.useMemo(
    () => detectChangeType(version1.content, version2.content),
    [version1.content, version2.content]
  );

  const sideBySideComparison = React.useMemo(
    () => generateSideBySideComparison(version1.content, version2.content),
    [version1.content, version2.content]
  );

  const unifiedComparison = React.useMemo(
    () => generateUnifiedComparison(version1.content, version2.content),
    [version1.content, version2.content]
  );

  const changeSummary = React.useMemo(
    () => generateChangeSummary(version1.content, version2.content),
    [version1.content, version2.content]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          版本对比
        </CardTitle>
        <CardDescription>
          对比版本 v{version1.versionNumber} 和 v{version2.versionNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 变更摘要 */}
        <div className="mb-6 p-4 bg-muted rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">变更摘要</h4>
            <Badge variant={changeType.isMajorRevision ? 'default' : 'secondary'}>
              {changeType.isMajorRevision ? '重大修订' : '常规修改'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{changeSummary}</p>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span>新增: {diff.statistics.addedLines} 行</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span>删除: {diff.statistics.removedLines} 行</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="w-3 h-3" />
              <span>变化: {changeType.changePercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 标题变化 */}
        {version1.title !== version2.title && (
          <div className="mb-6 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">标题变化</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">v{version1.versionNumber}:</span>
                <span className="line-through text-red-500">{version1.title}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">v{version2.versionNumber}:</span>
                <span className="text-green-600 font-medium">{version2.title}</span>
              </div>
            </div>
          </div>
        )}

        {/* 标签页 */}
        <Tabs value={comparisonType} onValueChange={(v) => setComparisonType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unified">统一视图</TabsTrigger>
            <TabsTrigger value="sideBySide">并排视图</TabsTrigger>
            <TabsTrigger value="statistics">统计信息</TabsTrigger>
          </TabsList>

          <TabsContent value="unified" className="mt-4">
            <ScrollArea className="h-[500px] border rounded-md">
              <div
                className="p-4 font-mono text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: unifiedComparison }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sideBySide" className="mt-4">
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <ScrollArea className="h-full border rounded-md">
                <div className="p-3 bg-muted/50 border-b">
                  <div className="text-sm font-medium">
                    版本 v{version1.versionNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(version1.createdAt)}
                  </div>
                </div>
                <div
                  className="p-4 font-mono text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sideBySideComparison.oldSide }}
                />
              </ScrollArea>

              <ScrollArea className="h-full border rounded-md">
                <div className="p-3 bg-muted/50 border-b">
                  <div className="text-sm font-medium">
                    版本 v{version2.versionNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(version2.createdAt)}
                  </div>
                </div>
                <div
                  className="p-4 font-mono text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sideBySideComparison.newSide }}
                />
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="mt-4">
            <div className="space-y-4">
              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">版本 {version1.versionNumber}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">字数:</span>
                        <span>{version1.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">行数:</span>
                        <span>{version1.content.split('\n').filter(l => l.trim()).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">词数:</span>
                        <span>{version1.content.split(/\s+/).filter(w => w.trim()).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">版本 {version2.versionNumber}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">字数:</span>
                        <span>{version2.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">行数:</span>
                        <span>{version2.content.split('\n').filter(l => l.trim()).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">词数:</span>
                        <span>{version2.content.split(/\s+/).filter(w => w.trim()).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 变更统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">变更统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">新增行数:</span>
                      <Badge variant="default" className="text-green-600">
                        +{diff.statistics.addedLines}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">删除行数:</span>
                      <Badge variant="destructive">
                        -{diff.statistics.removedLines}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">新增词数:</span>
                      <Badge variant="default" className="text-green-600">
                        +{diff.statistics.addedWords}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">删除词数:</span>
                      <Badge variant="destructive">
                        -{diff.statistics.removedWords}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">总变化:</span>
                      <Badge>{diff.statistics.totalChanges}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">变化百分比:</span>
                      <Badge>{changeType.changePercentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 变更类型 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">变更类型</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${changeType.isMinorEdit ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">小幅编辑</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${changeType.isMajorRevision ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">重大修订</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${changeType.isContentAddition ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">内容扩充</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${changeType.isContentRemoval ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">内容精简</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
