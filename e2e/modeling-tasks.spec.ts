import { test, expect } from '@playwright/test';

test.describe('Modeling Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('should display modeling tasks list', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Modeling Tasks')).toBeVisible();
    await expect(page.locator('[data-testid="task-card"]')).toBeVisible();
  });

  test('should create a new modeling task', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.click('text=Create Task');

    await page.fill('input[name="title"]', 'Test Modeling Task');
    await page.fill('textarea[name="description"]', 'This is a test task for E2E testing');
    await page.fill('input[name="problemType"]', 'Optimization');
    await page.selectOption('select[name="priority"]', 'high');
    await page.fill('input[name="deadline"]', '2024-12-31');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Task created successfully')).toBeVisible();
  });

  test('should view task details', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.click('[data-testid="task-card"]:first-child');

    await expect(page.locator('text=Task Details')).toBeVisible();
    await expect(page.locator('[data-testid="task-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-description"]')).toBeVisible();
  });

  test('should start a modeling task', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.click('[data-testid="task-card"]:first-child');
    await page.click('[data-testid="start-button"]');

    await expect(page.locator('text=Task started successfully')).toBeVisible();
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Running');
  });

  test('should pause a running task', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.click('[data-testid="task-card"]:first-child');
    await page.click('[data-testid="pause-button"]');

    await expect(page.locator('text=Task paused successfully')).toBeVisible();
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Paused');
  });

  test('should view task logs', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.click('[data-testid="task-card"]:first-child');
    await page.click('[data-testid="logs-tab"]');

    await expect(page.locator('[data-testid="log-entries"]')).toBeVisible();
  });

  test('should download task results', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.click('[data-testid="task-card"]:first-child');
    await page.click('[data-testid="download-button"]');

    // Verify download started
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('should filter tasks by status', async ({ page }) => {
    await page.goto('/modeling-tasks');
    await page.selectOption('select[name="statusFilter"]', 'completed');

    const completedTasks = page.locator('[data-testid="task-card"]');
    await expect(completedTasks.first()).toContainText('Completed');
  });
});
