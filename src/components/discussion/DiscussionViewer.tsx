'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Zap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useSSEStream, useTypewriter } from '@/hooks/use-sse-stream';
import { Button } from '@/components/ui/button';

interface DiscussionViewerProps {
  discussionId: string;
  providers: Array<{ id: string; name: string; type: string }>;
}

export function DiscussionViewer({ discussionId, providers }: DiscussionViewerProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // 使用 SSE 流
  const {
    messages,
    isConnected,
    error,
    getProviderContent,
    getAllProviderContent,
  } = useSSEStream(`/api/discussion/stream/${discussionId}`, true);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const getProviderColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
    ];
    return colors[index % colors.length];
  };

  const getProviderInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              实时连接中
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              等待连接
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? '自动滚动: 开' : '自动滚动: 关'}
        </Button>
      </div>

      {/* 讨论消息区 */}
      <Card className="h-[600px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            群聊讨论实时展示
          </CardTitle>
          <CardDescription>
            {providers.length} 个 AI 正在参与讨论
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p>等待讨论开始...</p>
                </div>
              )}

              {messages.map((message, index) => (
                <MessageItem
                  key={index}
                  message={message}
                  providerColor={getProviderColor(
                    providers.findIndex(p => p.id === message.providerId)
                  )}
                  providerInitial={
                    message.provider
                      ? getProviderInitial(message.provider.name)
                      : '?'
                  }
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 观点对比面板 */}
      <Card>
        <CardHeader>
          <CardTitle>观点对比总结</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider, index) => {
              const content = getProviderContent(provider.id);
              if (!content) return null;

              return (
                <div
                  key={provider.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    index === 0
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : index === 1
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : index === 2
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                      : 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className={`w-6 h-6 ${getProviderColor(index)}`}>
                      <span className="text-white text-xs font-medium">
                        {getProviderInitial(provider.name)}
                      </span>
                    </Avatar>
                    <span className="font-medium">{provider.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {provider.type}
                    </Badge>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{content}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function MessageItem({
  message,
  providerColor,
  providerInitial,
}: {
  message: any;
  providerColor: string;
  providerInitial: string;
}) {
  const { displayedText, isComplete } = useTypewriter(message.content || '', 20);

  if (message.type === 'provider_start') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Avatar className={`w-6 h-6 ${providerColor}`}>
          <span className="text-white text-xs font-medium">
            {providerInitial}
          </span>
        </Avatar>
        <span className="font-medium">{message.provider.name}</span>
        <Badge variant="outline" className="text-xs">
          {message.provider.type}
        </Badge>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (message.type === 'provider_complete') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        <span>{message.provider.name} 完成</span>
        <Badge variant="outline" className="text-xs">
          {message.tokenCount} tokens
        </Badge>
      </div>
    );
  }

  if (message.type === 'chunk') {
    return (
      <div className="flex gap-3">
        <Avatar className={`w-8 h-8 ${providerColor} flex-shrink-0`}>
          <span className="text-white text-sm font-medium">
            {providerInitial}
          </span>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {displayedText}
            {!isComplete && <span className="animate-pulse">|</span>}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'all_complete') {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">所有 AI 已完成讨论</span>
      </div>
    );
  }

  return null;
}
