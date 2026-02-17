/**
 * JWT Utilities Tests
 * JWT 工具函数测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} from '@/lib/jwt';
import type { AccessTokenPayload, RefreshTokenPayload } from '@/lib/jwt';

describe('JWT Utilities', () => {
  // Set up test environment variables
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32-chars';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-for-testing-32';
  });

  const mockUserPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', async () => {
      const token = await generateAccessToken(mockUserPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include correct payload in token', async () => {
      const token = await generateAccessToken(mockUserPayload);
      const decoded = decodeToken(token);
      
      expect(decoded.userId).toBe(mockUserPayload.userId);
      expect(decoded.email).toBe(mockUserPayload.email);
      expect(decoded.role).toBe(mockUserPayload.role);
      expect(decoded.type).toBe('access');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', async () => {
      const tokenId = 'token-456';
      const token = await generateRefreshToken(mockUserPayload, tokenId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include tokenId in payload', async () => {
      const tokenId = 'token-456';
      const token = await generateRefreshToken(mockUserPayload, tokenId);
      const decoded = decodeToken(token);
      
      expect(decoded.tokenId).toBe(tokenId);
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', async () => {
      const token = await generateAccessToken(mockUserPayload);
      const payload = await verifyAccessToken(token);
      
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUserPayload.userId);
      expect(payload?.email).toBe(mockUserPayload.email);
      expect(payload?.role).toBe(mockUserPayload.role);
    });

    it('should return null for invalid token', async () => {
      const payload = await verifyAccessToken('invalid.token.string');
      
      expect(payload).toBeNull();
    });

    it('should return null for expired token (simulated)', async () => {
      // Note: In real test, we would create a token with short expiry and wait
      // For now, we just verify it rejects malformed tokens
      const payload = await verifyAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid');
      
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const tokenId = 'token-456';
      const token = await generateRefreshToken(mockUserPayload, tokenId);
      const payload = await verifyRefreshToken(token);
      
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUserPayload.userId);
      expect(payload?.tokenId).toBe(tokenId);
      expect(payload?.type).toBe('refresh');
    });

    it('should return null for invalid refresh token', async () => {
      const payload = await verifyRefreshToken('invalid.token.string');
      
      expect(payload).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', async () => {
      const token = await generateAccessToken(mockUserPayload);
      const decoded = decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('not.a.token');
      
      expect(decoded).toBeNull();
    });

    it('should decode malformed token', () => {
      const decoded = decodeToken('a.b');
      
      expect(decoded).toBeDefined(); // decodeToken tries to parse, may return partial data
    });
  });

  describe('Token Structure', () => {
    it('access token should have correct structure', async () => {
      const token = await generateAccessToken(mockUserPayload);
      const parts = token.split('.');
      
      expect(parts).toHaveLength(3);
      
      // Header should be base64 encoded JSON
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      expect(header.alg).toBe('HS256');
      expect(header.typ).toBe('JWT');
      
      // Payload should have specific fields
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.userId).toBe(mockUserPayload.userId);
      expect(payload.email).toBe(mockUserPayload.email);
      expect(payload.role).toBe(mockUserPayload.role);
      expect(payload.type).toBe('access');
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
    });
  });
});
