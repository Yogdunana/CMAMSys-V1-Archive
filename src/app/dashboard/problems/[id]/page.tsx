/**
 * Problem Detail Page
 * 题目详情页面
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SolutionDialog } from '@/components/solutions/solution-dialog';
import {
  ArrowLeft,
  FileText,
  BarChart3,
  Database,
  BookOpen,
  Award,
  Cpu,
  Download,
  ExternalLink,
  Clock,
  Tag,
  TrendingUp,
  Code,
  Image as ImageIcon,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';

interface Problem {
  id: string;
  problemNumber: string;
  title: string;
  originalContent: string;
  translatedContent: string;
  type?: string;
  difficulty?: string;
  keywords: string[];
  originalFileUrl?: string;
  translatedFileUrl?: string;
  createdAt: string;
  competition: {
    id: string;
    name: string;
    type: string;
    year: number;
  };
  solutions: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    content: string;
    author: string;
    awardLevel?: string;
    files?: any;
    aiContents: Array<{
      id: string;
      type: string;
      subProblemNumber?: string;
      content: string;
      fileUrl?: string;
      metadata?: any;
    }>;
  }>;
}

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [solutionDialogOpen, setSolutionDialogOpen] = useState(false);
  const [editingSolution, setEditingSolution] = useState<any>(null);
  const problemId = params.id as string;

  useEffect(() => {
    if (problemId) {
      loadProblem(problemId);
    }
  }, [problemId]);

  const loadProblem = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/problems/${id}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        setProblem(data.data);
      } else {
        router.push('/dashboard/competitions');
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSolution = () => {
    setEditingSolution(null);
    setSolutionDialogOpen(true);
  };

  const handleEditSolution = (solution: any) => {
    setEditingSolution(solution);
    setSolutionDialogOpen(true);
  };

  const handleDeleteSolution = async (solutionId: string) => {
    if (!confirm('确定要删除这个解法吗？此操作不可恢复。')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/solutions/${solutionId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (data.success) {
        // 重新加载题目数据
        loadProblem(problemId);
      } else {
        alert('删除失败：' + (data.error?.message || '未知错误'));
      }
    } catch (error) {
      console.error('Failed to delete solution:', error);
      alert('删除失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>加载题目详情...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">题目不存在</h2>
            <Button onClick={() => router.push('/dashboard/competitions')}>
              返回竞赛列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getSolutionTypeBadge = (type: string) => {
    const config = {
      SYSTEM: { icon: Cpu, color: 'bg-blue-500', label: '系统解法' },
      AWARD: { icon: Award, color: 'bg-yellow-500', label: '获奖解法' },
      AI: { icon: BookOpen, color: 'bg-green-500', label: 'AI 解法' },
    };
    const c = config[type as keyof typeof config] || config.SYSTEM;
    const Icon = c.icon;
    return (
      <Badge className={`${c.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  const getAIContentTypeIcon = (type: string) => {
    const config = {
      PAPER: { icon: FileText, label: '论文', color: 'text-blue-500' },
      DATA: { icon: Database, label: '数据', color: 'text-green-500' },
      CHART: { icon: BarChart3, label: '图表', color: 'text-purple-500' },
    };
    const c = config[type as keyof typeof config] || config.PAPER;
    const Icon = c.icon;
    return <Icon className={`w-4 h-4 ${c.color}`} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/competitions')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回竞赛列表
            </Button>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    题目 {problem.problemNumber}
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{problem.competition.name}</span>
                  <span>•</span>
                  <span>{problem.competition.year}</span>
                  {problem.difficulty && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary">{problem.difficulty}</Badge>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {problem.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {problem.originalFileUrl && (
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    原文
                  </Button>
                )}
                {problem.translatedFileUrl && (
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    翻译
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Problem Content & Solutions */}
          <Tabs defaultValue="problem" className="space-y-4">
            <TabsList>
              <TabsTrigger value="problem">题目内容</TabsTrigger>
              <TabsTrigger value="solutions">解法列表 ({problem.solutions.length})</TabsTrigger>
            </TabsList>

            {/* Problem Content */}
            <TabsContent value="problem" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>题目内容</CardTitle>
                  <CardDescription>
                    题目原文和中文翻译
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="original">
                    <TabsList>
                      <TabsTrigger value="original">题目原文</TabsTrigger>
                      <TabsTrigger value="translated">中文翻译</TabsTrigger>
                    </TabsList>
                    <TabsContent value="original" className="mt-4">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {problem.originalContent || '暂无原文内容'}
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="translated" className="mt-4">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {problem.translatedContent || '暂无翻译内容'}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solutions */}
            <TabsContent value="solutions" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">解法列表</h3>
                  <p className="text-sm text-muted-foreground">
                    共 {problem.solutions.length} 个解法
                  </p>
                </div>
                <Button onClick={handleAddSolution}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加解法
                </Button>
              </div>

              {problem.solutions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">暂无解法</p>
                    <Button onClick={handleAddSolution}>
                      <Plus className="mr-2 h-4 w-4" />
                      添加第一个解法
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                problem.solutions.map((solution) => (
                  <Card key={solution.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSolutionTypeBadge(solution.type)}
                            <CardTitle>{solution.title}</CardTitle>
                          </div>
                          <CardDescription>
                            {solution.author}
                            {solution.awardLevel && (
                              <Badge variant="secondary" className="ml-2">
                                {solution.awardLevel}
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSolution(solution)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSolution(solution.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {solution.description}
                      </p>

                      {/* AI Generated Content */}
                      {solution.aiContents.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold">AI 生成内容</h4>
                          </div>
                          <div className="grid gap-3">
                            {solution.aiContents.map((aiContent) => (
                              <Card key={aiContent.id} className="border-l-4 border-l-primary">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getAIContentTypeIcon(aiContent.type)}
                                      <span className="text-sm font-medium">
                                        {aiContent.type === 'PAPER' && '论文'}
                                        {aiContent.type === 'DATA' && '数据'}
                                        {aiContent.type === 'CHART' && '图表'}
                                      </span>
                                      {aiContent.subProblemNumber && (
                                        <Badge variant="outline" className="text-xs">
                                          子问题 {aiContent.subProblemNumber}
                                        </Badge>
                                      )}
                                    </div>
                                    {aiContent.fileUrl && (
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>

                                  {aiContent.type === 'CHART' && aiContent.fileUrl && (
                                    <div className="mt-3 bg-muted rounded-lg p-4">
                                      <div className="text-center text-sm text-muted-foreground">
                                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                        图表预览
                                      </div>
                                    </div>
                                  )}

                                  {aiContent.type === 'PAPER' && aiContent.content && (
                                    <div className="mt-3 text-sm bg-muted/50 rounded-lg p-3 max-h-96 overflow-y-auto">
                                      <div className="prose prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap font-sans">
                                          {aiContent.content.substring(0, 500)}
                                          {aiContent.content.length > 500 && '...'}
                                        </pre>
                                      </div>
                                    </div>
                                  )}

                                  {aiContent.type === 'DATA' && aiContent.metadata && (
                                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                                      <div>
                                        <span className="font-medium">记录数：</span>
                                        {aiContent.metadata.recordCount || 'N/A'}
                                      </div>
                                      <div>
                                        <span className="font-medium">文件大小：</span>
                                        {aiContent.metadata.fileSize || 'N/A'}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SolutionDialog
        open={solutionDialogOpen}
        onOpenChange={setSolutionDialogOpen}
        problemId={problemId}
        solution={editingSolution}
        onSuccess={() => loadProblem(problemId)}
      />
    </div>
  );
}
