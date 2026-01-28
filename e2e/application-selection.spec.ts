import { test, expect } from '@playwright/test';

test.describe('Application Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper to get query preview text
  const getQueryPreview = (page) => page.getByRole('group', { name: 'Generated Query' });

  test('1.1 Default state - API checkbox is checked by default', async ({ page }) => {
    // API checkbox should be checked by default (use exact: true to avoid matching "Integrator API")
    const apiCheckbox = page.getByRole('checkbox', { name: 'API', exact: true });
    await expect(apiCheckbox).toBeChecked();

    // BFF and Integrator API should be unchecked
    const bffCheckbox = page.getByRole('checkbox', { name: 'BFF' });
    const integratorCheckbox = page.getByRole('checkbox', { name: 'Integrator API' });
    await expect(bffCheckbox).not.toBeChecked();
    await expect(integratorCheckbox).not.toBeChecked();

    // Query should contain only API-prod
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText("global-tax-mapper-api-prod");
    await expect(queryPreview).not.toContainText("global-tax-mapper-bff-prod");
    await expect(queryPreview).not.toContainText("global-tax-mapper-integrator-api-prod");
  });

  test('1.2 Select single app - Check BFF updates query', async ({ page }) => {
    // Check BFF
    const bffCheckbox = page.getByRole('checkbox', { name: 'BFF' });
    await bffCheckbox.check();
    await expect(bffCheckbox).toBeChecked();

    // Query should now contain both API and BFF
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText("global-tax-mapper-api-prod");
    await expect(queryPreview).toContainText("global-tax-mapper-bff-prod");
  });

  test('1.3 Select multiple apps - All three apps in query', async ({ page }) => {
    // Check BFF and Integrator API (API is already checked)
    const bffCheckbox = page.getByRole('checkbox', { name: 'BFF' });
    const integratorCheckbox = page.getByRole('checkbox', { name: 'Integrator API' });
    
    await bffCheckbox.check();
    await integratorCheckbox.check();

    // All three should be checked
    const apiCheckbox = page.getByRole('checkbox', { name: 'API', exact: true });
    await expect(apiCheckbox).toBeChecked();
    await expect(bffCheckbox).toBeChecked();
    await expect(integratorCheckbox).toBeChecked();

    // Query should contain all three
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText("global-tax-mapper-api-prod");
    await expect(queryPreview).toContainText("global-tax-mapper-bff-prod");
    await expect(queryPreview).toContainText("global-tax-mapper-integrator-api-prod");
  });

  test('1.4 Deselect all apps - Shows error message', async ({ page }) => {
    // Uncheck API (the only checked one by default)
    const apiCheckbox = page.getByRole('checkbox', { name: 'API', exact: true });
    await apiCheckbox.uncheck();

    // Query preview should show error message
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText('Select at least one application');
  });

  test('1.5 Toggle app selection - Check and uncheck Integrator API', async ({ page }) => {
    const queryPreview = getQueryPreview(page);

    // Check Integrator API
    const integratorCheckbox = page.getByRole('checkbox', { name: 'Integrator API' });
    await integratorCheckbox.check();
    await expect(queryPreview).toContainText("global-tax-mapper-integrator-api-prod");

    // Uncheck Integrator API
    await integratorCheckbox.uncheck();
    
    // Query should return to initial state (without integrator)
    await expect(queryPreview).not.toContainText("global-tax-mapper-integrator-api-prod");
    await expect(queryPreview).toContainText("global-tax-mapper-api-prod");
  });
});
