'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, UserPlus, Crown, Shield, User } from 'lucide-react';

interface TeamMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  maxMembers: number;
  members: TeamMember[];
  createdAt: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    maxMembers: 10,
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const { toast } = useToast();

  const roleIcons = {
    OWNER: Crown,
    ADMIN: Shield,
    MEMBER: User,
  };

  const roleColors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    OWNER: 'default',
    ADMIN: 'secondary',
    MEMBER: 'outline',
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name) {
      toast({
        variant: 'destructive',
        title: '验证失败',
        description: '请填写团队名称',
      });
      return;
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '创建成功',
          description: '团队已成功创建',
        });
        setCreateDialogOpen(false);
        setNewTeam({
          name: '',
          description: '',
          maxMembers: 10,
        });
        // TODO: 重新加载团队列表
      } else {
        throw new Error(data.error?.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error instanceof Error ? error.message : '无法创建团队',
      });
    }
  };

  const handleInviteMember = async () => {
    if (!selectedTeam || !inviteEmail) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '邀请成功',
          description: `已向 ${inviteEmail} 发送邀请`,
        });
        setInviteDialogOpen(false);
        setInviteEmail('');
        setSelectedTeam(null);
        // TODO: 重新加载团队列表
      } else {
        throw new Error(data.error?.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '邀请失败',
        description: error instanceof Error ? error.message : '无法邀请成员',
      });
    }
  };

  const openInviteDialog = (team: Team) => {
    setSelectedTeam(team);
    setInviteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">团队管理</h1>
            <p className="text-muted-foreground mt-2">
              管理您的建模团队
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建团队
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新团队</DialogTitle>
                <DialogDescription>
                  创建一个新的建模团队
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="teamName" className="text-sm font-medium">
                    团队名称 *
                  </label>
                  <Input
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="输入团队名称"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    描述
                  </label>
                  <Textarea
                    id="description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="输入团队描述"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxMembers" className="text-sm font-medium">
                    最大成员数
                  </label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={newTeam.maxMembers}
                    onChange={(e) =>
                      setNewTeam({ ...newTeam, maxMembers: parseInt(e.target.value) })
                    }
                    min={2}
                    max={20}
                  />
                </div>
                <Button onClick={handleCreateTeam} className="w-full">
                  创建团队
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">暂无团队</h3>
                  <p className="text-muted-foreground mb-4">
                    您还没有创建任何团队
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建第一个团队
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>
                    {team.description || '暂无描述'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {team.members.length} / {team.maxMembers}
                        </span>
                      </div>
                      <Badge variant="outline">{team.members.length} 成员</Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">团队成员</p>
                      <div className="space-y-2">
                        {team.members.map((member) => {
                          const Icon = roleIcons[member.role];
                          return (
                            <div key={member.id} className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs">
                                  {member.username.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {member.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {member.email}
                                </p>
                              </div>
                              <Badge variant={roleColors[member.role]} className="text-xs">
                                <Icon className="h-3 w-3 mr-1" />
                                {member.role}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openInviteDialog(team)}
                      disabled={team.members.length >= team.maxMembers}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      邀请成员
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 邀请成员对话框 */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>邀请成员</DialogTitle>
              <DialogDescription>
                邀请新成员加入 {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="inviteEmail" className="text-sm font-medium">
                  邮箱地址 *
                </label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <Button onClick={handleInviteMember} className="w-full">
                发送邀请
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
