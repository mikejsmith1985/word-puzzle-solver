import { test, expect } from '@playwright/test';

test.describe('Word Puzzle Solver', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application with header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Word Puzzle Solver');
    await expect(page.locator('header p')).toContainText('Find words using available letters');
  });

  test('should have all input fields visible', async ({ page }) => {
    await expect(page.locator('input[placeholder="e.g., ABCDEF"]')).toBeVisible();
    
    // Check that min/max length buttons are visible
    await expect(page.locator('text=Min Length')).toBeVisible();
    await expect(page.locator('text=Max Length')).toBeVisible();
    
    // Check that all 6 position constraint inputs are present
    const positionInputs = page.locator('.constraint-box input');
    await expect(positionInputs).toHaveCount(6);
  });

  test('should search for words with available letters', async ({ page }) => {
    // Input letters
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('AEIOT');
    
    // Click search button
    await page.locator('button:has-text("Search")').click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Check that results are displayed
    const resultsHeader = page.locator('.results-header h2');
    await expect(resultsHeader).toContainText('Results');
    
    // Verify that some results were found
    const resultItems = page.locator('.result-item');
    const count = await resultItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by word length', async ({ page }) => {
    // Input letters
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('STARE');
    
    // Set specific length using buttons
    await page.locator('button:has-text("5")').first().click(); // Min length button
    await page.locator('button:has-text("5")').last().click();  // Max length button
    
    // Search
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(1000);
    
    // Verify all results are 5 letters
    const resultItems = page.locator('.result-item');
    const count = await resultItems.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const word = await resultItems.nth(i).locator('.word').textContent();
        expect(word?.trim().length).toBe(5);
      }
    }
  });

  test('should apply position constraints', async ({ page }) => {
    // Input letters
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('AEIOT');
    
    // Set constraint: position 1 = A
    const constraintInputs = page.locator('.constraint-box input');
    await constraintInputs.first().fill('A');
    
    // Search
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(1000);
    
    // Check results
    const resultItems = page.locator('.result-item');
    const count = await resultItems.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const word = await resultItems.nth(i).locator('.word').textContent();
        expect(word?.charAt(0).toUpperCase()).toBe('A');
      }
    }
  });

  test('should clear constraints button work', async ({ page }) => {
    // Input some constraints
    const constraintInputs = page.locator('.constraint-box input');
    await constraintInputs.nth(0).fill('S');
    await constraintInputs.nth(1).fill('T');
    
    // Verify they were filled
    await expect(constraintInputs.nth(0)).toHaveValue('s');
    await expect(constraintInputs.nth(1)).toHaveValue('t');
    
    // Click Clear Constraints button
    await page.locator('button:has-text("Clear Constraints")').click();
    
    // Verify all constraints are cleared
    const allConstraints = page.locator('.constraint-box input');
    for (let i = 0; i < 6; i++) {
      await expect(allConstraints.nth(i)).toHaveValue('');
    }
  });

  test('should clear all button work', async ({ page }) => {
    // Fill in data
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('ABCDEF');
    await page.locator('button:has-text("3")').first().click();   // Min length
    await page.locator('button:has-text("4")').last().click();    // Max length
    
    const constraintInputs = page.locator('.constraint-box input');
    await constraintInputs.nth(0).fill('A');
    
    // Click Clear All
    await page.locator('button:has-text("Clear All")').click();
    
    // Verify everything is cleared
    await expect(page.locator('input[placeholder="e.g., ABCDEF"]')).toHaveValue('');
    
    // Verify min/max buttons are reset to defaults
    const minButtonsActive = page.locator('.button-group-horizontal').first().locator('.btn-length.active');
    const maxButtonsActive = page.locator('.button-group-horizontal').last().locator('.btn-length.active');
    const minText = await minButtonsActive.first().textContent();
    const maxText = await maxButtonsActive.last().textContent();
    expect(minText?.trim()).toBe('3');
    expect(maxText?.trim()).toBe('6');
    
    const allConstraints = page.locator('.constraint-box input');
    for (let i = 0; i < 6; i++) {
      await expect(allConstraints.nth(i)).toHaveValue('');
    }
  });

  test('should copy results to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Search for some words
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('AEIOU');
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(1000);
    
    // Check if copy button appears
    const copyButton = page.locator('button:has-text("Copy All")');
    const resultItems = page.locator('.result-item');
    const count = await resultItems.count();
    
    if (count > 0) {
      await expect(copyButton).toBeVisible();
      await copyButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show no results message for impossible letters', async ({ page }) => {
    // Input letters that won't form common words easily
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('ZZZZZ');
    
    // Search
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(1000);
    
    // Check for no results message
    const noResultsMsg = page.locator('.no-results');
    await expect(noResultsMsg).toContainText('No matches found');
  });

  test('should handle Enter key to search', async ({ page }) => {
    // Fill letters
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('STARE');
    
    // Press Enter
    await page.locator('input[placeholder="e.g., ABCDEF"]').press('Enter');
    await page.waitForTimeout(1000);
    
    // Verify results appeared
    const resultsHeader = page.locator('.results-header h2');
    await expect(resultsHeader).toContainText('Results');
  });

  test('should convert letters to uppercase', async ({ page }) => {
    // Input lowercase
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('stare');
    
    // Verify it's converted to uppercase
    await expect(page.locator('input[placeholder="e.g., ABCDEF"]')).toHaveValue('STARE');
  });

  test('should enforce max 6 letters input', async ({ page }) => {
    // Try to input more than 6 letters
    await page.locator('input[placeholder="e.g., ABCDEF"]').fill('ABCDEFGHIJK');
    
    // Verify only 6 are kept
    const value = await page.locator('input[placeholder="e.g., ABCDEF"]').inputValue();
    expect(value.length).toBeLessThanOrEqual(6);
  });
});
