'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderName: string;
  senderProviderId: string;
  content: string;
  round: number;
  role: string;
  coreAlgorithms: string | null;
  innovations: string | null;
  feasibility: string | null;
  disagreements: string | null;
  tokenCount: number;
  createdAt: Date;
}

interface DiscussionData {
  discussion: {
    id: string;
    title: string;
    status: string;
    currentRound: number;
    maxRounds: number;
    participants: any[];
  };
  messages: Message[];
}

interface DiscussionHistoryViewerProps {
  discussionId: string;
}

export function DiscussionHistoryViewer({ discussionId }: DiscussionHistoryViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiscussionData | null>(null);

  useEffect(() => {
    fetchDiscussionMessages();
  }, [discussionId]);

  const fetchDiscussionMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/discussion/${discussionId}/messages`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch messages');
        toast.error('加载讨论消息失败', {
          description: result.error,
        });
      }
    } catch (err) {
      setError('Network error');
      toast.error('加载讨论消息失败', {
        description: '网络错误',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderColor = (providerId: string) => {
    // 根据 Provider ID 生成一致的颜色
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
    ];
    const index = providerId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getProviderInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, string> = {
      INITIAL_THOUGHT: '初始思路',
      COMMENT: '点评',
      SUPPLEMENT: '补充',
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            群聊讨论历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p>加载讨论消息...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            群聊讨论历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-red-500">
            <XCircle className="w-12 h-12 mb-4" />
            <p>{error || '加载失败'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          群聊讨论历史
        </CardTitle>
        <CardDescription>
          {data.messages.length} 条消息 • 回合 {data.discussion.currentRound}/{data.discussion.maxRounds} • 状态: {data.discussion.status}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {data.messages.map((message, index) => (
              <div key={message.id} className="space-y-3">
                {/* 消息头部 */}
                <div className="flex items-center gap-3">
                  <Avatar className={`w-10 h-10 ${getProviderColor(message.senderProviderId)}`}>
                    <span className="text-white font-medium">
                      {getProviderInitial(message.senderName)}
                    </span>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{message.senderName}</span>
                      <Badge variant="outline" className="text-xs">
                        回合 {message.round}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getRoleBadge(message.role)}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {message.tokenCount} tokens
                  </Badge>
                </div>

                {/* 消息内容 */}
                <div className="ml-13 pl-13">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>

                {/* 提取的结构化信息 */}
                {(message.coreAlgorithms || message.innovations || message.feasibility) && (
                  <div className="ml-13 pl-13 space-y-2">
                    {message.coreAlgorithms && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-l-4 border-blue-500">
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">核心算法</div>
                        <div className="text-sm">{message.coreAlgorithms}</div>
                      </div>
                    )}
                    {message.innovations && (
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border-l-4 border-green-500">
                        <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">创新点</div>
                        <div className="text-sm">{message.innovations}</div>
                      </div>
                    )}
                    {message.feasibility && (
                      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-l-4 border-orange-500">
                        <div className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">可行性分析</div>
                        <div className="text-sm">{message.feasibility}</div>
                      </div>
                    )}
                    {message.disagreements && (
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border-l-4 border-red-500">
                        <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">分歧点</div>
                        <div className="text-sm">{message.disagreements}</div>
                      </div>
                    )}
                  </div>
                )}

                {index < data.messages.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
