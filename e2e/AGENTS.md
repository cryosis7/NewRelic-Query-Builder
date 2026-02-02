# E2E Tests - Playwright End-to-End Testing

This folder contains Playwright end-to-end tests that verify the application works correctly from a user's perspective.

## Purpose

E2E tests simulate real user interactions:
- Navigate through the UI
- Click buttons, fill forms, select options
- Verify the generated NRQL query output
- Test complete user workflows

---

## Framework

- **Test Runner**: Playwright
- **File Pattern**: `*.spec.ts`
- **Browser**: Chromium (configurable in `playwright.config.ts`)

---

## E2E Test Pattern

```ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('does expected behavior', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and interact with elements
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('NR Query Builder');
    
    // Interact with form elements
    const checkbox = page.getByLabel('API');
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Verify query output
    const queryPreview = page.locator('.query-preview');
    await expect(queryPreview).toContainText('FROM Transaction');
  });
});
```

---

## Test Structure

### Basic Pattern

```ts
import { test, expect } from '@playwright/test';

test.describe('Application Selection', () => {
  test('selects and deselects applications', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Select application
    const apiCheckbox = page.getByLabel('API');
    await apiCheckbox.check();
    await expect(apiCheckbox).toBeChecked();
    
    // Verify it appears in query
    const query = page.locator('pre').last();
    await expect(query).toContainText('global-tax-mapper-api-prod');
    
    // Deselect application
    await apiCheckbox.uncheck();
    await expect(apiCheckbox).not.toBeChecked();
  });
});
```

### Testing User Workflows

```ts
test('complete query building workflow', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Step 1: Select application
  await page.getByLabel('API').check();
  
  // Step 2: Choose environment
  await page.getByLabel('Production').check();
  
  // Step 3: Configure metric
  await page.getByLabel('Metric Type').selectOption('duration');
  await page.getByLabel('Aggregation').selectOption('p95');
  
  // Step 4: Set time period
  await page.getByLabel('Last 3 hours').check();
  
  // Step 5: Verify query output
  const query = page.locator('pre').last();
  await expect(query).toContainText('FROM Transaction');
  await expect(query).toContainText('percentile(duration, 95)');
  await expect(query).toContainText('SINCE 3 hours ago');
});
```

---

## Common Selectors

### By Role (Preferred)

```ts
// Buttons
page.getByRole('button', { name: 'Reset' })

// Checkboxes/Radios
page.getByRole('checkbox', { name: 'API' })
page.getByRole('radio', { name: 'Production' })

// Headings
page.getByRole('heading', { level: 1 })

// Text inputs
page.getByRole('textbox', { name: 'Filter Value' })
```

### By Label (Form Elements)

```ts
page.getByLabel('Applications')
page.getByLabel('Environment')
page.getByLabel('API') // Checkbox/radio label
```

### By Test ID (When Needed)

```ts
// In component: <div data-testid="query-preview">...</div>
page.getByTestId('query-preview')
```

### By CSS Selector (Last Resort)

```ts
page.locator('.query-preview')
page.locator('pre').last()
```

---

## Assertions

### Visibility

```ts
await expect(element).toBeVisible();
await expect(element).toBeHidden();
```

### Text Content

```ts
await expect(element).toHaveText('Expected Text');
await expect(element).toContainText('Partial Text');
```

### Form State

```ts
await expect(checkbox).toBeChecked();
await expect(checkbox).not.toBeChecked();
await expect(input).toHaveValue('expected value');
```

### Count

```ts
await expect(page.getByRole('checkbox')).toHaveCount(3);
```

---

## Running E2E Tests

### Commands

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI (headed browser)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/application-selection.spec.ts

# Debug mode (opens inspector)
npx playwright test --debug
```

### Test Organization

Tests are organized by feature:

```
e2e/
├── application-selection.spec.ts     # Application selector tests
├── environment-selection.spec.ts     # Environment selector tests
├── metric-query-builder.spec.ts      # Metric builder tests
├── metric-filters.spec.ts            # Filter tests
├── time-period-selection.spec.ts     # Time period tests
├── options-facets-presets.spec.ts    # Options & presets tests
└── query-preview.spec.ts             # Query output tests
```

---

## Best Practices

### Wait for Content

```ts
// ✅ Wait for page load
await page.goto('/');
await page.waitForLoadState('networkidle');

// ✅ Wait for element
await expect(element).toBeVisible();

// ❌ Don't use arbitrary timeouts
await page.waitForTimeout(1000); // Avoid this
```

### Use Descriptive Test Names

```ts
// ✅ Clear, describes what is being tested
test('selects multiple applications and shows them in query', async ({ page }) => {
  // ...
});

// ❌ Vague, unclear
test('works', async ({ page }) => {
  // ...
});
```

### Test User Perspective

```ts
// ✅ Test what users see and do
await page.getByLabel('API').check();
await expect(query).toContainText('global-tax-mapper-api-prod');

// ❌ Don't test implementation details
await page.locator('[data-atom="applicationsAtom"]').click();
```

### Group Related Tests

```ts
test.describe('Metric Filters', () => {
  test('adds filter', async ({ page }) => { /* ... */ });
  test('removes filter', async ({ page }) => { /* ... */ });
  test('updates filter value', async ({ page }) => { /* ... */ });
});
```

---

## Do

- Test complete user workflows
- Use semantic selectors (`getByRole`, `getByLabel`)
- Wait for page load with `waitForLoadState('networkidle')`
- Use `expect()` assertions for verification
- Group related tests in `test.describe()` blocks
- Write descriptive test names
- Test the happy path and common error cases

## Don't

- Don't use arbitrary `waitForTimeout()` - use `expect()` with auto-retry
- Don't test implementation details (atoms, internal state)
- Don't use fragile CSS selectors unless necessary
- Don't forget to wait for page load
- Don't create overly complex tests - keep them focused
- Don't skip E2E tests - they catch integration issues

---

## Debugging Tests

### View Test in Browser

```bash
npm run test:e2e:ui
```

### Debug Mode

```bash
npx playwright test --debug
```

### Screenshots on Failure

Playwright automatically captures screenshots on failure (configured in `playwright.config.ts`).

### Trace Viewer

```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```
