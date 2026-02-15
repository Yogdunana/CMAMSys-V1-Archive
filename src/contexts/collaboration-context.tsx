'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  color: string;
  line: number;
  column: number;
  selectionStart?: number;
  selectionEnd?: number;
}

export interface CollaborationState {
  paperId: string;
  isConnected: boolean;
  users: CollaborationUser[];
  myUserId: string;
  myColor: string;
  cursors: Map<string, CursorPosition>;
  isSaving: boolean;
  saveError?: string;
}

interface CollaborationContextType extends CollaborationState {
  connect: (paperId: string) => Promise<void>;
  disconnect: () => void;
  updateContent: (content: string) => Promise<void>;
  updateCursor: (position: CursorPosition) => void;
  inviteUser: (email: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

/**
 * 协作编辑 Context Provider
 */
export function CollaborationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CollaborationState>({
    paperId: '',
    isConnected: false,
    users: [],
    myUserId: '',
    myColor: '',
    cursors: new Map(),
    isSaving: false,
  });

  const [socket, setSocket] = useState<WebSocket | null>(null);

  // 连接到协作会话
  const connect = async (paperId: string) => {
    try {
      // 获取当前用户信息
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();

      const myUserId = userData.id;
      const myColor = getUserColor(myUserId);

      // 创建 WebSocket 连接
      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'}/api/collaboration/${paperId}`
      );

      ws.onopen = () => {
        setState((prev) => ({
          ...prev,
          paperId,
          isConnected: true,
          myUserId,
          myColor,
        }));

        // 发送加入消息
        ws.send(JSON.stringify({
          type: 'join',
          userId: myUserId,
          userName: userData.username,
          color: myColor,
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'users':
            setState((prev) => ({
              ...prev,
              users: message.users,
            }));
            break;

          case 'cursor':
            setState((prev) => {
              const newCursors = new Map(prev.cursors);
              newCursors.set(message.userId, message.position);
              return { ...prev, cursors: newCursors };
            });
            break;

          case 'content_update':
            // 接收其他用户的更新
            // 这里应该触发父组件更新
            break;

          case 'user_joined':
            setState((prev) => ({
              ...prev,
              users: [...prev.users, message.user],
            }));
            break;

          case 'user_left':
            setState((prev) => ({
              ...prev,
              users: prev.users.filter((u) => u.id !== message.userId),
              cursors: (() => {
                const newCursors = new Map(prev.cursors);
                newCursors.delete(message.userId);
                return newCursors;
              })(),
            }));
            break;

          case 'save_status':
            setState((prev) => ({
              ...prev,
              isSaving: message.isSaving,
              saveError: message.error,
            }));
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error);
      };

      ws.onclose = () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to connect to collaboration:', error);
    }
  };

  // 断开连接
  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }

    setState({
      paperId: '',
      isConnected: false,
      users: [],
      myUserId: '',
      myColor: '',
      cursors: new Map(),
      isSaving: false,
    });
  };

  // 更新内容
  const updateContent = async (content: string) => {
    if (!socket || !state.isConnected) {
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      // 发送内容更新
      socket.send(JSON.stringify({
        type: 'content_update',
        userId: state.myUserId,
        content,
      }));

      // 保存到服务器
      const response = await fetch(`/api/papers/${state.paperId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      setState((prev) => ({
        ...prev,
        isSaving: false,
        saveError: undefined,
      }));
    } catch (error) {
      console.error('Failed to update content:', error);
      setState((prev) => ({
        ...prev,
        isSaving: false,
        saveError: '保存失败',
      }));
    }
  };

  // 更新光标位置
  const updateCursor = (position: CursorPosition) => {
    if (!socket || !state.isConnected) {
      return;
    }

    socket.send(JSON.stringify({
      type: 'cursor',
      userId: state.myUserId,
      position: {
        ...position,
        userId: state.myUserId,
        userName: state.users.find((u) => u.id === state.myUserId)?.name || '',
        color: state.myColor,
      },
    }));
  };

  // 邀请用户
  const inviteUser = async (email: string) => {
    const response = await fetch(`/api/papers/${state.paperId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to invite user');
    }

    return response.json();
  };

  // 移除用户
  const removeUser = async (userId: string) => {
    const response = await fetch(`/api/papers/${state.paperId}/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove user');
    }

    return response.json();
  };

  // 清理
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <CollaborationContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        updateContent,
        updateCursor,
        inviteUser,
        removeUser,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
}

/**
 * 使用协作上下文
 */
export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
}

/**
 * 生成用户颜色
 */
function getUserColor(userId: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#f43f5e', '#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6'
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
