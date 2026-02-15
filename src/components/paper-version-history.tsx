'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Eye, RotateCcw, Trash2, History, FileText } from 'lucide-react';

interface PaperVersion {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  changeDescription?: string;
  isMajorVersion: boolean;
  createdAt: string;
  wordCount?: number;
}

interface PaperVersionHistoryProps {
  paperId: string;
  onRestore?: (versionNumber: number) => Promise<void>;
  onDelete?: (versionNumber: number) => Promise<void>;
  refreshTrigger?: number;
}

/**
 * 论文版本历史组件
 * 显示论文的所有历史版本，支持查看、恢复和删除
 */
export function PaperVersionHistory({
  paperId,
  onRestore,
  onDelete,
  refreshTrigger,
}: PaperVersionHistoryProps) {
  const [versions, setVersions] = useState<PaperVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<PaperVersion | null>(null);
  const [previewVersion, setPreviewVersion] = useState<PaperVersion | null>(null);
  const [comparingVersions, setComparingVersions] = useState<{ v1: PaperVersion; v2: PaperVersion } | null>(null);

  // 加载版本历史
  useEffect(() => {
    loadVersions();
  }, [paperId, refreshTrigger]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/papers/${paperId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: PaperVersion) => {
    if (!confirm(`确定要将论文恢复到版本 ${version.versionNumber} 吗？当前内容将被覆盖。`)) {
      return;
    }

    try {
      if (onRestore) {
        await onRestore(version.versionNumber);
      } else {
        const response = await fetch(`/api/papers/${paperId}/versions/${version.versionNumber}/restore`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to restore version');
        }
      }

      // 刷新版本列表
      await loadVersions();
      alert(`已恢复到版本 ${version.versionNumber}`);
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('恢复版本失败');
    }
  };

  const handleDelete = async (version: PaperVersion) => {
    if (!confirm(`确定要删除版本 ${version.versionNumber} 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      if (onDelete) {
        await onDelete(version.versionNumber);
      } else {
        const response = await fetch(`/api/papers/${paperId}/versions/${version.versionNumber}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete version');
        }
      }

      // 刷新版本列表
      await loadVersions();
      alert(`已删除版本 ${version.versionNumber}`);
    } catch (error) {
      console.error('Failed to delete version:', error);
      alert('删除版本失败');
    }
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>版本历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>版本历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">暂无版本历史</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          版本历史
        </CardTitle>
        <CardDescription>共 {versions.length} 个版本</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {versions.map((version, index) => (
              <Card
                key={version.id}
                className={`p-4 hover:bg-muted/50 transition-colors ${
                  selectedVersion?.id === version.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        v{version.versionNumber}
                      </Badge>
                      {version.isMajorVersion && (
                        <Badge variant="outline">主要版本</Badge>
                      )}
                      {index === 0 && (
                        <Badge variant="outline">最新</Badge>
                      )}
                    </div>

                    <h4 className="font-medium truncate mb-1">{version.title}</h4>

                    {version.changeDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {version.changeDescription}
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground flex items-center gap-4">
                      <span>{formatDate(version.createdAt)}</span>
                      {version.wordCount && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {version.wordCount} 字
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewVersion(version)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>版本 v{version.versionNumber}</DialogTitle>
                          <DialogDescription>
                            {formatDate(version.createdAt)}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap">{version.content}</pre>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    {index !== 0 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(version)}
                          title="恢复到此版本"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(version)}
                          title="删除此版本"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * 版本对比组件
 */
export function VersionComparison({
  version1,
  version2,
}: {
  version1: PaperVersion;
  version2: PaperVersion;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          版本对比
        </CardTitle>
        <CardDescription>
          对比版本 v{version1.versionNumber} 和 v{version2.versionNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>标题变化</Label>
          <div className="mt-2 p-3 bg-muted rounded-md">
            {version1.title !== version2.title ? (
              <>
                <div className="text-sm line-through text-muted-foreground">{version1.title}</div>
                <div className="text-sm font-medium">{version2.title}</div>
              </>
            ) : (
              <div className="text-sm">{version1.title}</div>
            )}
          </div>
        </div>

        <div>
          <Label>字数变化</Label>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-4 text-sm">
              <span>
                版本 {version1.versionNumber}: {version1.wordCount || 0} 字
              </span>
              <ArrowRight className="w-4 h-4" />
              <span>
                版本 {version2.versionNumber}: {version2.wordCount || 0} 字
              </span>
              <Badge variant={version2.wordCount && version1.wordCount && version2.wordCount > version1.wordCount ? 'default' : 'secondary'}>
                {(version2.wordCount || 0) - (version1.wordCount || 0)} 字
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <Label>内容对比</Label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-md">
              <div className="text-xs text-muted-foreground mb-2">版本 {version1.versionNumber}</div>
              <pre className="text-xs whitespace-pre-wrap max-h-[300px] overflow-auto">
                {version1.content}
              </pre>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-xs text-muted-foreground mb-2">版本 {version2.versionNumber}</div>
              <pre className="text-xs whitespace-pre-wrap max-h-[300px] overflow-auto">
                {version2.content}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
