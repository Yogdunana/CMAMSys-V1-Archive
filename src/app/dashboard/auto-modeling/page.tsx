'use client';

import React, { useState } from 'react';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  Code,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AutoModelingPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new-task');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // 新任务表单
  const [formData, setFormData] = useState({
    competitionType: '',
    problemType: '',
    problemTitle: '',
    problemContent: '',
    paperFormat: 'MCM',
    paperLanguage: 'ENGLISH',
  });

  // 任务状态
  const [taskStatus, setTaskStatus] = useState<any>(null);

  const handleStartAutoProcess = async () => {
    if (!formData.competitionType || !formData.problemType || !formData.problemTitle || !formData.problemContent) {
      toast.error('请填写完整的赛题信息');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auto-modeling/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setActiveTab('task-status');
        // 开始轮询任务状态
        // TODO: 实现状态轮询
      } else {
        toast.error(data.error || '启动失败');
      }
    } catch (error) {
      console.error('启动自动化流程失败:', error);
      toast.error('启动失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'DISCUSSING':
        return <MessageSquare className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'CODING':
        return <Code className="h-5 w-5 text-purple-500 animate-pulse" />;
      case 'VALIDATING':
        return <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />;
      case 'RETRYING':
        return <AlertTriangle className="h-5 w-5 text-orange-500 animate-pulse" />;
      case 'PAPER_GENERATING':
        return <FileText className="h-5 w-5 text-cyan-500 animate-pulse" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getOverallStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '待开始',
      DISCUSSING: '群聊讨论中',
      CODING: '代码生成中',
      VALIDATING: '自动校验中',
      RETRYING: '回溯优化中',
      PAPER_GENERATING: '论文生成中',
      COMPLETED: '已完成',
      FAILED: '失败',
    };
    return statusMap[status] || status;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              全自动化数学建模系统
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              从群聊讨论到论文生成，全程无需人工干预
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="new-task">
                <Rocket className="w-4 h-4 mr-2" />
                新建任务
              </TabsTrigger>
              <TabsTrigger value="task-status">
                <Clock className="w-4 h-4 mr-2" />
                任务状态
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-task" className="mt-6">
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    创建全自动化建模任务
                  </CardTitle>
                  <CardDescription>
                    输入赛题信息，系统将自动完成讨论、代码生成、校验、论文生成全流程
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="competitionType">竞赛类型 *</Label>
                      <Select
                        value={formData.competitionType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, competitionType: value })
                        }
                      >
                        <SelectTrigger id="competitionType">
                          <SelectValue placeholder="选择竞赛类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MCM">美赛（MCM）</SelectItem>
                          <SelectItem value="ICM">美赛（ICM）</SelectItem>
                          <SelectItem value="CUMCM">国赛（CUMCM）</SelectItem>
                          <SelectItem value="SHENZHEN_CUP">深圳杯</SelectItem>
                          <SelectItem value="IMMC">IMMC</SelectItem>
                          <SelectItem value="MATHORCUP">MathorCup</SelectItem>
                          <SelectItem value="EMMC">EMMC</SelectItem>
                          <SelectItem value="TEDDY_CUP">泰迪杯</SelectItem>
                          <SelectItem value="BLUE_BRIDGE_MATH">蓝桥杯数学</SelectItem>
                          <SelectItem value="REGIONAL">区域性竞赛</SelectItem>
                          <SelectItem value="OTHER">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="problemType">题目类型 *</Label>
                      <Select
                        value={formData.problemType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, problemType: value })
                        }
                      >
                        <SelectTrigger id="problemType">
                          <SelectValue placeholder="选择题目类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EVALUATION">评价题</SelectItem>
                          <SelectItem value="PREDICTION">预测题</SelectItem>
                          <SelectItem value="OPTIMIZATION">优化题</SelectItem>
                          <SelectItem value="CLASSIFICATION">分类题</SelectItem>
                          <SelectItem value="REGRESSION">回归题</SelectItem>
                          <SelectItem value="CLUSTERING">聚类题</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemTitle">题目标题 *</Label>
                    <Input
                      id="problemTitle"
                      placeholder="输入题目标题"
                      value={formData.problemTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, problemTitle: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemContent">题目内容 *</Label>
                    <Textarea
                      id="problemContent"
                      placeholder="粘贴完整的题目内容..."
                      value={formData.problemContent}
                      onChange={(e) =>
                        setFormData({ ...formData, problemContent: e.target.value })
                      }
                      rows={10}
                    />
                    <p className="text-sm text-slate-500">
                      提示：请粘贴完整的题目内容，包括背景、要求、数据等信息
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paperFormat">论文格式</Label>
                      <Select
                        value={formData.paperFormat}
                        onValueChange={(value) =>
                          setFormData({ ...formData, paperFormat: value })
                        }
                      >
                        <SelectTrigger id="paperFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MCM">美赛格式</SelectItem>
                          <SelectItem value="CUMCM">国赛格式</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paperLanguage">论文语言</Label>
                      <Select
                        value={formData.paperLanguage}
                        onValueChange={(value) =>
                          setFormData({ ...formData, paperLanguage: value })
                        }
                      >
                        <SelectTrigger id="paperLanguage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENGLISH">英文</SelectItem>
                          <SelectItem value="CHINESE">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      全自动化流程将依次执行：群聊讨论（1-2轮）→ 代码生成 → 自动校验（带回溯，最多3次）→ 论文生成。
                      整个过程无需人工干预，预计耗时 5-15 分钟。
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData({
                          competitionType: '',
                          problemType: '',
                          problemTitle: '',
                          problemContent: '',
                          paperFormat: 'MCM',
                          paperLanguage: 'ENGLISH',
                        })
                      }
                    >
                      重置
                    </Button>
                    <Button
                      onClick={handleStartAutoProcess}
                      disabled={loading}
                      className="min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          启动中...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          一键启动全自动化
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="task-status" className="mt-6">
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle>任务状态</CardTitle>
                  <CardDescription>
                    查看自动化任务的执行进度和结果
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>暂无运行中的任务</p>
                    <p className="text-sm mt-2">在"新建任务"标签页创建任务后，此处将显示执行状态</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
