# E2E Tests - Playwright

Playwright end-to-end tests verifying the application from a user's perspective.

## Setup

- **Framework**: Playwright (`@playwright/test`)
- **Browser**: Chromium only
- **Base URL**: `http://localhost:5173` (dev server started automatically)
- **Screenshots**: On failure
- **Traces**: On first retry

## Commands

```bash
npm run test:e2e          # Run all E2E tests (headless)
npm run test:e2e:ui       # Run with Playwright UI
npx playwright test e2e/basic.spec.ts  # Run specific file
npx playwright test --debug            # Debug mode
```

## Test Files

```
e2e/
├── basic.spec.ts                 # App loads, heading visible
├── application-selection.spec.ts # Application checkboxes
├── environment-selection.spec.ts # Environment dropdown
├── metric-query-builder.spec.ts  # Metric fields + aggregation
├── metric-filters.spec.ts        # Filter add/remove/update
├── time-period-selection.spec.ts # Relative/absolute time
├── options-facets-presets.spec.ts # Options, facets, preset buttons
└── query-preview.spec.ts         # Query output verification
```

## Test Pattern

```ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('does expected behavior', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Interact
    await page.getByLabel('API').check();
    
    // Verify query output
    const query = page.locator('pre').last();
    await expect(query).toContainText('global-tax-mapper-api-prod');
  });
});
```

## Selectors (prefer semantic)

```ts
page.getByRole('button', { name: 'Reset' })
page.getByRole('checkbox', { name: 'API' })
page.getByRole('heading', { level: 1 })
page.getByLabel('Applications')
page.locator('pre').last()       // Query preview
```

## Rules

- Use semantic selectors (`getByRole`, `getByLabel`) over CSS selectors
- Wait for page load: `await page.waitForLoadState('networkidle')`
- Use `expect()` with auto-retry — avoid `waitForTimeout()`
- Test user-visible behavior, not implementation details
- Group related tests in `test.describe()`
