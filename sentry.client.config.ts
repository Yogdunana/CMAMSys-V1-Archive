/**
 * Sentry Client Configuration
 * Sentry 客户端配置
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set `sessionSampleRate` to 1.0 to capture 100%
  // of sessions for performance monitoring.
  // Note: sessionSampleRate may not be available in Sentry v9
  // sessionSampleRate: 1.0,

  // Enable sampling for performance monitoring
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter out duplicate errors
  beforeSend(event, hint) {
    // Ignore errors from extensions
    if (event.exception) {
      const error = hint.originalException as Error;
      if (error?.message?.includes('Extension')) {
        return null;
      }
    }

    // Add user context if available
    // This will be populated by the backend
    if (event.user && !event.user.id) {
      event.user = undefined;
    }

    return event;
  },

  // Add integrations (Note: Replay and BrowserTracing may need to be imported separately in v9)
  // integrations: [
  //   new Sentry.BrowserTracing({
  //     // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  //     tracePropagationTargets: [
  //       'localhost',
  //       /^\//,
  //       process.env.NEXT_PUBLIC_API_URL || '',
  //     ],
  //   }),
  //   new Sentry.Replay({
  //     // Only capture replays on errors
  //     captureExceptions: true,
  //     captureUnhandledRejections: true,
  //   }),
  // ],

  // Replay settings
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Before send transaction (Note: TransactionEvent may not have 'name' property in v9)
  beforeSendTransaction(transaction) {
    // Filter out health check transactions
    // Note: transaction.name may not be available, use transaction.transaction instead
    if ((transaction as any).transaction?.includes('health') || (transaction as any).name?.includes('health')) {
      return null;
    }
    return transaction;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'ChunkLoadError',
    'Network request failed',
  ],

  // Ignore specific URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
  ],

  // Attach stack traces
  attachStacktrace: true,

  // Set the maximum number of breadcrumbs
  maxBreadcrumbs: 100,
});
