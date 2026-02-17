'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCollaboration, CollaborationUser } from '@/contexts/collaboration-context';
import { Users, UserPlus, Wifi, WifiOff, Save, Loader2, Eye, EyeOff } from 'lucide-react';

interface CollaborativeEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

/**
 * 协作编辑器
 * 支持多人实时协作编辑
 */
export function CollaborativeEditor({ content, onChange, readOnly = false }: CollaborativeEditorProps) {
  const {
    isConnected,
    users,
    myUserId,
    myColor,
    cursors,
    isSaving,
    saveError,
    updateContent,
    updateCursor,
    inviteUser,
  } = useCollaboration();

  const [showUsers, setShowUsers] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 防抖保存
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (!readOnly && isConnected) {
        updateContent(content);
      }
    }, 1000);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [content, isConnected, readOnly]);

  // 处理光标移动
  const handleCursorMove = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (!isConnected || readOnly) {
      return;
    }

    const target = event.target as HTMLTextAreaElement;
    const position = target.selectionStart;

    updateCursor({
      userId: myUserId,
      userName: users.find((u) => u.id === myUserId)?.name || '',
      color: myColor,
      line: 0, // TODO: 计算实际行号
      column: position,
      selectionStart: target.selectionStart,
      selectionEnd: target.selectionEnd,
    });
  };

  // 邀请用户
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      return;
    }

    try {
      setIsInviting(true);
      await inviteUser(inviteEmail);
      setInviteEmail('');
      alert('邀请已发送');
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert('邀请失败');
    } finally {
      setIsInviting(false);
    }
  };

  // 计算活跃用户
  const activeUsers = users.filter((u) => u.isOnline && u.id !== myUserId);
  const myUser = users.find((u) => u.id === myUserId);

  return (
    <div className="space-y-4">
      {/* 协作状态栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </div>

              <Separator orientation="vertical" className="h-4" />

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">{users.length} 人协作</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>保存中...</span>
                </div>
              )}

              {saveError && (
                <Badge variant="destructive">{saveError}</Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUsers(!showUsers)}
              >
                {showUsers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>

              {!readOnly && isConnected && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      邀请
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>邀请协作</DialogTitle>
                      <DialogDescription>
                        输入邮箱地址邀请用户参与协作
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-email">邮箱地址</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="user@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                        {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        发送邀请
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 协作用户列表 */}
      {showUsers && (activeUsers.length > 0 || myUser) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">协作者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myUser && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded-md">
                  <Avatar className="h-8 w-8" style={{ backgroundColor: myColor }}>
                    <AvatarFallback>{myUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{myUser.name} (我)</p>
                  </div>
                  <Badge variant="outline">编辑中</Badge>
                </div>
              )}

              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
                  <Avatar className="h-8 w-8" style={{ backgroundColor: user.color }}>
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                  </div>
                  <Badge variant={user.isOnline ? 'default' : 'secondary'}>
                    {user.isOnline ? '在线' : '离线'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 编辑器 */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <textarea
              className="w-full min-h-[500px] p-4 resize-none border-0 focus:outline-none focus:ring-0 text-sm"
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleCursorMove}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              readOnly={readOnly}
              placeholder={readOnly ? '只读模式' : '开始编辑...'}
            />

            {/* 渲染其他用户的光标 */}
            {Array.from(cursors.values()).map((cursor, index) => {
              if (cursor.userId === myUserId) {
                return null;
              }

              return (
                <div
                  key={cursor.userId}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${cursor.line * 20}px`,
                    left: `${cursor.column * 8}px`,
                  }}
                >
                  <div
                    className="w-0.5 h-5"
                    style={{ backgroundColor: cursor.color }}
                  />
                  <div
                    className="px-1 py-0.5 rounded text-xs text-white"
                    style={{ backgroundColor: cursor.color }}
                  >
                    {cursor.userName}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 协作者头像列表
 */
export function CollaboratorAvatars() {
  const { users, myUserId, isConnected } = useCollaboration();

  if (!isConnected || users.length <= 1) {
    return null;
  }

  const otherUsers = users.filter((u) => u.id !== myUserId);

  return (
    <div className="flex items-center gap-2">
      {otherUsers.slice(0, 5).map((user) => (
        <Avatar
          key={user.id}
          className="h-6 w-6 border-2 border-background"
          style={{ backgroundColor: getUserColor(user.id) }}
        >
          <AvatarFallback className="text-xs">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}

      {otherUsers.length > 5 && (
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted border-2 border-background text-xs font-medium">
          +{otherUsers.length - 5}
        </div>
      )}
    </div>
  );
}

/**
 * 获取用户颜色
 */
function getUserColor(userId: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
