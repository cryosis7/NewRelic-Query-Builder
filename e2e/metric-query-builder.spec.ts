import { test, expect, Page, Locator } from '@playwright/test';

test.describe('Metric Query Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) => page.getByRole('group', { name: 'Generated Query' });

  // Helper to get metric group
  const getMetricGroup = (page: Page) => page.getByRole('group', { name: 'Metric Queries' });

  test.describe('Metric Items (4.1)', () => {
    test('4.1.1 Default metric - One metric with Transaction type and Count aggregation', async ({ page }) => {
      // Should have exactly one metric item
      const metricGroup = getMetricGroup(page);
      await expect(metricGroup.getByText('Metric 1')).toBeVisible();
      await expect(metricGroup.getByText('Metric 2')).not.toBeVisible();

      // First metric type dropdown should show "Transaction"
      const metricTypeDropdown = metricGroup.getByRole('combobox').first();
      await expect(metricTypeDropdown).toContainText('Transaction');

      // Aggregation dropdown should show "Count"
      const aggregationDropdown = metricGroup.getByRole('combobox').nth(1);
      await expect(aggregationDropdown).toContainText('Count');

      // Query should contain count(*)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(*)');
    });

    test('4.1.2 Add second metric - Click Add metric, verify second appears', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // Click Add metric button
      await page.getByRole('button', { name: 'Add metric' }).click();

      // Should now have Metric 2
      await expect(metricGroup.getByText('Metric 2')).toBeVisible();

      // Query should now have two count(*) expressions
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(*), count(*)');
    });

    test('4.1.3 Remove metric - When 2+ exist, remove one', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // Add second metric
      await page.getByRole('button', { name: 'Add metric' }).click();
      await expect(metricGroup.getByText('Metric 2')).toBeVisible();

      // Now both Remove buttons should be enabled
      const removeButtons = metricGroup.getByRole('button', { name: 'Remove' });
      await expect(removeButtons.first()).toBeEnabled();
      await expect(removeButtons.last()).toBeEnabled();

      // Remove the second metric
      await removeButtons.last().click();

      // Should only have Metric 1 now
      await expect(metricGroup.getByText('Metric 1')).toBeVisible();
      await expect(metricGroup.getByText('Metric 2')).not.toBeVisible();

      // Query should have single count(*)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).not.toContainText('count(*), count(*)');
    });

    test('4.1.4 Cannot remove last - Remove button disabled when only one metric', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // With only one metric, Remove button should be disabled
      const removeButton = metricGroup.getByRole('button', { name: 'Remove' });
      await expect(removeButton).toBeDisabled();
    });
  });

  test.describe('Metric Type Selection (4.2)', () => {
    test('4.2.1 Select Duration - Change type to Duration', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // Click the metric type dropdown
      const metricTypeDropdown = metricGroup.getByRole('combobox').first();
      await metricTypeDropdown.click();

      // Select Duration
      await page.getByRole('option', { name: 'Duration' }).click();

      // Verify dropdown now shows Duration
      await expect(metricTypeDropdown).toContainText('Duration');

      // Query should contain count(duration) by default
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(duration)');
    });

    test('4.2.2 Transaction shows count(*)', async ({ page }) => {
      // Default is Transaction, so just verify query
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(*)');
      await expect(queryPreview).not.toContainText('count(duration)');
    });

    test('4.2.3 Response Status shows count(response.status)', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // Click the metric type dropdown
      await metricGroup.getByRole('combobox').first().click();

      // Select Response Status
      await page.getByRole('option', { name: 'Response Status' }).click();

      // Query should contain count(response.status)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(response.status)');
    });

    test('4.2.4 Duration with Average shows average(duration)', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // Select Duration type
      await metricGroup.getByRole('combobox').first().click();
      await page.getByRole('option', { name: 'Duration' }).click();

      // Select Average aggregation
      await metricGroup.getByRole('combobox').nth(1).click();
      await page.getByRole('option', { name: 'Average' }).click();

      // Query should show average(duration)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('average(duration)');
    });

    test('4.2.5 Duration with P95 shows percentile(duration, 95)', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // Select Duration type
      await metricGroup.getByRole('combobox').first().click();
      await page.getByRole('option', { name: 'Duration' }).click();

      // Select 95th Percentile aggregation
      await metricGroup.getByRole('combobox').nth(1).click();
      await page.getByRole('option', { name: '95th Percentile' }).click();

      // Query should show percentile(duration, 95)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('percentile(duration, 95)');
    });
  });

  test.describe('Aggregation Constraints (4.3)', () => {
    test('4.3.1 Non-duration (Transaction) only has Count option', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // With Transaction type, click aggregation dropdown
      await metricGroup.getByRole('combobox').nth(1).click();

      // Should only have Count option
      const countOption = page.getByRole('option', { name: 'Count' });
      await expect(countOption).toBeVisible();

      // Should NOT have Average or 95th Percentile
      const averageOption = page.getByRole('option', { name: 'Average' });
      const p95Option = page.getByRole('option', { name: '95th Percentile' });
      await expect(averageOption).not.toBeVisible();
      await expect(p95Option).not.toBeVisible();
    });

    test('4.3.2 Switch from Duration resets aggregation to Count', async ({ page }) => {
      const metricGroup = getMetricGroup(page);
      
      // First, set to Duration with Average
      await metricGroup.getByRole('combobox').first().click();
      await page.getByRole('option', { name: 'Duration' }).click();
      
      await metricGroup.getByRole('combobox').nth(1).click();
      await page.getByRole('option', { name: 'Average' }).click();

      // Verify it's set to Average
      await expect(metricGroup.getByRole('combobox').nth(1)).toContainText('Average');
      await expect(getQueryPreview(page)).toContainText('average(duration)');

      // Now switch metric type to Transaction
      await metricGroup.getByRole('combobox').first().click();
      await page.getByRole('option', { name: 'Transaction' }).click();

      // Aggregation should reset to Count
      await expect(metricGroup.getByRole('combobox').nth(1)).toContainText('Count');
      await expect(getQueryPreview(page)).toContainText('count(*)');
    });
  });
});
