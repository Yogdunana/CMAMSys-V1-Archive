'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Plus, Trash2, ExternalLink, BookOpen, Tag, Play, CheckCircle2, Clock } from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  sourceType: string;
  sourceId: string;
  video?: {
    id: string;
    title: string;
    bvid: string;
    url: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateKnowledgeDTO {
  title: string;
  description: string;
  category: string;
  tags: string[];
  sourceId: string;
}

interface Video {
  id: string;
  bvid: string;
  title: string;
  description: string;
  author: string;
  duration: number;
  viewCount: number;
  learningStatus: string;
  createdAt: string;
  learningTasks: Array<{
    id: string;
    status: string;
    progress: number;
    startedAt: string | null;
    completedAt: string | null;
  }>;
  _count: {
    knowledgeEntries: number;
  };
}

interface VideoKnowledge {
  id: string;
  videoId: string;
  title: string;
  content: string;
  summary: string | null;
  category: string | null;
  tags: string[];
  importance: string;
  timestamp: string;
  relevanceScore: number;
  createdAt: string;
  video: {
    id: string;
    bvid: string;
    title: string;
    url: string;
  };
}

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<KnowledgeEntry[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);
  const [selectedVideoKnowledge, setSelectedVideoKnowledge] = useState<VideoKnowledge | null>(null);
  const [newEntry, setNewEntry] = useState<CreateKnowledgeDTO>({
    title: '',
    description: '',
    category: 'algorithm',
    tags: [],
    sourceId: '',
  });
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'entries' | 'videos'>('entries');
  const { toast } = useToast();

  // 获取 token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'algorithm', label: '算法' },
    { value: 'model', label: '模型' },
    { value: 'technique', label: '技巧' },
    { value: 'concept', label: '概念' },
    { value: 'tool', label: '工具' },
  ];

  const learningStatuses = [
    { value: 'all', label: '全部' },
    { value: 'unlearned', label: '未学习' },
    { value: 'learning', label: '学习中' },
    { value: 'learned', label: '已学习' },
  ];

  useEffect(() => {
    if (viewMode === 'entries') {
      fetchEntries();
    } else {
      fetchVideos();
    }
  }, [viewMode, user]);

  useEffect(() => {
    let filtered = entries;

    // 应用搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.description.toLowerCase().includes(query) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 应用分类过滤
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.category === categoryFilter);
    }

    setFilteredEntries(filtered);
  }, [entries, searchQuery, categoryFilter]);

  useEffect(() => {
    let filtered = videos;

    // 应用搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query)
      );
    }

    // 应用状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter((video) => video.learningStatus === statusFilter);
    }

    setFilteredVideos(filtered);
  }, [videos, searchQuery, statusFilter]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/learning/knowledge');
      const data = await response.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法加载知识库条目',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/learning/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setVideos(data.data.videos || []);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法加载视频列表',
      });
    } finally {
      setLoading(false);
    }
  };

  const getVideoStatusBadge = (video: Video) => {
    const status = video.learningStatus || 'unlearned';
    const config = {
      unlearned: { icon: Clock, label: '未学习', color: 'bg-gray-500/10 text-gray-500' },
      learning: { icon: Play, label: '学习中', color: 'bg-blue-500/10 text-blue-500' },
      learned: { icon: CheckCircle2, label: '已学习', color: 'bg-green-500/10 text-green-500' },
    };
    const conf = config[status as keyof typeof config] || config.unlearned;
    const Icon = conf.icon;

    return (
      <Badge variant="outline" className={conf.color}>
        <Icon className="h-3 w-3 mr-1" />
        {conf.label}
      </Badge>
    );
  };

  const handleViewVideoKnowledge = async (videoId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/learning/videos/${videoId}/knowledge`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSelectedVideoKnowledge(data.data);
        setKnowledgeDialogOpen(true);
      } else {
        toast({
          variant: 'destructive',
          title: '加载失败',
          description: '该视频暂无学习总结',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法加载学习总结',
      });
    }
  };

  const handleCreateEntry = async () => {
    if (!newEntry.title || !newEntry.description) {
      toast({
        variant: 'destructive',
        title: '验证失败',
        description: '请填写标题和描述',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/learning/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '创建成功',
          description: '知识点已添加到知识库',
        });
        setCreateDialogOpen(false);
        setNewEntry({
          title: '',
          description: '',
          category: 'algorithm',
          tags: [],
          sourceId: '',
        });
        fetchEntries();
      } else {
        throw new Error(data.error?.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error instanceof Error ? error.message : '无法创建知识点',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/learning/knowledge?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '删除成功',
          description: '知识点已删除',
        });
        fetchEntries();
      } else {
        throw new Error(data.error?.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error instanceof Error ? error.message : '无法删除知识点',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">知识库管理</h1>
          <p className="text-muted-foreground mt-2">查看和管理系统学到的知识点</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加知识点
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加知识点</DialogTitle>
              <DialogDescription>手动添加知识点到知识库</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  标题 *
                </label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="输入知识点标题"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  分类
                </label>
                <Select
                  value={newEntry.category}
                  onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algorithm">算法</SelectItem>
                    <SelectItem value="model">模型</SelectItem>
                    <SelectItem value="technique">技巧</SelectItem>
                    <SelectItem value="concept">概念</SelectItem>
                    <SelectItem value="tool">工具</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  描述 *
                </label>
                <Textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="输入知识点描述"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  标签（用逗号分隔）
                </label>
                <Input
                  id="tags"
                  value={newEntry.tags.join(', ')}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="输入标签，如：线性规划, 优化"
                />
              </div>
              <Button onClick={handleCreateEntry} disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                创建知识点
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'entries' | 'videos')} className="space-y-6">
        <TabsList>
          <TabsTrigger value="entries">知识点</TabsTrigger>
          <TabsTrigger value="videos">视频学习状态</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索知识点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无知识点</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || categoryFilter !== 'all'
                  ? '没有找到匹配的知识点'
                  : '系统还没有学习到任何知识点'}
              </p>
              {!searchQuery && categoryFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加第一个知识点
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{categories.find((c) => c.value === entry.category)?.label}</Badge>
                      {entry.sourceType === 'bilibili' && entry.video && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-muted-foreground"
                          onClick={() => window.open(entry.video!.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          B 站视频
                        </Button>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {entry.description}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{entry.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索视频..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {learningStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  <Play className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">暂无视频</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all'
                      ? '没有找到匹配的视频'
                      : '还没有添加任何视频'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          {getVideoStatusBadge(video)}
                          <span>•</span>
                          <span>{video.author}</span>
                        </CardDescription>
                      </div>
                      {video._count.knowledgeEntries > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVideoKnowledge(video.id)}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          查看总结
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>时长: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                      <span>观看: {video.viewCount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 视频学习总结对话框 */}
      <Dialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>视频学习总结</DialogTitle>
            <DialogDescription>
              {selectedVideoKnowledge?.video.title}
            </DialogDescription>
          </DialogHeader>
          {selectedVideoKnowledge && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">摘要</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedVideoKnowledge.summary || '暂无摘要'}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">详细内容</h4>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedVideoKnowledge.content}
                </p>
              </div>
              {selectedVideoKnowledge.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideoKnowledge.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>分类: {selectedVideoKnowledge.category || '-'}</span>
                <span>重要性: {selectedVideoKnowledge.importance}</span>
                <span>相关性: {(selectedVideoKnowledge.relevanceScore * 100).toFixed(0)}%</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedVideoKnowledge.video.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  在 B 站观看
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
      </main>
    </div>
  );
}
