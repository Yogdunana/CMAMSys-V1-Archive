'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Plus, Calendar, Users, ExternalLink, Search, Filter } from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  type: string;
  year: number;
  problemId: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  folderPath: string;
  createdAt: string;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    type: 'MCM',
    year: new Date().getFullYear(),
    problemId: '',
    description: '',
  });
  const { toast } = useToast();

  const competitionTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'MCM', label: 'MCM' },
    { value: 'ICM', label: 'ICM' },
    { value: 'CUMCM', label: 'CUMCM' },
    { value: 'SHENZHEN_CUP', label: '深圳杯' },
    { value: 'IMMC', label: 'IMMC' },
    { value: 'MATHORCUP', label: 'MathorCup' },
    { value: 'EMMC', label: 'EMMC' },
    { value: 'TEDDY_CUP', label: '泰迪杯' },
    { value: 'BLUE_BRIDGE_MATH', label: '蓝桥杯' },
    { value: 'REGIONAL', label: '区域赛' },
    { value: 'OTHER', label: '其他' },
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'active', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  const statusColors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    draft: 'secondary',
    active: 'default',
    completed: 'outline',
    cancelled: 'destructive',
  };

  const handleCreateCompetition = async () => {
    if (!newCompetition.name || !newCompetition.problemId) {
      toast({
        variant: 'destructive',
        title: '验证失败',
        description: '请填写竞赛名称和题目 ID',
      });
      return;
    }

    try {
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompetition),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '创建成功',
          description: '竞赛已成功创建',
        });
        setCreateDialogOpen(false);
        setNewCompetition({
          name: '',
          type: 'MCM',
          year: new Date().getFullYear(),
          problemId: '',
          description: '',
        });
        // TODO: 重新加载竞赛列表
      } else {
        throw new Error(data.error?.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error instanceof Error ? error.message : '无法创建竞赛',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">竞赛管理</h1>
            <p className="text-muted-foreground mt-2">
              管理您的数学建模竞赛
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建竞赛
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新竞赛</DialogTitle>
                <DialogDescription>
                  创建一个新的数学建模竞赛
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    竞赛名称 *
                  </label>
                  <Input
                    id="name"
                    value={newCompetition.name}
                    onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                    placeholder="输入竞赛名称"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">
                      竞赛类型
                    </label>
                    <Select
                      value={newCompetition.type}
                      onValueChange={(value) => setNewCompetition({ ...newCompetition, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {competitionTypes.slice(1).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="year" className="text-sm font-medium">
                      年份
                    </label>
                    <Input
                      id="year"
                      type="number"
                      value={newCompetition.year}
                      onChange={(e) =>
                        setNewCompetition({ ...newCompetition, year: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="problemId" className="text-sm font-medium">
                    题目 ID *
                  </label>
                  <Input
                    id="problemId"
                    value={newCompetition.problemId}
                    onChange={(e) => setNewCompetition({ ...newCompetition, problemId: e.target.value })}
                    placeholder="例如：A, B, C, D"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    描述
                  </label>
                  <Textarea
                    id="description"
                    value={newCompetition.description}
                    onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                    placeholder="输入竞赛描述"
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateCompetition} className="w-full">
                  创建竞赛
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
                  placeholder="搜索竞赛..."
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
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {competitionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {competitions.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">暂无竞赛</h3>
                  <p className="text-muted-foreground mb-4">
                    您还没有创建任何竞赛
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建第一个竞赛
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{competition.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{competition.type}</Badge>
                        <Badge>{competition.year}</Badge>
                        <Badge variant={statusColors[competition.status] || 'outline'}>
                          {competition.status}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {competition.description || '暂无描述'}
                  </p>
                  <div className="space-y-2">
                    {competition.startDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-2" />
                        开始时间：{new Date(competition.startDate).toLocaleString()}
                      </div>
                    )}
                    {competition.endDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-2" />
                        结束时间：{new Date(competition.endDate).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
