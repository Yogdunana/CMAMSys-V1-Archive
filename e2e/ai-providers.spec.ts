import { test, expect } from '@playwright/test';

test.describe('AI Provider Management', () => {
  let authToken: string;

  test.beforeEach(async ({ page, request }) => {
    // Login to get auth token
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'TestPassword123!',
      },
    });

    const data = await response.json();
    authToken = data.data.accessToken;
  });

  test('should display AI providers list', async ({ page }) => {
    await page.goto('/ai-providers');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=AI Providers')).toBeVisible();
    await expect(page.locator('[data-testid="provider-card"]')).toHaveCount(3);
  });

  test('should create a new AI provider', async ({ page }) => {
    await page.goto('/ai-providers');
    await page.click('text=Add Provider');

    await page.fill('input[name="name"]', 'Test Provider');
    await page.selectOption('select[name="type"]', 'openai');
    await page.fill('input[name="apiKey"]', 'sk-test-api-key');
    await page.fill('input[name="model"]', 'gpt-4');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Provider created successfully')).toBeVisible();
  });

  test('should edit an AI provider', async ({ page }) => {
    await page.goto('/ai-providers');
    await page.click('[data-testid="provider-card"]:first-child [data-testid="edit-button"]');

    await page.fill('input[name="name"]', 'Updated Provider Name');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Provider updated successfully')).toBeVisible();
  });

  test('should delete an AI provider', async ({ page }) => {
    await page.goto('/ai-providers');
    await page.click('[data-testid="provider-card"]:first-child [data-testid="delete-button"]');

    await page.click('text=Confirm');

    await expect(page.locator('text=Provider deleted successfully')).toBeVisible();
  });

  test('should test AI provider connection', async ({ page }) => {
    await page.goto('/ai-providers');
    await page.click('[data-testid="provider-card"]:first-child [data-testid="test-button"]');

    await expect(page.locator('text=Connection successful')).toBeVisible();
  });

  test('should filter providers by type', async ({ page }) => {
    await page.goto('/ai-providers');
    await page.selectOption('select[name="filter"]', 'openai');

    const openaiProviders = page.locator('[data-testid="provider-card"]');
    await expect(openaiProviders.first()).toContainText('OpenAI');
  });
});
