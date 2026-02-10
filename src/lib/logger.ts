/**
 * Logger Configuration using Pino
 * 使用 Pino 的日志配置
 */

import pino from 'pino';
import fs from 'fs';
import path from 'path';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFilePath = process.env.LOG_FILE_PATH || '/app/work/logs/bypass/app.log';

// Ensure log directory exists
const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create logger instance
export const logger = pino({
  level: logLevel,
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : undefined,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Write to file in production
  ...(process.env.NODE_ENV === 'production' && {
    file: logFilePath,
  }),
});

// Create separate loggers for different contexts
export const authLogger = logger.child({ context: 'auth' });
export const apiLogger = logger.child({ context: 'api' });
export const dbLogger = logger.child({ context: 'database' });
export const aiLogger = logger.child({ context: 'ai' });
export const errorLogger = logger.child({ context: 'error' });
export const securityLogger = logger.child({ context: 'security' });

/**
 * Log API request
 */
export function logAPIRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  apiLogger.info({
    event: 'api_request',
    method,
    url,
    statusCode,
    duration,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log API error
 */
export function logAPIError(
  method: string,
  url: string,
  error: Error,
  statusCode: number,
  userId?: string
) {
  errorLogger.error({
    event: 'api_error',
    method,
    url,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    statusCode,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'register' | 'refresh' | 'verify',
  userId: string,
  email?: string,
  metadata?: Record<string, any>
) {
  authLogger.info({
    event,
    userId,
    email,
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: 'rate_limit_exceeded' | 'csrf_failed' | 'invalid_token' | 'suspicious_activity',
  details: Record<string, any>
) {
  securityLogger.warn({
    event,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log database query
 */
export function logDBQuery(
  operation: string,
  table: string,
  duration: number,
  rowCount?: number
) {
  dbLogger.debug({
    event: 'db_query',
    operation,
    table,
    duration,
    rowCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log database error
 */
export function logDBError(
  operation: string,
  table: string,
  error: Error
) {
  errorLogger.error({
    event: 'db_error',
    operation,
    table,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log AI request
 */
export function logAIRequest(
  provider: string,
  model: string,
  prompt: string,
  response?: string,
  duration?: number,
  error?: Error
) {
  if (error) {
    aiLogger.error({
      event: 'ai_request_failed',
      provider,
      model,
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    aiLogger.info({
      event: 'ai_request_success',
      provider,
      model,
      promptLength: prompt.length,
      responseLength: response?.length,
      duration,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Performance Logger
 */
export class PerformanceLogger {
  private startTime: number;
  private operation: string;
  private metadata: Record<string, any>;

  constructor(operation: string, metadata: Record<string, any> = {}) {
    this.startTime = performance.now();
    this.operation = operation;
    this.metadata = metadata;
  }

  /**
   * End performance measurement
   */
  end() {
    const duration = performance.now() - this.startTime;
    logger.info({
      event: 'performance',
      operation: this.operation,
      duration,
      metadata: this.metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log intermediate step
   */
  step(stepName: string) {
    const duration = performance.now() - this.startTime;
    logger.debug({
      event: 'performance_step',
      operation: this.operation,
      step: stepName,
      duration,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Create a performance logger
 */
export function createPerformanceLogger(
  operation: string,
  metadata?: Record<string, any>
) {
  return new PerformanceLogger(operation, metadata);
}

/**
 * Create a custom logger instance
 */
export function createLogger(
  name: string,
  level?: LogLevel,
  metadata?: Record<string, any>
) {
  return logger.child({
    context: name,
    level: level || logLevel,
    ...metadata,
  });
}
