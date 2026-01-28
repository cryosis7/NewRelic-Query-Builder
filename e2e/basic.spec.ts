import { test, expect } from '@playwright/test';

test.describe('NR Query Builder - Basic Load', () => {
  test('page loads with heading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for main heading - NRQL Query Builder or similar
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Verify the heading text contains expected content
    await expect(heading).toContainText(/NRQL|Query|Builder/i);
  });

  test('page has query preview section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for the query preview area (contains generated NRQL)
    const queryPreview = page.locator('pre');
    await expect(queryPreview).toBeVisible();
    
    // Should contain NRQL keywords
    await expect(queryPreview).toContainText(/FROM|SELECT|WHERE/i);
  });
});
