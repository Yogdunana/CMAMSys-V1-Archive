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
    .setProtectedHeader({ alg: 'HS256' })
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
    .setProtectedHeader({ alg: 'HS256' })
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
    return payload as unknown as AccessTokenPayload;
  } catch (error) {
    console.error('Invalid access token:', error);
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
    return payload as unknown as RefreshTokenPayload;
  } catch (error) {
    console.error('Invalid refresh token:', error);
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
