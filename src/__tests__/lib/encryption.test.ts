/**
 * Encryption Utilities Tests
 * 加密工具函数测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { encrypt, decrypt, isEncrypted, hashSensitiveData } from '@/lib/encryption';

describe('Encryption Utilities', () => {
  // Set up test environment variables
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only-32-chars';
  });

  const testCases = [
    { name: 'API Key', value: 'sk-1234567890abcdef' },
    { name: 'Password', value: 'MySecurePassword123!' },
    { name: 'Secret Token', value: 'secret-token-xyz-789' },
    { name: 'Long Text', value: 'This is a longer text that should still be encrypted properly without any issues' },
  ];

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const plaintext = 'test-secret';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'test-secret';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      expect(encrypted1).not.toBe(encrypted2); // Different due to random IV
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('');
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });

    it('should handle special characters', () => {
      const plaintext = '特殊字符!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });

    it.each(testCases)('should encrypt $name', ({ value }) => {
      const encrypted = encrypt(value);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'test-secret';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt to original text', () => {
      const plaintext = 'This is a test string';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = '特殊字符!@#$%^&*()';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it.each(testCases)('should decrypt $name correctly', ({ value }) => {
      const encrypted = encrypt(value);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(value);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => decrypt('invalid-base64-data')).toThrow();
    });

    it('should throw error for corrupted encrypted data', () => {
      const encrypted = encrypt('test');
      const corrupted = encrypted.slice(0, -10) + 'corrupted';
      
      expect(() => decrypt(corrupted)).toThrow();
    });
  });

  describe('encrypt/decrypt roundtrip', () => {
    it('should maintain data integrity through encrypt/decrypt cycle', () => {
      const testData = {
        apiKey: 'sk-1234567890',
        secret: 'my-secret-key',
        timestamp: Date.now(),
      };
      
      const plaintext = JSON.stringify(testData);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted);
      
      expect(parsed).toEqual(testData);
    });

    it('should handle multiple encryption/decryption cycles', () => {
      const plaintext = 'test-data';
      
      let current = plaintext;
      for (let i = 0; i < 10; i++) {
        current = decrypt(encrypt(current));
      }
      
      expect(current).toBe(plaintext);
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted data', () => {
      const plaintext = 'test';
      const encrypted = encrypt(plaintext);
      
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(isEncrypted('plain-text')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });

    it('should return false for short strings', () => {
      expect(isEncrypted('short')).toBe(false);
    });
  });

  describe('hashSensitiveData', () => {
    it('should generate a hash', () => {
      const data = 'sensitive-data';
      const hash = hashSensitiveData(data);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should produce consistent hash for same input', () => {
      const data = 'test-data';
      const hash1 = hashSensitiveData(data);
      const hash2 = hashSensitiveData(data);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = hashSensitiveData('data1');
      const hash2 = hashSensitiveData('data2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should be case-sensitive', () => {
      const hash1 = hashSensitiveData('Test');
      const hash2 = hashSensitiveData('test');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should use SHA-256 algorithm (64 hex characters)', () => {
      const hash = hashSensitiveData('test');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long strings', () => {
      const longText = 'x'.repeat(10000);
      const encrypted = encrypt(longText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(longText);
    });

    it('should handle unicode characters', () => {
      const unicode = '🔐🔑💻🎉';
      const encrypted = encrypt(unicode);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(unicode);
    });

    it('should handle newlines and tabs', () => {
      const text = 'line1\nline2\ttab';
      const encrypted = encrypt(text);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(text);
    });
  });
});
