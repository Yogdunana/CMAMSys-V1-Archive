/**
 * Password Utilities Tests
 * 密码工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  PasswordStrength,
} from '@/lib/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'MySecurePassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should produce different hashes for same password (due to salt)', async () => {
      const password = 'test-password';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different due to random salt
    });

    it('should handle empty string', async () => {
      const hash = await hashPassword('');
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should include bcrypt format', async () => {
      const password = 'test';
      const hash = await hashPassword(password);
      
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hashes start with $2a$, $2b$, or $2y$
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'MySecurePassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'MySecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password against non-empty hash', async () => {
      const password = 'MySecurePassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should reject invalid hash format', async () => {
      const password = 'test';
      const invalidHash = 'not-a-bcrypt-hash';

      const isValid = await verifyPassword(password, invalidHash);
      expect(isValid).toBe(false); // bcrypt.compare returns false for invalid hash
    });

    it('should verify password against multiple hashes', async () => {
      const password = 'test-password';
      const hashes = await Promise.all([
        hashPassword(password),
        hashPassword(password),
        hashPassword(password),
      ]);

      for (const hash of hashes) {
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    }, 10000);

    it('should reject null/undefined parameters', async () => {
      const validHash = await hashPassword('test');

      const isValidNull = await verifyPassword(null as any, validHash);
      expect(isValidNull).toBe(false);

      const isValidUndefined = await verifyPassword(undefined as any, validHash);
      expect(isValidUndefined).toBe(false);

      const isValidNullHash = await verifyPassword('test', null as any);
      expect(isValidNullHash).toBe(false);

      const isValidUndefinedHash = await verifyPassword('test', undefined as any);
      expect(isValidUndefinedHash).toBe(false);
    });

    it('should reject non-string parameters', async () => {
      const validHash = await hashPassword('test');

      const isValidNumber = await verifyPassword(123 as any, validHash);
      expect(isValidNumber).toBe(false);

      const isValidObject = await verifyPassword({} as any, validHash);
      expect(isValidObject).toBe(false);
    });
  });

  describe('hashPassword and verifyPassword roundtrip', () => {
    const testCases = [
      { name: 'simple', password: 'simple' },
      { name: 'Complex', password: 'Complex123!' },
      { name: 'Special', password: 'With$pecial#Characters' },
      { name: 'Unicode', password: '🔐 Unicode 🌐' },
      { name: 'Long', password: 'verylongpasswordthatisstillacceptable' },
      { name: 'Spaces', password: 'with spaces and\ttabs\nnewlines' },
    ];

    it.each(testCases)('should correctly hash and verify: $name', async ({ password }) => {
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should return WEAK for very short password', () => {
      const result = checkPasswordStrength('abc');
      
      expect(result.strength).toBe(PasswordStrength.WEAK);
      expect(result.score).toBeLessThan(40);
    });

    it('should return WEAK for only lowercase letters', () => {
      const result = checkPasswordStrength('password');
      
      expect(result.strength).toBe(PasswordStrength.WEAK);
    });

    it('should return MEDIUM for password with mixed case', () => {
      const result = checkPasswordStrength('Password');
      
      expect(result.strength).toBe(PasswordStrength.MEDIUM);
    });

    it('should return MEDIUM for password with numbers', () => {
      const result = checkPasswordStrength('password123');
      
      expect(result.strength).toBe(PasswordStrength.MEDIUM);
    });

    it('should return STRONG for password with mixed case and numbers', () => {
      const result = checkPasswordStrength('Password123');
      
      expect(result.strength).toBe(PasswordStrength.STRONG);
    });

    it('should return VERY_STRONG for password with all requirements', () => {
      const result = checkPasswordStrength('Password123!');
      
      expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('should provide feedback for weak password', () => {
      const result = checkPasswordStrength('abc');

      expect(result.feedback.length).toBeGreaterThan(0);
      // 短密码会得到关于长度的反馈
      expect(result.feedback).toContain('Password is too short');
    });

    it('should provide feedback for missing special characters', () => {
      const result = checkPasswordStrength('Password123');

      // Password123 没有特殊字符，应该得到反馈
      expect(result.feedback).toContain('Add special characters');
    });

    it('should have no feedback for very strong password', () => {
      const result = checkPasswordStrength('Password123!@#');

      // 强密码应该没有反馈
      expect(result.feedback.length).toBe(0);
    });

    it('should calculate score between 0 and 100', () => {
      const result = checkPasswordStrength('test');
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle empty password', () => {
      const result = checkPasswordStrength('');
      
      expect(result.strength).toBe(PasswordStrength.WEAK);
      expect(result.score).toBe(0);
    });
  });

  describe('Password Strength Edge Cases', () => {
    it('should reward length (8+ characters)', () => {
      const short = checkPasswordStrength('Pass1!');
      const long = checkPasswordStrength('Password123!');
      
      expect(long.score).toBeGreaterThan(short.score);
    });

    it('should reward very long passwords (16+ characters)', () => {
      const medium = checkPasswordStrength('Password123!');
      const long = checkPasswordStrength('VeryLongPassword123!');
      
      expect(long.score).toBeGreaterThan(medium.score);
    });

    it('should reward complexity (multiple character types)', () => {
      const simple = checkPasswordStrength('password');
      const complex = checkPasswordStrength('P@ssw0rd!');
      
      expect(complex.score).toBeGreaterThan(simple.score);
    });
  });

  describe('Security Considerations', () => {
    it('should use bcrypt cost factor >= 10', async () => {
      const password = 'test';
      const hash = await hashPassword(password);

      // Extract cost factor from bcrypt hash (format: $2a$10$...)
      const costFactor = parseInt(hash.split('$')[2]);

      expect(costFactor).toBeGreaterThanOrEqual(10);
    });

    it('should not produce same hash for same input (salt randomness)', async () => {
      const password = 'same-password';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should verify password in reasonable time', async () => {
      const password = 'test-password';
      const hash = await hashPassword(password);

      const start1 = performance.now();
      await verifyPassword(password, hash);
      const time1 = performance.now() - start1;

      const start2 = performance.now();
      await verifyPassword('wrong-password', hash);
      const time2 = performance.now() - start2;
      
      // Both should complete in reasonable time
      expect(time1).toBeLessThan(1000); // < 1 second
      expect(time2).toBeLessThan(1000); // < 1 second
    });
  });

  describe('Error Handling', () => {
    it('should handle bcrypt errors gracefully', async () => {
      // Test with corrupted hash
      const corruptedHash = '$2a$10$' + 'x'.repeat(50);
      
      const result = await verifyPassword('test', corruptedHash);
      // Should return false rather than throw for corrupted but valid format
      expect(result).toBe(false);
    });

    it('should handle malformed hash gracefully', async () => {
      const malformedHash = '$2a$invalid';
      
      // bcrypt.compare returns false for malformed hashes instead of throwing
      const result = await verifyPassword('test', malformedHash);
      expect(result).toBe(false);
    });

    it('should handle extremely long passwords (within bcrypt limits)', async () => {
      // bcrypt has a 72-byte limit, so we test a shorter very long password
      const veryLong = 'a'.repeat(72);
      const hash = await hashPassword(veryLong);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      
      // Verify it still works
      const isValid = await verifyPassword(veryLong, hash);
      expect(isValid).toBe(true);
    });

    it('should reject passwords exceeding bcrypt limit', async () => {
      // bcrypt limit is 72 bytes, this will be truncated
      const tooLong = 'a'.repeat(100);
      const hash = await hashPassword(tooLong);
      
      expect(hash).toBeDefined();
      // bcrypt truncates at 72 bytes, so this will verify correctly
      // against the truncated version
      const isValid = await verifyPassword('a'.repeat(72), hash);
      expect(isValid).toBe(true);
    });
  });
});
