'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Plus, MoreHorizontal, Shield, Ban, Key } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'USER';
  isVerified: boolean;
  isMfaEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      // TODO: 实现真实的 API 调用
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      // if (data.success) {
      //   setUsers(data.data);
      // }

      // Mock 数据
      setUsers([
        {
          id: 'user-001',
          email: 'admin@cmamsys.local',
          username: 'Yogdunana',
          role: 'ADMIN',
          isVerified: true,
          isMfaEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          lastLoginAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 'user-002',
          email: 'user@example.com',
          username: 'testuser',
          role: 'USER',
          isVerified: true,
          isMfaEnabled: false,
          createdAt: '2024-01-05T00:00:00Z',
          lastLoginAt: '2024-01-14T15:20:00Z',
        },
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                访问被拒绝
              </CardTitle>
              <CardDescription>
                您需要管理员权限才能访问此页面
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Users className="h-8 w-8" />
              用户管理
            </h1>
            <p className="text-muted-foreground">
              管理系统用户和权限
            </p>
          </div>

          <div className="space-y-6">
            {/* 操作栏 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索用户名或邮箱..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        添加用户
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加新用户</DialogTitle>
                        <DialogDescription>
                          创建新的系统用户账户
                        </DialogDescription>
                      </DialogHeader>
                      {/* TODO: 实现添加用户表单 */}
                      <div className="py-4">
                        <p className="text-muted-foreground text-sm">
                          添加用户功能即将推出...
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* 用户列表 */}
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  共 {filteredUsers.length} 个用户
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    加载中...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>最后登录</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {user.role === 'ADMIN' ? '管理员' : '用户'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                                {user.isVerified ? '已验证' : '未验证'}
                              </Badge>
                              <Badge variant={user.isMfaEnabled ? 'default' : 'secondary'}>
                                {user.isMfaEnabled ? 'MFA' : '无MFA'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleString()
                              : '从未登录'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                              {user.role !== 'ADMIN' && (
                                <Button variant="ghost" size="sm">
                                  <Ban className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
