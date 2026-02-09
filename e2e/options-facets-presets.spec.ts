import { test, expect, Page } from '@playwright/test';

test.describe('Options, Facets, and Presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) => page.getByRole('group', { name: 'Generated Query' });

  test.describe('Options (6)', () => {
    test('6.1 Default health check - Exclude health checks is checked', async ({ page }) => {
      // Health check checkbox should be checked by default
      const healthCheckCheckbox = page.getByRole('checkbox', { name: 'Exclude health checks' });
      await expect(healthCheckCheckbox).toBeChecked();

      // Query should contain request.uri NOT IN clause
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText("request.uri NOT IN");
      await expect(queryPreview).toContainText("/ping");
    });

    test('6.2 Disable health check exclusion - Filter removed from query', async ({ page }) => {
      // Uncheck the health check exclusion
      const healthCheckCheckbox = page.getByRole('checkbox', { name: 'Exclude health checks' });
      await healthCheckCheckbox.uncheck();
      await expect(healthCheckCheckbox).not.toBeChecked();

      // Query should NOT contain health check paths (e.g. /ping)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).not.toContainText("/ping");
    });

    test('6.4 Default timeseries - Use TIMESERIES is checked', async ({ page }) => {
      // Timeseries checkbox should be checked by default
      const timeseriesCheckbox = page.getByRole('checkbox', { name: 'As Timeseries' });
      await expect(timeseriesCheckbox).toBeChecked();

      // Query should contain TIMESERIES clause
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText("TIMESERIES AUTO");
    });

    test('6.5 Disable timeseries - TIMESERIES clause removed', async ({ page }) => {
      // Uncheck timeseries
      const timeseriesCheckbox = page.getByRole('checkbox', { name: 'As Timeseries' });
      await timeseriesCheckbox.uncheck();
      await expect(timeseriesCheckbox).not.toBeChecked();

      // Query should NOT contain TIMESERIES clause
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).not.toContainText("TIMESERIES");
    });
  });

  test.describe('Facet Selection (7)', () => {
    test('7.1 Default facet - Request URI selected with FACET clause', async ({ page }) => {
      // Facet dropdown should show Request URI
      const facetDropdown = page.getByRole('combobox', { name: 'Facet By' });
      await expect(facetDropdown).toBeVisible();
      await expect(facetDropdown).toContainText('Request URI');

      // Query should contain FACET request.uri
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText("FACET request.uri");
    });

    test('7.2 Change to Response Status - Query updates', async ({ page }) => {
      // Click facet dropdown and select Response Status
      const facetDropdown = page.getByRole('combobox', { name: 'Facet By' });
      await facetDropdown.click();
      await page.getByRole('option', { name: 'Response Status' }).waitFor({ state: 'visible' });
      await page.getByRole('option', { name: 'Response Status' }).click();

      // Dropdown should show Response Status
      await expect(facetDropdown).toContainText('Response Status');

      // Query should contain FACET response.status
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText("FACET response.status");
    });

    test('7.3 Change to Request Method - Query updates', async ({ page }) => {
      // Click facet dropdown and select Request Method
      const facetDropdown = page.getByRole('combobox', { name: 'Facet By' });
      await facetDropdown.click();
      await page.getByRole('option', { name: 'Request Method' }).waitFor({ state: 'visible' });
      await page.getByRole('option', { name: 'Request Method' }).click();

      // Query should contain FACET request.method
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText("FACET request.method");
    });

    test('7.4 Change to Name - Query updates', async ({ page }) => {
      // Click facet dropdown and select Name
      const facetDropdown = page.getByRole('combobox', { name: 'Facet By' });
      await facetDropdown.click();
      await page.getByRole('option', { name: 'Name' }).waitFor({ state: 'visible' });
      await page.getByRole('option', { name: 'Name' }).click();

      // Query should contain FACET name
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText("FACET name");
    });

    test('7.5 Disable facet - Select No Facet, clause removed', async ({ page }) => {
      // Click facet dropdown and select No Facet
      const facetDropdown = page.getByRole('combobox', { name: 'Facet By' });
      await facetDropdown.click();
      await page.getByRole('option', { name: 'No Facet' }).waitFor({ state: 'visible' });
      await page.getByRole('option', { name: 'No Facet' }).click();

      // Query should NOT contain FACET clause
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).not.toContainText("FACET");
    });
  });

  test.describe('Common Queries/Presets (8)', () => {
    test('8.1 Preset panel visible - Shows 3 preset buttons and Reset', async ({ page }) => {
      // Common Queries heading should be visible
      await expect(page.getByRole('heading', { name: 'Common Queries' })).toBeVisible();

      // All 3 preset buttons + Reset should be visible
      await expect(page.getByRole('button', { name: 'API Throughput - Last 3 Hours' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'API Latency - Last 3 Hours' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'API Error Count' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    });

    test('8.2 API Throughput - Last 3 Hours - Click updates form', async ({ page }) => {
      // Click the preset
      await page.getByRole('button', { name: 'API Throughput - Last 3 Hours' }).click();

      // API should be checked, others unchecked
      await expect(page.getByRole('checkbox', { name: 'API', exact: true })).toBeChecked();
      await expect(page.getByRole('checkbox', { name: 'BFF' })).not.toBeChecked();
      await expect(page.getByRole('checkbox', { name: 'Integrator API' })).not.toBeChecked();

      // Environment should be Production
      const envDropdown = page.getByRole('combobox', { name: 'Environment' });
      await expect(envDropdown).toContainText('Production');

      // Query should contain api-prod and count
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText('global-tax-mapper-api-prod');
      await expect(queryPreview).toContainText('count');
    });

    test('8.3 API Latency - Last 3 Hours - Click updates form', async ({ page }) => {
      // Click the preset
      await page.getByRole('button', { name: 'API Latency - Last 3 Hours' }).click();

      // API should be checked
      await expect(page.getByRole('checkbox', { name: 'API', exact: true })).toBeChecked();

      // Environment should be Production
      const envDropdown = page.getByRole('combobox', { name: 'Environment' });
      await expect(envDropdown).toContainText('Production');

      // Query should contain api-prod and average(duration)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText('global-tax-mapper-api-prod');
      await expect(queryPreview).toContainText('average(duration)');
    });

    test('8.4 API Error Count - Click updates form', async ({ page }) => {
      // Click the preset
      await page.getByRole('button', { name: 'API Error Count' }).click();

      // API should be checked
      await expect(page.getByRole('checkbox', { name: 'API', exact: true })).toBeChecked();

      // Environment should be Production
      const envDropdown = page.getByRole('combobox', { name: 'Environment' });
      await expect(envDropdown).toContainText('Production');

      // Query should contain api-prod and FACET request.uri
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText('global-tax-mapper-api-prod');
      await expect(queryPreview).toContainText('FACET request.uri');
    });

    test('8.5 Reset - Restores default state', async ({ page }) => {
      // First apply a preset to change state
      await page.getByRole('button', { name: 'API Error Count' }).click();

      // Then click Reset
      await page.getByRole('button', { name: 'Reset' }).click();

      // Default state: API checked, Production selected
      await expect(page.getByRole('checkbox', { name: 'API', exact: true })).toBeChecked();

      const envDropdown = page.getByRole('combobox', { name: 'Environment' });
      await expect(envDropdown).toContainText('Production');

      // Query should still contain api-prod
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toBeVisible();
      await expect(queryPreview).toContainText('global-tax-mapper-api-prod');
    });
  });
});
