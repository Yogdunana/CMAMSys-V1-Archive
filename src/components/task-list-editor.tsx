'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ArrowUp, ArrowDown, CheckCircle2, XCircle, AlertTriangle, BarChart3, Users, Sparkles, History, LayoutTemplate, SortAsc, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { checkTaskListQuality, formatQualityReport, TaskListQualityReport } from '@/services/task-list-quality-check';
import { TaskVisualization } from '@/components/task-visualization';
import { TaskWithDependencies } from '@/services/task-dependencies';
import { sortTasksSmartly } from '@/services/smart-task-sorter';
import { applyTemplate, getAvailableTemplates } from '@/services/task-templates';
import { getTaskVersionHistory, createTaskVersion, restoreTaskVersion } from '@/services/task-version-history';
import { optimizeTaskList } from '@/services/task-ai-optimizer';

interface TaskListEditorProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  initialTaskList: string[];
  onSave: (taskList: string[]) => void;
}

export function TaskListEditor({ isOpen, onClose, taskId, initialTaskList, onSave }: TaskListEditorProps) {
  const [tasks, setTasks] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [qualityReport, setQualityReport] = useState<TaskListQualityReport | null>(null);
  const [showQualityReport, setShowQualityReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'visualize' | 'collaboration'>('edit');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [collaborators, setCollaborators] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);

  // 初始化任务列表
  useEffect(() => {
    if (isOpen && initialTaskList) {
      setTasks([...initialTaskList]);
      setQualityReport(null);
      setShowQualityReport(false);
      // 加载版本历史
      loadVersionHistory();
    }
  }, [isOpen, initialTaskList]);

  // 加载版本历史
  const loadVersionHistory = async () => {
    try {
      const history = await getTaskVersionHistory(taskId);
      setVersionHistory(history);
    } catch (error) {
      console.error('加载版本历史失败:', error);
    }
  };

  // 添加新任务
  const addTask = () => {
    setTasks([...tasks, '']);
  };

  // 删除任务
  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    // 重新检查质量
    if (qualityReport) {
      checkQuality();
    }
  };

  // 更新任务内容
  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  // 上移任务
  const moveUp = (index: number) => {
    if (index > 0) {
      const newTasks = [...tasks];
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
      setTasks(newTasks);
      // 重新检查质量
      if (qualityReport) {
        checkQuality();
      }
    }
  };

  // 下移任务
  const moveDown = (index: number) => {
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
      setTasks(newTasks);
      // 重新检查质量
      if (qualityReport) {
        checkQuality();
      }
    }
  };

  // 检查任务列表质量
  const checkQuality = async () => {
    const validTasks = tasks.filter(t => t.trim().length > 0);
    if (validTasks.length === 0) {
      toast.error('请先添加至少一个任务');
      return;
    }

    const report = await checkTaskListQuality(validTasks);
    setQualityReport(report);
    setShowQualityReport(true);

    if (report.isValid) {
      toast.success(`质量评分: ${report.overallScore}/100`);
    } else {
      toast.warning(`质量评分: ${report.overallScore}/100，建议查看改进建议`);
    }
  };

  // 智能排序任务
  const handleSmartSort = async () => {
    const validTasks = tasks.filter(t => t.trim().length > 0);
    if (validTasks.length === 0) {
      toast.error('请先添加任务');
      return;
    }

    try {
      const sortedTasks = await sortTasksSmartly(validTasks);
      setTasks(sortedTasks);
      toast.success('任务已按最佳顺序排序');
      // 重新检查质量
      if (qualityReport) {
        checkQuality();
      }
    } catch (error) {
      console.error('智能排序失败:', error);
      toast.error('智能排序失败');
    }
  };

  // 应用模板
  const handleApplyTemplate = async (templateName: string) => {
    try {
      const templateTasks = await applyTemplate(templateName);
      setTasks(templateTasks);
      toast.success(`已应用模板: ${templateName}`);
      // 重新检查质量
      if (qualityReport) {
        checkQuality();
      }
    } catch (error) {
      console.error('应用模板失败:', error);
      toast.error('应用模板失败');
    }
  };

  // AI 优化任务列表
  const handleAIOptimize = async () => {
    const validTasks = tasks.filter(t => t.trim().length > 0);
    if (validTasks.length === 0) {
      toast.error('请先添加任务');
      return;
    }

    setIsOptimizing(true);
    try {
      const optimizedTasks = await optimizeTaskList(validTasks, taskId);
      setTasks(optimizedTasks);
      toast.success('AI 优化完成');
      // 重新检查质量
      checkQuality();
    } catch (error) {
      console.error('AI 优化失败:', error);
      toast.error('AI 优化失败');
    } finally {
      setIsOptimizing(false);
    }
  };

  // 保存版本
  const handleSaveVersion = async () => {
    const validTasks = tasks.filter(t => t.trim().length > 0);
    try {
      await createTaskVersion(taskId, validTasks, '手动保存版本');
      await loadVersionHistory();
      toast.success('版本已保存');
    } catch (error) {
      console.error('保存版本失败:', error);
      toast.error('保存版本失败');
    }
  };

  // 恢复版本
  const handleRestoreVersion = async (versionId: string) => {
    try {
      const restoredVersion = await restoreTaskVersion(taskId, versionId);
      if (restoredVersion) {
        setTasks(restoredVersion.taskList);
        await loadVersionHistory();
        toast.success('版本已恢复');
      } else {
        toast.error('版本不存在');
      }
    } catch (error) {
      console.error('恢复版本失败:', error);
      toast.error('恢复版本失败');
    }
  };

  // 保存任务列表
  const handleSave = async () => {
    const validTasks = tasks.filter(t => t.trim().length > 0);

    if (validTasks.length === 0) {
      toast.error('任务列表不能为空');
      return;
    }

    if (validTasks.length < 3) {
      toast.error('至少需要 3 个任务');
      return;
    }

    if (validTasks.length > 15) {
      toast.error('任务列表不能超过 15 个任务');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/auto-modeling/${taskId}/task-list`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ taskList: validTasks }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '保存失败');
      }

      toast.success('任务列表已保存');
      onSave(validTasks);
      onClose();
    } catch (error) {
      console.error('保存任务列表失败:', error);
      toast.error('保存任务列表失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>任务列表高级管理</DialogTitle>
              <DialogDescription>
                调整任务列表、查看可视化分析、管理协作和版本历史
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    模板
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {getAvailableTemplates().map((template) => (
                    <DropdownMenuItem key={template.name} onClick={() => handleApplyTemplate(template.name)}>
                      {template.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    版本历史
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {versionHistory.length === 0 ? (
                    <DropdownMenuItem disabled>暂无版本历史</DropdownMenuItem>
                  ) : (
                    versionHistory.map((version) => (
                      <DropdownMenuItem key={version.id} onClick={() => handleRestoreVersion(version.id)}>
                        {new Date(version.createdAt).toLocaleString()}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="visualize">可视化分析</TabsTrigger>
            <TabsTrigger value="collaboration">协作与高级</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-4">
            <div className="flex gap-4">
              {/* 左侧：任务列表编辑 */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <Label>任务列表 ({tasks.length})</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSmartSort}
                      disabled={tasks.filter(t => t.trim()).length === 0}
                    >
                      <SortAsc className="h-4 w-4 mr-1" />
                      智能排序
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTask}
                      disabled={isSaving || tasks.length >= 15}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      添加任务
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={checkQuality}
                      disabled={tasks.filter(t => t.trim()).length === 0}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      检查质量
                    </Button>
                  </div>
                </div>

            <ScrollArea className="h-[400px] rounded-md border p-2">
              {tasks.map((task, index) => (
                <div key={index} className="mb-3 p-3 bg-muted/50 rounded-lg group">
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      placeholder={`任务 ${index + 1}`}
                      disabled={isSaving}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveUp(index)}
                        disabled={isSaving || index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveDown(index)}
                        disabled={isSaving || index === tasks.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTask(index)}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* 右侧：质量报告 */}
          {showQualityReport && qualityReport && (
            <div className="w-1/3 flex flex-col gap-2">
              <Label>质量报告</Label>
              <ScrollArea className="flex-1 rounded-md border p-3 h-[400px]">
                <div className="space-y-4">
                  {/* 总体评分 */}
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">
                      {qualityReport.overallScore}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                    <Badge
                      variant={qualityReport.isValid ? 'default' : 'destructive'}
                      className="mt-2"
                    >
                      {qualityReport.isValid ? '✅ 通过' : '❌ 未达标'}
                    </Badge>
                  </div>

                  {/* 详细指标 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>完整性</span>
                      <span>{qualityReport.metrics.completeness}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>覆盖度</span>
                      <span>{qualityReport.metrics.coverage}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>清晰度</span>
                      <span>{qualityReport.metrics.clarity}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>顺序性</span>
                      <span>{qualityReport.metrics.ordering}/100</span>
                    </div>
                  </div>

                  {/* 发现的问题 */}
                  {qualityReport.issues.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">发现问题</Label>
                      {qualityReport.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="p-2 rounded border-l-4 text-sm"
                          style={{
                            borderColor:
                              issue.severity === 'error'
                                ? '#ef4444'
                                : issue.severity === 'warning'
                                ? '#f59e0b'
                                : '#3b82f6',
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {issue.severity === 'error' && (
                              <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                            )}
                            {issue.severity === 'warning' && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            )}
                            {issue.severity === 'info' && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-medium">{issue.message}</div>
                              {issue.suggestion && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  建议: {issue.suggestion}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 改进建议 */}
                  {qualityReport.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">改进建议</Label>
                      {qualityReport.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          </div>
          </TabsContent>

          <TabsContent value="visualize" className="mt-4">
            <TaskVisualization tasks={tasks.map((task, index) => ({
              id: index + 1,
              text: task,
              status: 'pending' as const,
              dependencies: [],
              dependents: [],
            }))} />
          </TabsContent>

          <TabsContent value="collaboration" className="mt-4">
            <div className="space-y-6">
              {/* 协作状态 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5" />
                  实时协作
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm">在线协作者: {collaborators}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    支持多人实时编辑和评论
                  </div>
                </div>
              </div>

              {/* AI 优化 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5" />
                  AI 辅助优化
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    使用 AI 自动优化任务描述，补充缺失阶段，提升任务列表质量
                  </div>
                  <Button
                    onClick={handleAIOptimize}
                    disabled={isOptimizing || tasks.filter(t => t.trim()).length === 0}
                    className="w-full"
                  >
                    {isOptimizing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        优化中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        开始 AI 优化
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 版本管理 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <History className="h-5 w-5" />
                  版本历史
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      共 {versionHistory.length} 个历史版本
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveVersion}
                      disabled={tasks.filter(t => t.trim()).length === 0}
                    >
                      保存当前版本
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    {versionHistory.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        暂无版本历史
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {versionHistory.map((version) => (
                          <div
                            key={version.id}
                            className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                            onClick={() => handleRestoreVersion(version.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-medium">
                                {new Date(version.createdAt).toLocaleString()}
                              </div>
                              <Badge variant="outline">
                                {version.taskList.length} 个任务
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
