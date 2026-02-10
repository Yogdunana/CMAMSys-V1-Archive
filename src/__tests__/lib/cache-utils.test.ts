/**
 * Cache Utilities Tests
 * 缓存工具函数测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCacheKey,
  generateHashKey,
  generateTimeWindowHash,
  generateUserHashKey,
  isValidHashKey,
  generatePrefixedCacheKey,
  getCacheExpirySeconds,
  getCacheExpiryDate,
  CacheKeyPrefix,
  CacheExpiry,
} from '@/lib/cache-utils';

describe('Cache Utilities', () => {
  describe('generateCacheKey', () => {
    it('should generate cache key with original and hash', () => {
      const result = generateCacheKey('OPTIMIZATION', 'test content');
      
      expect(result).toHaveProperty('originalKey');
      expect(result).toHaveProperty('hashKey');
      expect(typeof result.originalKey).toBe('string');
      expect(typeof result.hashKey).toBe('string');
    });

    it('should truncate problem content in original key', () => {
      const longContent = 'a'.repeat(200);
      const result = generateCacheKey('OPTIMIZATION', longContent);
      
      expect(result.originalKey.length).toBeLessThanOrEqual(
        'OPTIMIZATION:'.length + 100
      );
    });

    it('should generate consistent hash for same input', () => {
      const result1 = generateCacheKey('OPTIMIZATION', 'test content');
      const result2 = generateCacheKey('OPTIMIZATION', 'test content');
      
      expect(result1.hashKey).toBe(result2.hashKey);
    });

    it('should generate different hash for different input', () => {
      const result1 = generateCacheKey('OPTIMIZATION', 'content1');
      const result2 = generateCacheKey('OPTIMIZATION', 'content2');
      
      expect(result1.hashKey).not.toBe(result2.hashKey);
    });

    it('should generate SHA-256 hash (64 hex characters)', () => {
      const result = generateCacheKey('OPTIMIZATION', 'test');
      
      expect(result.hashKey).toMatch(/^[a-f0-9]{64}$/i);
    });
  });

  describe('generateHashKey', () => {
    it('should generate hash from single string', () => {
      const hash = generateHashKey('test');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should generate hash from multiple strings', () => {
      const hash = generateHashKey('test1', 'test2', 'test3');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should be deterministic', () => {
      const hash1 = generateHashKey('a', 'b', 'c');
      const hash2 = generateHashKey('a', 'b', 'c');
      
      expect(hash1).toBe(hash2);
    });

    it('should be sensitive to order', () => {
      const hash1 = generateHashKey('a', 'b');
      const hash2 = generateHashKey('b', 'a');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = generateHashKey('', '');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should handle special characters', () => {
      const hash = generateHashKey('🔐', 'test!@#$%');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });
  });

  describe('generateTimeWindowHash', () => {
    it('should generate hash with time window', () => {
      const hash = generateTimeWindowHash('test-key');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should include window size in hash', () => {
      const hash1 = generateTimeWindowHash('test-key', 60);
      const hash2 = generateTimeWindowHash('test-key', 120);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash within same time window', () => {
      const hash1 = generateTimeWindowHash('test-key', 60);
      // Same time window (no delay)
      const hash2 = generateTimeWindowHash('test-key', 60);
      
      expect(hash1).toBe(hash2);
    });

    it('should use default window size of 60 minutes', () => {
      const hash1 = generateTimeWindowHash('test-key');
      const hash2 = generateTimeWindowHash('test-key', 60);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('generateUserHashKey', () => {
    it('should generate hash for user and resource type', () => {
      const hash = generateUserHashKey('user-123', 'ai-provider');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should include resource id when provided', () => {
      const hash1 = generateUserHashKey('user-123', 'ai-provider');
      const hash2 = generateUserHashKey('user-123', 'ai-provider', 'provider-456');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hash for different users', () => {
      const hash1 = generateUserHashKey('user-123', 'ai-provider');
      const hash2 = generateUserHashKey('user-456', 'ai-provider');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should be deterministic', () => {
      const hash1 = generateUserHashKey('user-123', 'ai-provider', 'provider-456');
      const hash2 = generateUserHashKey('user-123', 'ai-provider', 'provider-456');
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('isValidHashKey', () => {
    it('should validate correct SHA-256 hash', () => {
      const validHash = 'a'.repeat(64);
      expect(isValidHashKey(validHash)).toBe(true);
    });

    it('should validate mixed case hash', () => {
      const validHash = 'aBcDeF123456'.padEnd(64, '0');
      expect(isValidHashKey(validHash)).toBe(true);
    });

    it('should reject too short hash', () => {
      expect(isValidHashKey('abc')).toBe(false);
    });

    it('should reject too long hash', () => {
      expect(isValidHashKey('a'.repeat(65))).toBe(false);
    });

    it('should reject hash with invalid characters', () => {
      expect(isValidHashKey('g'.repeat(64))).toBe(false); // 'g' is not hex
    });

    it('should reject hash with spaces', () => {
      expect(isValidHashKey(' '.repeat(64))).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidHashKey('')).toBe(false);
    });
  });

  describe('generatePrefixedCacheKey', () => {
    it('should generate hash with prefix', () => {
      const hash = generatePrefixedCacheKey('DISCUSSION', 'test1', 'test2');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should generate different hash for different prefixes', () => {
      const hash1 = generatePrefixedCacheKey('DISCUSSION', 'test');
      const hash2 = generatePrefixedCacheKey('CODE_GENERATION', 'test');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should support all predefined prefixes', () => {
      const prefixes = Object.keys(CacheKeyPrefix) as Array<keyof typeof CacheKeyPrefix>;
      
      prefixes.forEach(prefix => {
        const hash = generatePrefixedCacheKey(prefix, 'test');
        expect(hash).toMatch(/^[a-f0-9]{64}$/i);
      });
    });

    it('should be deterministic', () => {
      const hash1 = generatePrefixedCacheKey('DISCUSSION', 'test1', 'test2');
      const hash2 = generatePrefixedCacheKey('DISCUSSION', 'test1', 'test2');
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('getCacheExpirySeconds', () => {
    it('should return correct seconds for SHORT', () => {
      expect(getCacheExpirySeconds('SHORT')).toBe(60);
    });

    it('should return correct seconds for MEDIUM', () => {
      expect(getCacheExpirySeconds('MEDIUM')).toBe(300);
    });

    it('should return correct seconds for LONG', () => {
      expect(getCacheExpirySeconds('LONG')).toBe(3600);
    });

    it('should return correct seconds for VERY_LONG', () => {
      expect(getCacheExpirySeconds('VERY_LONG')).toBe(86400);
    });

    it('should return correct seconds for WEEK', () => {
      expect(getCacheExpirySeconds('WEEK')).toBe(604800);
    });

    it('should default to MEDIUM', () => {
      expect(getCacheExpirySeconds()).toBe(300);
    });
  });

  describe('getCacheExpiryDate', () => {
    it('should return future date for SHORT', () => {
      const date = getCacheExpiryDate('SHORT');
      const now = new Date();
      const diffSeconds = (date.getTime() - now.getTime()) / 1000;
      
      expect(diffSeconds).toBeGreaterThanOrEqual(59);
      expect(diffSeconds).toBeLessThanOrEqual(61);
    });

    it('should return future date for LONG', () => {
      const date = getCacheExpiryDate('LONG');
      const now = new Date();
      const diffSeconds = (date.getTime() - now.getTime()) / 1000;
      
      expect(diffSeconds).toBeGreaterThanOrEqual(3599);
      expect(diffSeconds).toBeLessThanOrEqual(3601);
    });

    it('should default to MEDIUM', () => {
      const date1 = getCacheExpiryDate();
      const date2 = getCacheExpiryDate('MEDIUM');
      
      // Should be very close (within 1 second)
      const diff = Math.abs(date1.getTime() - date2.getTime());
      expect(diff).toBeLessThan(1000);
    });
  });

  describe('CacheKeyPrefix constants', () => {
    it('should have all required prefixes', () => {
      expect(CacheKeyPrefix.DISCUSSION).toBe('discussion');
      expect(CacheKeyPrefix.CODE_GENERATION).toBe('code_gen');
      expect(CacheKeyPrefix.MODELING_TASK).toBe('modeling_task');
      expect(CacheKeyPrefix.AI_RESPONSE).toBe('ai_response');
      expect(CacheKeyPrefix.USER_SESSION).toBe('user_session');
      expect(CacheKeyPrefix.RATE_LIMIT).toBe('rate_limit');
    });
  });

  describe('CacheExpiry constants', () => {
    it('should have correct values', () => {
      expect(CacheExpiry.SHORT).toBe(60);
      expect(CacheExpiry.MEDIUM).toBe(300);
      expect(CacheExpiry.LONG).toBe(3600);
      expect(CacheExpiry.VERY_LONG).toBe(86400);
      expect(CacheExpiry.WEEK).toBe(604800);
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end: generate, validate, use', () => {
      const problemType = 'OPTIMIZATION';
      const problemContent = 'Test problem content';
      
      // Generate cache key
      const cacheKey = generateCacheKey(problemType, problemContent);
      
      // Validate hash
      expect(isValidHashKey(cacheKey.hashKey)).toBe(true);
      
      // Generate expiry
      const expiryDate = getCacheExpiryDate('LONG');
      expect(expiryDate).toBeInstanceOf(Date);
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('should generate unique keys for different scenarios', () => {
      const key1 = generateCacheKey('OPTIMIZATION', 'content1');
      const key2 = generateCacheKey('PREDICTION', 'content1');
      const key3 = generateCacheKey('OPTIMIZATION', 'content2');
      
      expect(key1.hashKey).not.toBe(key2.hashKey);
      expect(key1.hashKey).not.toBe(key3.hashKey);
      expect(key2.hashKey).not.toBe(key3.hashKey);
    });
  });
});
