/**
 * Password Utilities Tests
 * 密码工具函数测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  PasswordStrength,
} from '@/lib/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', () => {
      const password = 'MySecurePassword123!';
      const hash = hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should produce different hashes for same password (due to salt)', () => {
      const password = 'test-password';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different due to random salt
    });

    it('should handle empty string', () => {
      const hash = hashPassword('');
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should include bcrypt format', () => {
      const password = 'test';
      const hash = hashPassword(password);
      
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hashes start with $2a$, $2b$, or $2y$
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const password = 'MySecurePassword123!';
      const hash = hashPassword(password);
      const isValid = verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const password = 'MySecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = hashPassword(password);
      const isValid = verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject empty password against non-empty hash', () => {
      const password = 'MySecurePassword123!';
      const hash = hashPassword(password);
      const isValid = verifyPassword('', hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject invalid hash format', () => {
      const password = 'test';
      const invalidHash = 'not-a-bcrypt-hash';
      
      expect(() => verifyPassword(password, invalidHash)).toThrow();
    });

    it('should verify password against multiple hashes', () => {
      const password = 'test-password';
      const hashes = [
        hashPassword(password),
        hashPassword(password),
        hashPassword(password),
      ];
      
      hashes.forEach(hash => {
        expect(verifyPassword(password, hash)).toBe(true);
      });
    });
  });

  describe('hashPassword and verifyPassword roundtrip', () => {
    const testCases = [
      'simple',
      'Complex123!',
      'With$pecial#Characters',
      '🔐 Unicode 🌐',
      'verylongpasswordthatisstillacceptable',
      'with spaces and\ttabs\nnewlines',
    ];

    it.each(testCases)('should correctly hash and verify: %s', (password) => {
      const hash = hashPassword(password);
      const isValid = verifyPassword(password, hash);
      
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
      expect(result.feedback).toContain(expect.stringMatching(/length/i));
    });

    it('should provide feedback for missing special characters', () => {
      const result = checkPasswordStrength('Password123');
      
      expect(result.feedback).toContain(expect.stringMatching(/special/i));
    });

    it('should have no feedback for very strong password', () => {
      const result = checkPasswordStrength('Password123!@#');
      
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
    it('should use bcrypt cost factor >= 10', () => {
      const password = 'test';
      const hash = hashPassword(password);
      
      // Extract cost factor from bcrypt hash (format: $2a$10$...)
      const costFactor = parseInt(hash.split('$')[2]);
      
      expect(costFactor).toBeGreaterThanOrEqual(10);
    });

    it('should not produce same hash for same input (salt randomness)', () => {
      const password = 'same-password';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should verify password in constant time (security requirement)', () => {
      const password = 'test-password';
      const hash = hashPassword(password);
      
      const start1 = performance.now();
      verifyPassword(password, hash);
      const time1 = performance.now() - start1;
      
      const start2 = performance.now();
      verifyPassword('wrong-password', hash);
      const time2 = performance.now() - start2;
      
      // Times should be similar (within 50% variance)
      const ratio = Math.max(time1, time2) / Math.min(time1, time2);
      expect(ratio).toBeLessThan(2); // Less than 2x difference
    });
  });
});
