/**
 * Vitest Setup File
 * 全局测试配置和工具
 */

import { vi } from 'vitest';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-key';
process.env.ENCRYPTION_KEY = 'test-encryption-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock console methods in tests (optional)
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
