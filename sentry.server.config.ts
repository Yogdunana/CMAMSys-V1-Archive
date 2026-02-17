/**
 * Sentry Server Configuration
 * Sentry 服务端配置
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive information from request headers
    if (event.request?.headers) {
      delete (event.request.headers as any)['authorization'];
      delete (event.request.headers as any)['cookie'];
      delete (event.request.headers as any)['x-api-key'];
    }

    // Remove sensitive information from request body
    if (event.request?.data) {
      const data = event.request.data as any;
      if (data.password) delete data.password;
      if (data.token) delete data.token;
      if (data.apiKey) delete data.apiKey;
    }

    // Ignore errors from health checks
    if (event.transaction?.includes('/health') || event.transaction?.includes('/ready')) {
      return null;
    }

    return event;
  },

  // Add integrations
  integrations: [
    // Note: BrowserTracing is only for client-side
    // new Sentry.BrowserTracing(),
    // Note: Integrations namespace may have changed in v9
    // new Sentry.Integrations.Http({ tracing: true }),
    // new Sentry.Integrations.Postgres(),
  ],

  // Ignore specific errors
  ignoreErrors: [
    'ChunkLoadError',
    'Network request failed',
    'ETIMEDOUT',
    'ECONNRESET',
  ],

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Attach stack traces
  attachStacktrace: true,

  // Set the maximum number of breadcrumbs
  maxBreadcrumbs: 100,
  });
}
