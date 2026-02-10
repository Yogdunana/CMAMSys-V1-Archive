/**
 * Dashboard E2E Tests
 * 仪表盘 E2E 测试
 *
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard API E2E Tests', () => {
  let authToken: string;
  let csrfToken: string;

  test.beforeAll(async ({ request }) => {
    // 获取 CSRF Token
    const csrfResponse = await request.get('/api/v1/auth/csrf-token');
    const csrfData = await csrfResponse.json();
    csrfToken = csrfData.data.token;

    // 登录获取认证令牌
    const loginResponse = await request.post('/api/v1/auth/login', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      data: {
        email: 'yogdunana@yogdunana.com',
        password: 'X-Duan0719',
      },
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.data.accessToken;
    }
  });

  test.describe('GET /api/v1/dashboard/stats', () => {
    test('should return dashboard statistics', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('activeCompetitions');
      expect(data.data).toHaveProperty('modelingTasks');
      expect(data.data).toHaveProperty('teamMembers');
      expect(data.data).toHaveProperty('aiRequests');
      expect(data.data).toHaveProperty('aiProviders');
      expect(data.data).toHaveProperty('totalTasks');
      expect(data.data).toHaveProperty('completedTasks');
      expect(data.data).toHaveProperty('successRate');
      expect(data.data).toHaveProperty('avgProgress');
      expect(data.data).toHaveProperty('period');
    });

    test('should support custom time period', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/stats?days=7', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.period.days).toBe(7);
    });

    test('should fail without authentication', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/stats');

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    test('should respect rate limiting', async ({ request }) => {
      const requests = [];

      for (let i = 0; i < 105; i++) {
        requests.push(
          request.get('/api/v1/dashboard/stats', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      // 预期会有一些请求被速率限制
      const rateLimitedResponses = responses.filter((r) => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('GET /api/v1/dashboard/activities', () => {
    test('should return all activities', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/activities', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toHaveProperty('count');
      expect(data.meta).toHaveProperty('type');
      expect(data.meta).toHaveProperty('limit');
    });

    test('should filter by type', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/activities?type=tasks', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.meta.type).toBe('tasks');

      if (data.data.length > 0) {
        expect(data.data[0].type).toBe('task');
      }
    });

    test('should support custom limit', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/activities?limit=5', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(5);
      expect(data.meta.limit).toBe(5);
    });

    test('should include different activity types', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/activities', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      const activityTypes = new Set(data.data.map((a: any) => a.type));

      // 预期至少有一种活动类型
      expect(activityTypes.size).toBeGreaterThan(0);
    });

    test('should return activities in descending order', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/activities', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();

      if (data.data.length > 1) {
        const firstDate = new Date(data.data[0].createdAt);
        const secondDate = new Date(data.data[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });

    test('should fail without authentication', async ({ request }) => {
      const response = await request.get('/api/v1/dashboard/activities');

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  test.describe('Dashboard Integration Tests', () => {
    test('should display dashboard page', async ({ page }) => {
      await page.goto('/dashboard');

      // 等待页面加载
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      await expect(page).toHaveTitle(/Dashboard/);

      // 验证统计卡片存在
      await expect(page.locator('[data-testid="active-competitions"]')).toBeVisible();
      await expect(page.locator('[data-testid="modeling-tasks"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-members"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-requests"]')).toBeVisible();
    });

    test('should load recent activities', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // 等待活动列表加载
      await page.waitForSelector('[data-testid="activity-list"]');

      // 验证活动项存在
      const activities = page.locator('[data-testid="activity-item"]');
      const count = await activities.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should refresh dashboard data', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // 点击刷新按钮
      await page.click('[data-testid="refresh-button"]');

      // 验证加载指示器显示
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();

      // 验证加载指示器消失
      await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
    });

    test('should filter activities by type', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // 选择任务过滤器
      await page.selectOption('[data-testid="activity-filter"]', 'tasks');

      // 验证只显示任务活动
      const activities = page.locator('[data-testid="activity-item"]');
      const count = await activities.count();

      if (count > 0) {
        const firstActivity = activities.first();
        await expect(firstActivity).toContainText('task');
      }
    });
  });
});
