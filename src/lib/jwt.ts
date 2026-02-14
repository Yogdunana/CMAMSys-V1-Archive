/**
 * JWT (JSON Web Token) Utilities
 * Handles token generation, verification, and refresh token management
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-token-key'
);

// 调试：输出 Secret（只在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('[JWT] JWT_SECRET loaded:', JWT_SECRET.byteLength, 'bytes');
  console.log('[JWT] REFRESH_TOKEN_SECRET loaded:', REFRESH_TOKEN_SECRET.byteLength, 'bytes');
  console.log('[JWT] JWT_SECRET from env:', !!process.env.JWT_SECRET);
  console.log('[JWT] REFRESH_TOKEN_SECRET from env:', !!process.env.REFRESH_TOKEN_SECRET);
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any; // Index signature for compatibility with jose
}

export interface AccessTokenPayload extends TokenPayload {
  type: 'access';
}

export interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
  tokenId: string;
}

/**
 * Generate Access Token
 * Valid for 15 minutes by default
 */
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  const accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';

  return await new SignJWT({ ...payload, type: 'access' } as AccessTokenPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpiry)
    .sign(JWT_SECRET);
}

/**
 * Generate Refresh Token
 * Valid for 7 days by default
 */
export async function generateRefreshToken(
  payload: TokenPayload,
  tokenId: string
): Promise<string> {
  const refreshTokenExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

  return await new SignJWT(
    { ...payload, type: 'refresh', tokenId } as RefreshTokenPayload
  )
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpiry)
    .sign(REFRESH_TOKEN_SECRET);
}

/**
 * Verify Access Token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 验证 token 类型
    if (payload.type !== 'access') {
      console.error('[JWT] Invalid token type, expected "access", got:', payload.type);
      return null;
    }

    return payload as unknown as AccessTokenPayload;
  } catch (error: any) {
    console.error('[JWT] Invalid access token:', error.name, error.message);
    // 添加更多调试信息
    if (process.env.NODE_ENV === 'development') {
      console.error('[JWT] Token:', token.substring(0, 50) + '...');
      console.error('[JWT] Secret length:', JWT_SECRET.byteLength);
    }
    return null;
  }
}

/**
 * Verify Refresh Token
 */
export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);

    // 验证 token 类型
    if (payload.type !== 'refresh') {
      console.error('[JWT] Invalid token type, expected "refresh", got:', payload.type);
      return null;
    }

    return payload as unknown as RefreshTokenPayload;
  } catch (error: any) {
    console.error('[JWT] Invalid refresh token:', error.name, error.message);
    // 添加更多调试信息
    if (process.env.NODE_ENV === 'development') {
      console.error('[JWT] Token:', token.substring(0, 50) + '...');
      console.error('[JWT] Secret length:', REFRESH_TOKEN_SECRET.byteLength);
    }
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}
