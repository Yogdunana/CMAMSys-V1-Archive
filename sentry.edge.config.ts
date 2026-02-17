/**
 * Sentry Edge Configuration
 * Sentry Edge 配置
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive information from request headers
    if (event.request?.headers) {
      delete (event.request.headers as any)['authorization'];
      delete (event.request.headers as any)['cookie'];
      delete (event.request.headers as any)['x-api-key'];
    }

    // Ignore errors from health checks
    if (event.transaction?.includes('/health') || event.transaction?.includes('/ready')) {
      return null;
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ChunkLoadError',
    'Network request failed',
  ],

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Attach stack traces
  attachStacktrace: true,

  // Set the maximum number of breadcrumbs
  maxBreadcrumbs: 50,
  });
}
