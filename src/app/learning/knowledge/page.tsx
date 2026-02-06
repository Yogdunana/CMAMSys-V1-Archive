'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Plus, Trash2, ExternalLink, BookOpen, Tag } from 'lucide-react';

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

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<CreateKnowledgeDTO>({
    title: '',
    description: '',
    category: 'algorithm',
    tags: [],
    sourceId: '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'algorithm', label: '算法' },
    { value: 'model', label: '模型' },
    { value: 'technique', label: '技巧' },
    { value: 'concept', label: '概念' },
    { value: 'tool', label: '工具' },
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

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
    <div className="container mx-auto py-6">
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
    </div>
  );
}
