/**
 * Sentry API Wrapper
 * Sentry API 包装器，用于捕获 API 路由中的错误
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Wrap API route handler with Sentry error tracking
 * 使用 Sentry 错误跟踪包装 API 路由处理器
 */
export function withSentryTracking<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  routeName: string
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();

    // Add request data to scope
    Sentry.getCurrentScope().setContext('api', {
      route: routeName,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    });

    Sentry.getCurrentScope().setTag('route', routeName);
    Sentry.getCurrentScope().setTag('method', request.method);

    try {
      // Call the handler
      const response = await handler(request, ...args);

      const duration = Date.now() - startTime;

      // Add performance breadcrumb
      Sentry.addBreadcrumb({
        category: 'api',
        message: `${request.method} ${routeName}`,
        level: response.status >= 500 ? 'error' : response.status >= 400 ? 'warning' : 'info',
        data: {
          route: routeName,
          method: request.method,
          duration,
          statusCode: response.status,
        },
      });

      return response;
    } catch (error) {
      // Capture exception
      Sentry.captureException(error, {
        contexts: {
          api: {
            route: routeName,
            method: request.method,
            url: request.url,
            userAgent: request.headers.get('user-agent'),
          },
        },
        tags: {
          route: routeName,
          method: request.method,
        },
      });

      // Return error response
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            sentryEventId: Sentry.lastEventId(),
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Sentry-Event-Id': Sentry.lastEventId() || '',
          },
        }
      );
    }
  };
}

/**
 * Set user context in Sentry
 * 在 Sentry 中设置用户上下文
 */
export function setSentryUser(user: {
  id: string;
  email: string;
  username?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

/**
 * Clear user context in Sentry
 * 清除 Sentry 中的用户上下文
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb to Sentry
 * 添加面包屑到 Sentry
 */
export function addSentryBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  data?: Record<string, any>;
  level?: 'debug' | 'info' | 'warning' | 'error';
}) {
  Sentry.addBreadcrumb({
    category: breadcrumb.category,
    message: breadcrumb.message,
    data: breadcrumb.data,
    level: breadcrumb.level || 'info',
  });
}

/**
 * Capture custom message in Sentry
 * 在 Sentry 中捕获自定义消息
 */
export function captureSentryMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Track API performance
 * 跟踪 API 性能
 */
export function trackAPIPerformance(
  routeName: string,
  method: string,
  duration: number,
  statusCode: number
) {
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${method} ${routeName}`,
    level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info',
    data: {
      route: routeName,
      method,
      duration,
      statusCode,
    },
  });
}
