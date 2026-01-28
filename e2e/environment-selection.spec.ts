import { test, expect } from '@playwright/test';

test.describe('Environment Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper to get query preview
  const getQueryPreview = (page) => page.getByRole('group', { name: 'Generated Query' });

  test('2.1 Default environment - Production is selected with -prod suffix', async ({ page }) => {
    // Environment dropdown should show "Production"
    const envDropdown = page.getByRole('combobox', { name: 'Environment' });
    await expect(envDropdown).toContainText('Production');

    // Query should contain -prod suffix
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText('global-tax-mapper-api-prod');
    await expect(queryPreview).not.toContainText('-uat');
  });

  test('2.2 Switch to UAT - Query updates to -uat suffix', async ({ page }) => {
    // Click the environment dropdown to open it
    const envDropdown = page.getByRole('combobox', { name: 'Environment' });
    await envDropdown.click();

    // Select UAT option
    const uatOption = page.getByRole('option', { name: 'UAT' });
    await uatOption.click();

    // Verify dropdown now shows UAT
    await expect(envDropdown).toContainText('UAT');

    // Query should now contain -uat suffix
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText('global-tax-mapper-api-uat');
    await expect(queryPreview).not.toContainText('-prod');
  });

  test('2.3 Switch back to Prod - Query returns to -prod suffix', async ({ page }) => {
    // First switch to UAT
    const envDropdown = page.getByRole('combobox', { name: 'Environment' });
    await envDropdown.click();
    await page.getByRole('option', { name: 'UAT' }).click();

    // Verify we're on UAT
    await expect(getQueryPreview(page)).toContainText('global-tax-mapper-api-uat');

    // Now switch back to Production
    await envDropdown.click();
    await page.getByRole('option', { name: 'Production' }).click();

    // Verify dropdown shows Production
    await expect(envDropdown).toContainText('Production');

    // Query should be back to -prod suffix
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText('global-tax-mapper-api-prod');
    await expect(queryPreview).not.toContainText('-uat');
  });

  test('2.4 Multiple apps - All app names update suffix', async ({ page }) => {
    // Enable multiple apps first
    const bffCheckbox = page.getByRole('checkbox', { name: 'BFF' });
    const integratorCheckbox = page.getByRole('checkbox', { name: 'Integrator API' });
    await bffCheckbox.check();
    await integratorCheckbox.check();

    // Verify all apps have -prod suffix
    const queryPreview = getQueryPreview(page);
    await expect(queryPreview).toContainText('global-tax-mapper-api-prod');
    await expect(queryPreview).toContainText('global-tax-mapper-bff-prod');
    await expect(queryPreview).toContainText('global-tax-mapper-integrator-api-prod');

    // Switch to UAT
    const envDropdown = page.getByRole('combobox', { name: 'Environment' });
    await envDropdown.click();
    await page.getByRole('option', { name: 'UAT' }).click();

    // All apps should now have -uat suffix
    await expect(queryPreview).toContainText('global-tax-mapper-api-uat');
    await expect(queryPreview).toContainText('global-tax-mapper-bff-uat');
    await expect(queryPreview).toContainText('global-tax-mapper-integrator-api-uat');
  });
});
