import { test, expect, Page, Locator } from '@playwright/test';

test.describe('Metric Query Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) => page.getByRole('group', { name: 'Generated Query' });

  // Helper to get metric type combobox by label (Metric 1, Metric 2, etc.)
  const getMetricTypeCombobox = (page: Page, metricIndex: number = 1) => {
    return page.getByRole('combobox', { name: `Metric ${metricIndex}` });
  };

  // Helper to get aggregation combobox by label
  // Note: There may be multiple "Aggregation" comboboxes, so we get all and filter by position
  const getAggregationCombobox = (page: Page, metricIndex: number = 1) => {
    const aggregationComboboxes = page.getByRole('combobox', { name: 'Aggregation' });
    // Return the one for the specified metric (0-indexed)
    return aggregationComboboxes.nth(metricIndex - 1);
  };

  test.describe('Metric Items (4.1)', () => {
    test('4.1.1 Default metric - One metric with Transaction type and Count aggregation', async ({ page }) => {
      // Should have exactly one metric item
      await expect(page.getByText('Metric 1')).toBeVisible();
      await expect(page.getByText('Metric 2')).not.toBeVisible();

      // First metric type dropdown should show "Transaction"
      const metricTypeDropdown = getMetricTypeCombobox(page);
      await expect(metricTypeDropdown).toContainText('Transaction');

      // Aggregation dropdown should show "Count"
      const aggregationDropdown = getAggregationCombobox(page);
      await expect(aggregationDropdown).toContainText('Count');

      // Query should contain count(*)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(*)');
    });

    test('4.1.2 Add second metric - Click Add metric, verify second appears', async ({ page }) => {
      // Click Add metric button
      await page.getByRole('button', { name: 'Add metric' }).click();

      // Should now have Metric 2
      await expect(page.getByText('Metric 2')).toBeVisible();

      // Query should now have two count(*) expressions
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(*), count(*)');
    });

    test('4.1.3 Remove metric - When 2+ exist, remove one', async ({ page }) => {
      // Add second metric
      await page.getByRole('button', { name: 'Add metric' }).click();
      await expect(page.getByText('Metric 2')).toBeVisible();

      // Now both Remove buttons should be enabled
      const removeButtons = page.getByRole('button', { name: 'Remove' });
      await expect(removeButtons.first()).toBeEnabled();
      await expect(removeButtons.last()).toBeEnabled();

      // Remove the second metric
      await removeButtons.last().click();

      // Should only have Metric 1 now
      await expect(page.getByText('Metric 1')).toBeVisible();
      await expect(page.getByText('Metric 2')).not.toBeVisible();

      // Query should have single count(*)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).not.toContainText('count(*), count(*)');
    });

    test('4.1.4 Cannot remove last - Remove button disabled when only one metric', async ({ page }) => {
      // With only one metric, Remove button should not exist (not rendered)
      const removeButton = page.getByRole('button', { name: 'Remove' });
      await expect(removeButton).not.toBeVisible();
    });
  });

  test.describe('Metric Type Selection (4.2)', () => {
    test('4.2.1 Select Duration - Change type to Duration', async ({ page }) => {
      // Click the metric type dropdown
      const metricTypeDropdown = getMetricTypeCombobox(page);
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
      // Click the metric type dropdown
      await getMetricTypeCombobox(page).click();

      // Select Response Status
      await page.getByRole('option', { name: 'Response Status' }).click();

      // Query should contain count(response.status)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('count(response.status)');
    });

    test('4.2.4 Duration with Average shows average(duration)', async ({ page }) => {
      // Select Duration type
      await getMetricTypeCombobox(page).click();
      await page.getByRole('option', { name: 'Duration' }).click();

      // Select Average aggregation
      await getAggregationCombobox(page).click();
      await page.getByRole('option', { name: 'Average' }).click();

      // Query should show average(duration)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('average(duration)');
    });

    test('4.2.5 Duration with P95 shows percentile(duration, 95)', async ({ page }) => {
      // Select Duration type
      await getMetricTypeCombobox(page).click();
      await page.getByRole('option', { name: 'Duration' }).click();

      // Select 95th Percentile aggregation
      await getAggregationCombobox(page).click();
      await page.getByRole('option', { name: '95th Percentile' }).click();

      // Query should show percentile(duration, 95)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('percentile(duration, 95)');
    });
  });

  test.describe('Aggregation Constraints (4.3)', () => {
    test('4.3.1 Non-duration (Transaction) only has Count option', async ({ page }) => {
      // With Transaction type, click aggregation dropdown
      await getAggregationCombobox(page).click();

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
      // First, set to Duration with Average
      await getMetricTypeCombobox(page).click();
      await page.getByRole('option', { name: 'Duration' }).click();
      
      await getAggregationCombobox(page).click();
      await page.getByRole('option', { name: 'Average' }).click();

      // Verify it's set to Average
      await expect(getAggregationCombobox(page)).toContainText('Average');
      await expect(getQueryPreview(page)).toContainText('average(duration)');

      // Now switch metric type to Transaction
      await getMetricTypeCombobox(page).click();
      await page.getByRole('option', { name: 'Transaction' }).click();

      // Aggregation should reset to Count
      await expect(getAggregationCombobox(page)).toContainText('Count');
      await expect(getQueryPreview(page)).toContainText('count(*)');
    });
  });
});
