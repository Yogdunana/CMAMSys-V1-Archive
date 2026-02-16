/**
 * 实时协作服务
 * 支持多人实时编辑任务列表
 */

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'update' | 'cursor' | 'comment';
  userId: string;
  username: string;
  timestamp: string;
  data: any;
}

export interface Collaborator {
  userId: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  cursor?: {
    taskId?: number;
    position: number;
  };
}

export interface TaskComment {
  id: string;
  taskId: number;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  resolved: boolean;
}

/**
 * 协作会话管理器
 */
export class CollaborationSession {
  private taskId: string;
  private userId: string;
  private username: string;
  private eventSource: EventSource | null = null;
  private listeners: Map<string, (event: CollaborationEvent) => void> = new Map();
  private collaborators: Map<string, Collaborator> = new Map();

  constructor(taskId: string, userId: string, username: string) {
    this.taskId = taskId;
    this.userId = userId;
    this.username = username;
  }

  /**
   * 连接到协作会话
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 创建 SSE 连接
        const url = `/api/collaboration/${this.taskId}?userId=${this.userId}&username=${this.username}`;
        this.eventSource = new EventSource(url);

        // 处理消息
        this.eventSource.onmessage = (event) => {
          try {
            const collaborationEvent: CollaborationEvent = JSON.parse(event.data);
            this.handleEvent(collaborationEvent);
          } catch (error) {
            console.error('[Collaboration] 解析事件失败:', error);
          }
        };

        // 处理错误
        this.eventSource.onerror = (error) => {
          console.error('[Collaboration] 连接错误:', error);
          this.disconnect();
          reject(error);
        };

        // 等待连接成功
        this.eventSource.onopen = () => {
          console.log('[Collaboration] 连接成功');
          resolve();
        };
      } catch (error) {
        console.error('[Collaboration] 连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }

  /**
   * 处理协作事件
   */
  private handleEvent(event: CollaborationEvent): void {
    switch (event.type) {
      case 'join':
        this.handleJoin(event);
        break;
      case 'leave':
        this.handleLeave(event);
        break;
      case 'update':
        this.handleUpdate(event);
        break;
      case 'cursor':
        this.handleCursor(event);
        break;
      case 'comment':
        this.handleComment(event);
        break;
      default:
        console.warn('[Collaboration] 未知事件类型:', event.type);
    }

    // 通知所有监听器
    this.notifyListeners(event);
  }

  /**
   * 处理用户加入
   */
  private handleJoin(event: CollaborationEvent): void {
    if (event.userId === this.userId) return;

    this.collaborators.set(event.userId, {
      userId: event.userId,
      username: event.username,
      isOnline: true,
      lastSeen: event.timestamp,
    });

    console.log('[Collaboration] 用户加入:', event.username);
  }

  /**
   * 处理用户离开
   */
  private handleLeave(event: CollaborationEvent): void {
    const collaborator = this.collaborators.get(event.userId);
    if (collaborator) {
      collaborator.isOnline = false;
      collaborator.lastSeen = event.timestamp;
    }

    console.log('[Collaboration] 用户离开:', event.username);
  }

  /**
   * 处理任务更新
   */
  private handleUpdate(event: CollaborationEvent): void {
    console.log('[Collaboration] 任务更新:', event.data);
  }

  /**
   * 处理光标位置
   */
  private handleCursor(event: CollaborationEvent): void {
    const collaborator = this.collaborators.get(event.userId);
    if (collaborator) {
      collaborator.cursor = event.data.cursor;
    }
  }

  /**
   * 处理评论
   */
  private handleComment(event: CollaborationEvent): void {
    console.log('[Collaboration] 新评论:', event.data);
  }

  /**
   * 发送事件
   */
  async sendEvent(event: Omit<CollaborationEvent, 'timestamp'>): Promise<void> {
    try {
      const response = await fetch(`/api/collaboration/${this.taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('发送事件失败');
      }
    } catch (error) {
      console.error('[Collaboration] 发送事件失败:', error);
      throw error;
    }
  }

  /**
   * 添加事件监听器
   */
  addListener(eventType: string, callback: (event: CollaborationEvent) => void): void {
    this.listeners.set(eventType, callback);
  }

  /**
   * 移除事件监听器
   */
  removeListener(eventType: string): void {
    this.listeners.delete(eventType);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(event: CollaborationEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners(event);
    }

    // 通知所有监听器
    this.listeners.forEach((callback) => {
      if (callback !== listeners) {
        callback(event);
      }
    });
  }

  /**
   * 获取协作者列表
   */
  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  /**
   * 更新光标位置
   */
  async updateCursor(taskId?: number, position: number = 0): Promise<void> {
    await this.sendEvent({
      type: 'cursor',
      userId: this.userId,
      username: this.username,
      data: {
        cursor: { taskId, position },
      },
    });
  }

  /**
   * 广播任务更新
   */
  async broadcastUpdate(data: any): Promise<void> {
    await this.sendEvent({
      type: 'update',
      userId: this.userId,
      username: this.username,
      data,
    });
  }

  /**
   * 发送评论
   */
  async sendComment(taskId: number, content: string): Promise<void> {
    await this.sendEvent({
      type: 'comment',
      userId: this.userId,
      username: this.username,
      data: {
        comment: {
          taskId,
          content,
          createdAt: new Date().toISOString(),
        },
      },
    });
  }
}

/**
 * 创建协作会话
 */
export function createCollaborationSession(
  taskId: string,
  userId: string,
  username: string
): CollaborationSession {
  return new CollaborationSession(taskId, userId, username);
}

/**
 * 使用协作钩子（React）
 */
export function useCollaboration(
  taskId: string,
  userId: string,
  username: string
) {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSession = createCollaborationSession(taskId, userId, username);

    newSession.connect()
      .then(() => {
        setIsConnected(true);
        setSession(newSession);
        setCollaborators(newSession.getCollaborators());
      })
      .catch((error) => {
        console.error('[useCollaboration] 连接失败:', error);
      });

    // 监听协作者变化
    newSession.addListener('join', () => {
      setCollaborators([...newSession.getCollaborators()]);
    });

    newSession.addListener('leave', () => {
      setCollaborators([...newSession.getCollaborators()]);
    });

    return () => {
      newSession.disconnect();
      setIsConnected(false);
      setSession(null);
    };
  }, [taskId, userId, username]);

  return {
    session,
    collaborators,
    isConnected,
  };
}

// 添加 useState 和 useEffect 导入
import { useState, useEffect } from 'react';
