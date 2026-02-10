'use client';

/**
 * Performance Monitor Component
 * 性能监控组件
 */

import { useEffect } from 'react';
import reportWebVitals from '@/app/web-vitals';

interface Metric {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function PerformanceMonitor() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS !== 'true') {
      return;
    }

    reportWebVitals((metric: Metric) => {
      // Send to analytics (Google Analytics, etc.)
      if ((window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ),
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Send to custom analytics
      sendToAnalytics(metric);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals]', metric);
      }
    });

    // Monitor custom performance metrics
    observeCustomMetrics();
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Send metrics to custom analytics
 * 发送指标到自定义分析
 */
function sendToAnalytics(metric: Metric) {
  // Get user ID from localStorage (if available)
  const userId = localStorage.getItem('userId') || 'anonymous';

  // Prepare payload
  const payload = {
    metric: {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      id: metric.id,
    },
    user: {
      id: userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
    page: {
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    },
    device: {
      type: getDeviceType(),
      connection: getConnectionInfo(),
    },
  };

  // Send to analytics endpoint
  fetch('/api/v1/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.error('Failed to send web vitals:', error);
  });
}

/**
 * Observe custom performance metrics
 * 观察自定义性能指标
 */
function observeCustomMetrics() {
  // Monitor page load time
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as any;
    if (perfData) {
      const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
      const domContentLoadedTime =
        perfData.domContentLoadedEventEnd - perfData.fetchStart;

      sendCustomMetric('page_load_time', pageLoadTime);
      sendCustomMetric('dom_content_loaded_time', domContentLoadedTime);
    }
  });

  // Monitor API request performance
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const start = performance.now();
    const response = await originalFetch.apply(this, args);
    const end = performance.now();

    let url: string;
    if (typeof args[0] === 'string') {
      url = args[0];
    } else if (args[0] instanceof URL) {
      url = args[0].href;
    } else if (args[0] instanceof Request) {
      url = args[0].url;
    } else {
      url = String(args[0]);
    }

    if (url.startsWith('/api/')) {
      const duration = end - start;
      sendCustomMetric('api_request_duration', duration, {
        url,
        status: response.status,
      });
    }

    return response;
  };
}

/**
 * Send custom metric to analytics
 * 发送自定义指标到分析
 */
function sendCustomMetric(
  name: string,
  value: number,
  metadata?: Record<string, any>
) {
  const payload = {
    metric: {
      name,
      value,
      metadata,
    },
    page: {
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
    },
  };

  fetch('/api/v1/analytics/custom-metrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.error('Failed to send custom metric:', error);
  });
}

/**
 * Get device type
 * 获取设备类型
 */
function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get connection information
 * 获取网络连接信息
 */
function getConnectionInfo(): Record<string, any> {
  const connection = (navigator as any).connection;
  if (!connection) return {};

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Performance Monitor with API integration
 * 与 API 集成的性能监控
 */
export class PerformanceMonitorAPI {
  /**
   * Start measuring a performance operation
   * 开始测量性能操作
   */
  static startMeasure(name: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      sendCustomMetric(name, duration);
    };
  }

  /**
   * Measure async function performance
   * 测量异步函数性能
   */
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const endMeasure = this.startMeasure(name);
    try {
      return await fn();
    } finally {
      endMeasure();
    }
  }
}
