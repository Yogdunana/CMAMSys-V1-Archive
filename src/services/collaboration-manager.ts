/**
 * 协作会话管理服务
 * 管理实时协作会话、用户状态和消息广播
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CollaborationSession {
  paperId: string;
  users: Map<string, CollaborationUser>;
  cursors: Map<string, CursorPosition>;
  createdAt: Date;
  lastActivity: Date;
}

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  isOnline: boolean;
  joinedAt: Date;
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

export interface CollaborationMessage {
  type: 'user_joined' | 'user_left' | 'cursor_update' | 'content_update' | 'save_status';
  userId: string;
  timestamp: Date;
  data?: any;
}

/**
 * 协作会话管理器（内存中）
 */
class CollaborationManager {
  private sessions: Map<string, CollaborationSession> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 每 5 分钟清理一次不活跃的会话
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  /**
   * 获取或创建会话
   */
  getOrCreateSession(paperId: string): CollaborationSession {
    let session = this.sessions.get(paperId);

    if (!session) {
      session = {
        paperId,
        users: new Map(),
        cursors: new Map(),
        createdAt: new Date(),
        lastActivity: new Date(),
      };
      this.sessions.set(paperId, session);
    }

    return session;
  }

  /**
   * 用户加入会话
   */
  async joinSession(paperId: string, userId: string, userName: string, email: string): Promise<CollaborationSession> {
    const session = this.getOrCreateSession(paperId);

    // 检查用户是否已经在会话中
    if (session.users.has(userId)) {
      const user = session.users.get(userId)!;
      user.isOnline = true;
      user.lastSeen = new Date();
    } else {
      // 获取用户信息
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const color = this.getUserColor(userId);
      const collaborationUser: CollaborationUser = {
        id: userId,
        name: userName,
        email: user.email,
        color,
        isOnline: true,
        joinedAt: new Date(),
        lastSeen: new Date(),
      };

      session.users.set(userId, collaborationUser);
    }

    session.lastActivity = new Date();

    return session;
  }

  /**
   * 用户离开会话
   */
  leaveSession(paperId: string, userId: string): void {
    const session = this.sessions.get(paperId);

    if (!session) {
      return;
    }

    const user = session.users.get(userId);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
    }

    session.cursors.delete(userId);
    session.lastActivity = new Date();
  }

  /**
   * 更新光标位置
   */
  updateCursor(paperId: string, userId: string, position: Partial<CursorPosition>): void {
    const session = this.sessions.get(paperId);

    if (!session) {
      return;
    }

    const user = session.users.get(userId);
    if (!user) {
      return;
    }

    const cursor: CursorPosition = {
      userId,
      userName: user.name,
      color: user.color,
      line: 0,
      column: 0,
      ...position,
    };

    session.cursors.set(userId, cursor);
    session.lastActivity = new Date();
  }

  /**
   * 获取会话信息
   */
  getSession(paperId: string): CollaborationSession | undefined {
    return this.sessions.get(paperId);
  }

  /**
   * 获取会话用户列表
   */
  getSessionUsers(paperId: string): CollaborationUser[] {
    const session = this.sessions.get(paperId);
    return session ? Array.from(session.users.values()) : [];
  }

  /**
   * 获取所有光标位置
   */
  getSessionCursors(paperId: string): CursorPosition[] {
    const session = this.sessions.get(paperId);
    return session ? Array.from(session.cursors.values()) : [];
  }

  /**
   * 清理不活跃的会话
   */
  private cleanupInactiveSessions(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 分钟

    for (const [paperId, session] of this.sessions.entries()) {
      const timeSinceActivity = now.getTime() - session.lastActivity.getTime();

      if (timeSinceActivity > inactiveThreshold) {
        this.sessions.delete(paperId);
        console.log(`Cleaned up inactive session: ${paperId}`);
      }
    }
  }

  /**
   * 生成用户颜色
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
      '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
      '#f43f5e', '#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6',
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
  }
}

// 导出单例
export const collaborationManager = new CollaborationManager();
