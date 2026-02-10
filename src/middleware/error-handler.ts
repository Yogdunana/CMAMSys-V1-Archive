/**
 * API Error Handler Middleware
 * Centralizes error handling and logging for all API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger, LogLevel } from '@/lib/logger';
import { ZodError } from 'zod';

// Custom error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(401, 'AUTHENTICATION_ERROR', message, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(403, 'AUTHORIZATION_ERROR', message, details);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(404, 'NOT_FOUND', message, details);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(429, 'RATE_LIMIT_EXCEEDED', message, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Handle API errors with logging
 */
export function handleApiError(
  error: unknown,
  request: NextRequest,
  context: string = 'API'
): NextResponse {
  // Create logger with request context
  const logger = createLogger(
    context,
    'error',
    {
      userId: request.headers.get('x-user-id') || undefined,
      requestId: request.headers.get('x-request-id') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    }
  );

  // Log the error
  logger.error(`API Error: ${request.method} ${request.nextUrl.pathname}`, error);

  // Handle different error types
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.issues,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    // Log stack trace for non-API errors
    logger.error('Unexpected error', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Unknown error type
  logger.fatal('Unknown error type', error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * API route wrapper with error handling
 */
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request, handler.name || 'API');
    }
  };
}

/**
 * Async handler wrapper with error handling
 */
export function asyncHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withErrorHandler(handler);
}

/**
 * Create success response
 */
export function successResponse<T = any>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
