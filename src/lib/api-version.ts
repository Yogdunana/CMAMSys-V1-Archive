/**
 * API Version Control
 * API 版本控制
 */

import { NextRequest, NextResponse } from 'next/server';

export type ApiVersion = 'v1' | 'v2' | 'v3';

/**
 * Extract API version from URL
 * 从 URL 提取 API 版本
 */
export function extractApiVersion(request: NextRequest): ApiVersion | null {
  const pathname = request.nextUrl.pathname;

  // Match /api/v1/, /api/v2/, /api/v3/
  const match = pathname.match(/^\/api\/(v[1-3])\//);

  if (match) {
    return match[1] as ApiVersion;
  }

  return null;
}

/**
 * Check if API version is supported
 * 检查 API 版本是否受支持
 */
export function isApiVersionSupported(version: string): boolean {
  const supportedVersions: ApiVersion[] = ['v1', 'v2', 'v3'];
  return supportedVersions.includes(version as ApiVersion);
}

/**
 * Get default API version
 * 获取默认 API 版本
 */
export function getDefaultApiVersion(): ApiVersion {
  return 'v1';
}

/**
 * Get deprecated versions
 * 获取已弃用的 API 版本
 */
export function getDeprecatedVersions(): ApiVersion[] {
  return []; // 当前没有弃用的版本
}

/**
 * Get deprecation warning for version
 * 获取版本弃用警告
 */
export function getDeprecationWarning(version: ApiVersion): string | null {
  const deprecatedVersions = getDeprecatedVersions();

  if (deprecatedVersions.includes(version)) {
    return `API version ${version} is deprecated. Please migrate to v1.`;
  }

  return null;
}

/**
 * Add API version headers to response
 * 添加 API 版本响应头
 */
export function addApiVersionHeaders(
  response: NextResponse,
  version: ApiVersion
): NextResponse {
  // Set API version header
  response.headers.set('X-API-Version', version);

  // Add deprecation warning if applicable
  const deprecationWarning = getDeprecationWarning(version);
  if (deprecationWarning) {
    response.headers.set('X-API-Deprecated', 'true');
    response.headers.set('X-API-Deprecation-Warning', deprecationWarning);
  }

  // Set supported versions
  response.headers.set('X-API-Supported-Versions', 'v1, v2, v3');

  return response;
}

/**
 * Handle unsupported API version
 * 处理不支持的 API 版本
 */
export function handleUnsupportedVersion(
  request: NextRequest,
  version: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNSUPPORTED_API_VERSION',
        message: `API version ${version} is not supported`,
        details: {
          supportedVersions: ['v1', 'v2', 'v3'],
          documentation: '/api/docs',
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Supported-Versions': 'v1, v2, v3',
      },
    }
  );
}

/**
 * Redirect to default version
 * 重定向到默认版本
 */
export function redirectToDefaultVersion(
  request: NextRequest,
  defaultVersion: ApiVersion = getDefaultApiVersion()
): NextResponse {
  const pathname = request.nextUrl.pathname;
  const newPathname = pathname.replace(/^\/api\//, `/api/${defaultVersion}/`);

  return NextResponse.redirect(new URL(newPathname, request.url));
}

/**
 * API Version Middleware
 * API 版本中间件
 */
export function withApiVersionControl<T extends NextRequest>(
  handler: (request: T, context?: { params?: Promise<any> }) => Promise<NextResponse>,
  options?: {
    requireVersion?: boolean;
    redirectUnsupported?: boolean;
  }
) {
  return async (request: T, context?: { params?: Promise<any> }): Promise<NextResponse> => {
    const opts = {
      requireVersion: true,
      redirectUnsupported: false,
      ...options,
    };

    // Extract version from URL
    const version = extractApiVersion(request);

    // Handle missing version
    if (!version) {
      if (opts.requireVersion) {
        if (opts.redirectUnsupported) {
          return redirectToDefaultVersion(request);
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_API_VERSION',
              message: 'API version is required',
              details: {
                supportedVersions: ['v1', 'v2', 'v3'],
                documentation: '/api/docs',
              },
            },
            timestamp: new Date().toISOString(),
          },
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Supported-Versions': 'v1, v2, v3',
            },
          }
        );
      }
      // Use default version
      return handler(request, context);
    }

    // Handle unsupported version
    if (!isApiVersionSupported(version)) {
      return handleUnsupportedVersion(request, version);
    }

    // Call handler with context
    const response = await handler(request, context);

    // Add API version headers
    return addApiVersionHeaders(response, version);
  };
}

/**
 * Get API version from environment variable
 * 从环境变量获取 API 版本
 */
export function getApiVersionFromEnv(): ApiVersion {
  return (process.env.API_DEFAULT_VERSION as ApiVersion) || getDefaultApiVersion();
}
