/**
 * JWT (JSON Web Token) Utilities
 * Handles token generation, verification, and refresh token management
 */

import { SignJWT, jwtVerify } from 'jose';

/**
 * Get JWT secret from environment
 * Throws error if not set (unless in test mode)
 */
function getJwtSecret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(value);
}

/**
 * Get refresh token secret from environment
 * Throws error if not set
 */
function getRefreshTokenSecret(): Uint8Array {
  const value = process.env.REFRESH_TOKEN_SECRET;
  if (!value) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is required');
  }
  return new TextEncoder().encode(value);
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
    .sign(getJwtSecret());
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
    .sign(getRefreshTokenSecret());
}

/**
 * Verify Access Token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    // 验证 token 类型
    if (payload.type !== 'access') {
      console.error('[JWT] Invalid token type, expected "access", got:', payload.type);
      return null;
    }

    return payload as unknown as AccessTokenPayload;
  } catch (error: any) {
    console.error('[JWT] Invalid access token:', error.name, error.message);
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
    const { payload } = await jwtVerify(token, getRefreshTokenSecret());

    // 验证 token 类型
    if (payload.type !== 'refresh') {
      console.error('[JWT] Invalid token type, expected "refresh", got:', payload.type);
      return null;
    }

    return payload as unknown as RefreshTokenPayload;
  } catch (error: any) {
    console.error('[JWT] Invalid refresh token:', error.name, error.message);
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

/**
 * 检查错误是否是 JWT 签名验证失败
 */
export function isJWTSignatureError(error: any): boolean {
  return error?.name === 'JWSSignatureVerificationFailed' ||
         error?.message?.includes('signature verification failed');
}

/**
 * 检查错误是否是 JWT 过期
 */
export function isJWTExpiredError(error: any): boolean {
  return error?.name === 'JWTExpired' ||
         error?.message?.includes('expired');
}

/**
 * 获取 JWT 错误类型
 */
export function getJWTErrorType(error: any): 'signature' | 'expired' | 'invalid' | 'unknown' {
  if (isJWTSignatureError(error)) {
    return 'signature';
  }
  if (isJWTExpiredError(error)) {
    return 'expired';
  }
  return 'unknown';
}

