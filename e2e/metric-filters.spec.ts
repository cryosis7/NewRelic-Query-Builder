import { test, expect, Page } from '@playwright/test';

test.describe('Metric Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) => page.getByRole('group', { name: 'Generated Query' });
  const getMetricGroup = (page: Page) => page.getByRole('group', { name: 'Metric Queries' });

  test.describe('Adding/Removing Filters (5.1)', () => {
    test('5.1.1 Add filter - Click "+ Add filter", verify filter row appears', async ({ page }) => {
      // Click Add filter button
      await page.getByRole('button', { name: '+ Add filter' }).click();

      // Filter row should appear with Field, Operator, Value elements
      const metricGroup = getMetricGroup(page);
      await expect(metricGroup.getByText('Filters (AND)')).toBeVisible();
      await expect(metricGroup.getByText('Field')).toBeVisible();
      await expect(metricGroup.getByText('Operator')).toBeVisible();
      await expect(metricGroup.getByText('Value')).toBeVisible();

      // Should have a Remove filter button
      await expect(page.getByRole('button', { name: 'Remove filter' })).toBeVisible();
    });

    test('5.1.2 Remove filter - Click X button on filter, verify removed', async ({ page }) => {
      // First add a filter
      await page.getByRole('button', { name: '+ Add filter' }).click();
      
      // Verify filter exists
      const metricGroup = getMetricGroup(page);
      await expect(metricGroup.getByText('Filters (AND)')).toBeVisible();

      // Click remove filter button
      await page.getByRole('button', { name: 'Remove filter' }).click();

      // Filter section should be gone
      await expect(metricGroup.getByText('Filters (AND)')).not.toBeVisible();
    });

    test('5.1.3 Empty filter value - Filter ignored, no query error', async ({ page }) => {
      // Add a filter but leave value empty
      await page.getByRole('button', { name: '+ Add filter' }).click();

      // Should show "Empty filter will be ignored" message
      const metricGroup = getMetricGroup(page);
      await expect(metricGroup.getByText('Empty filter will be ignored')).toBeVisible();

      // Query should still be valid (no filter clause added)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).not.toContainText('duration >');
      // Should not have error
      await expect(queryPreview).not.toContainText('error');
    });
  });

  test.describe('Duration Filters (5.2)', () => {
    test('5.2.1 Duration > threshold - Set Duration > 0.5, verify query', async ({ page }) => {
      // Add filter
      await page.getByRole('button', { name: '+ Add filter' }).click();

      // Default field should be Duration (third combobox after metric type and aggregation)
      // Just verify the query works by typing a value
      await page.getByRole('textbox', { name: 'Value' }).fill('0.5');

      // Query should contain the filter
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('duration > 0.5');
    });

    test('5.2.2 Change operator - Change to >=, verify query updates', async ({ page }) => {
      // Add filter with value
      await page.getByRole('button', { name: '+ Add filter' }).click();
      await page.getByRole('textbox', { name: 'Value' }).fill('0.5');

      // Verify initial operator is >
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('duration > 0.5');

      // Click operator dropdown and change to >=
      const metricGroup = getMetricGroup(page);
      // The operator dropdown shows ">" text
      const operatorDropdown = metricGroup.getByRole('combobox').filter({ hasText: '>' });
      await operatorDropdown.click();
      
      // Select >= option
      await page.getByRole('option', { name: '>=' }).click();

      // Query should update
      await expect(queryPreview).toContainText('duration >= 0.5');
    });

    test('5.2.3 All duration operators work', async ({ page }) => {
      // Add filter with value
      await page.getByRole('button', { name: '+ Add filter' }).click();
      await page.getByRole('textbox', { name: 'Value' }).fill('1');

      const queryPreview = getQueryPreview(page);
      const metricGroup = getMetricGroup(page);

      // Test < operator (use exact: true to avoid matching <=)
      await metricGroup.getByRole('combobox').filter({ hasText: /^[<>=]+$/ }).click();
      await page.getByRole('option', { name: '<', exact: true }).click();
      await expect(queryPreview).toContainText('duration < 1');

      // Test <= operator  
      await metricGroup.getByRole('combobox').filter({ hasText: /^[<>=]+$/ }).click();
      await page.getByRole('option', { name: '<=' }).click();
      await expect(queryPreview).toContainText('duration <= 1');

      // Test = operator (use exact: true)
      await metricGroup.getByRole('combobox').filter({ hasText: /^[<>=]+$/ }).click();
      await page.getByRole('option', { name: '=', exact: true }).click();
      await expect(queryPreview).toContainText('duration = 1');
    });
  });

  test.describe('Response Status Filters (5.3)', () => {
    test('5.3.1 Select response.status field - Change filter field', async ({ page }) => {
      // Add filter
      await page.getByRole('button', { name: '+ Add filter' }).click();

      // Click field dropdown (it shows "Duration" initially) and select Response Status
      // The field dropdown is the third combobox in the metric group (after metric type and aggregation)
      await page.getByText('Duration').first().click();
      await page.getByRole('option', { name: 'Response Status' }).click();

      // Verify field changed by checking Value placeholder or query behavior
      // Just verify it works by entering a status code
      await page.getByRole('textbox', { name: 'Value' }).fill('200');
      
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('response.status');
    });

    test('5.3.2 Exact status code - Enter "404", verify query', async ({ page }) => {
      // Add filter and select Response Status
      await page.getByRole('button', { name: '+ Add filter' }).click();
      const metricGroup = getMetricGroup(page);
      await metricGroup.getByRole('combobox').filter({ hasText: 'Duration' }).click();
      await page.getByRole('option', { name: 'Response Status' }).click();

      // Enter exact code
      await page.getByRole('textbox', { name: 'Value' }).fill('404');

      // Query should contain response.status = 404
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('response.status = 404');
    });

    test('5.3.3 Pattern (4xx) - Enter "4xx", verify query uses LIKE', async ({ page }) => {
      // Add filter and select Response Status  
      await page.getByRole('button', { name: '+ Add filter' }).click();
      const metricGroup = getMetricGroup(page);
      await metricGroup.getByRole('combobox').filter({ hasText: 'Duration' }).click();
      await page.getByRole('option', { name: 'Response Status' }).click();

      // Enter pattern
      await page.getByRole('textbox', { name: 'Value' }).fill('4xx');

      // Query should contain LIKE pattern
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(/response\.status LIKE/i);
    });
  });

  test.describe('Multiple Filters', () => {
    test('5.1.4 Add multiple filters - Combine with AND logic', async ({ page }) => {
      // Add first filter
      await page.getByRole('button', { name: '+ Add filter' }).click();
      await page.getByRole('textbox', { name: 'Value' }).fill('0.5');

      // Add second filter  
      await page.getByRole('button', { name: '+ Add filter' }).click();
      
      // Fill second filter (there are now two Value inputs)
      const valueInputs = page.getByRole('textbox', { name: 'Value' });
      await valueInputs.last().fill('1.0');

      // Both filters should be in query
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText('duration > 0.5');
      await expect(queryPreview).toContainText('duration > 1');
    });
  });
});
