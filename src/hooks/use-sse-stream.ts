/**
 * SSE 流式输出 Hook
 * 用于在 React 组件中消费 SSE 流
 */

import { useEffect, useState, useCallback, useRef } from 'react';

export interface SSEMessage {
  type: 'start' | 'chunk' | 'complete' | 'error' | 'provider_start' | 'provider_complete' | 'provider_error' | 'all_complete';
  content?: string;
  error?: string;
  providerId?: string;
  provider?: { id: string; name: string };
  tokenCount?: number;
}

export function useSSEStream(url: string, enabled: boolean = true) {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const combinedContentRef = useRef<Map<string, string>>(new Map());

  const connect = useCallback(() => {
    if (!enabled) return;

    // 清理旧的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);

          setMessages((prev) => [...prev, data]);

          // 更新组合内容（用于每个 Provider）
          if (data.providerId && data.content) {
            combinedContentRef.current.set(
              data.providerId,
              (combinedContentRef.current.get(data.providerId) || '') + data.content
            );
          }

          // 连接关闭
          if (data.type === 'all_complete' || data.type === 'error') {
            eventSource.close();
            setIsConnected(false);
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        setIsConnected(false);
        setError('Connection error');
        eventSource.close();
      };
    } catch (err) {
      console.error('Error creating EventSource:', err);
      setError('Failed to connect');
    }
  }, [url, enabled]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const getProviderContent = useCallback((providerId: string) => {
    return combinedContentRef.current.get(providerId) || '';
  }, []);

  const getAllProviderContent = useCallback(() => {
    return Object.fromEntries(combinedContentRef.current);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    isConnected,
    error,
    connect,
    disconnect,
    getProviderContent,
    getAllProviderContent,
  };
}

/**
 * 打字机效果 Hook
 */
export function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    let index = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsComplete(true);
      }
    };

    typeNextChar();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  return { displayedText, isComplete };
}
