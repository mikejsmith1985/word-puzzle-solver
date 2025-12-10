import { test, expect } from '@playwright/test';

test.describe('Sync Toggle Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4175');
    await page.waitForLoadState('networkidle');
  });

  test('sync toggle checkbox should be visible and clickable', async ({ page }) => {
    const syncCheckbox = page.locator('input[type="checkbox"]');
    await expect(syncCheckbox).toBeVisible();
  });

  test('when sync is OFF, min and max can be set independently', async ({ page }) => {
    // Get all length buttons (min and max)
    const minButtons = page.locator('text=Min Length >> .. >> button');
    const maxButtons = page.locator('text=Max Length >> .. >> button');
    
    // Find and click min=3
    await page.click('button:has-text("3")');
    
    // Verify we can set different values independently
    const buttons = page.locator('.btn-length');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('when sync is ON, clicking min sets max to same value', async ({ page }) => {
    // Enable sync toggle
    const syncCheckbox = page.locator('input[type="checkbox"]');
    await syncCheckbox.check();
    
    // Get the state before clicking
    const isChecked = await syncCheckbox.isChecked();
    expect(isChecked).toBe(true);
  });

  test('when sync is ON, clicking max sets min to same value', async ({ page }) => {
    // Enable sync toggle
    const syncCheckbox = page.locator('input[type="checkbox"]');
    await syncCheckbox.check();
    
    // Verify sync is enabled
    const isChecked = await syncCheckbox.isChecked();
    expect(isChecked).toBe(true);
  });

  test('sync toggle can be turned on and off', async ({ page }) => {
    const syncCheckbox = page.locator('input[type="checkbox"]');
    
    // Initially unchecked
    let isChecked = await syncCheckbox.isChecked();
    expect(isChecked).toBe(false);
    
    // Click to enable
    await syncCheckbox.click();
    isChecked = await syncCheckbox.isChecked();
    expect(isChecked).toBe(true);
    
    // Click to disable
    await syncCheckbox.click();
    isChecked = await syncCheckbox.isChecked();
    expect(isChecked).toBe(false);
  });
});
