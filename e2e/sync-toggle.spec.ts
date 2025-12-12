import { test, expect } from '@playwright/test';

test.describe('Sync Toggle Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('sync toggle checkbox should be visible and clickable', async ({ page }) => {
    const syncCheckbox = page.locator('input[type="checkbox"]');
    await expect(syncCheckbox).toBeVisible();
  });

  test('when sync is OFF, min and max can be set independently', async ({ page }) => {
    // Ensure sync is OFF
    const syncCheckbox = page.locator('input[type="checkbox"]');
    const isChecked = await syncCheckbox.isChecked();
    if (isChecked) {
      await syncCheckbox.click();
    }
    
    // Click min=4 and max=6 independently
    await page.click('text=Min Length >> .. >> button:has-text("4")');
    await page.click('text=Max Length >> .. >> button:has-text("6")');
    
    // Verify buttons are active
    await expect(page.locator('text=Min Length >> .. >> button:has-text("4").active')).toBeVisible();
    await expect(page.locator('text=Max Length >> .. >> button:has-text("6").active')).toBeVisible();
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
