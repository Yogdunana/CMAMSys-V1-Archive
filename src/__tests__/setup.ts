/**
 * Test setup file
 * Set up environment variables for tests
 */

import { beforeAll } from 'vitest';

beforeAll(() => {
  // Set up test environment variables
  process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only-32-chars';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32-chars';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-for-testing-32';
  process.env.CSRF_SECRET = 'test-csrf-secret-for-testing-only-32-chars';
  process.env.SESSION_SECRET = 'test-session-secret-for-testing-only-32-chars';
});
