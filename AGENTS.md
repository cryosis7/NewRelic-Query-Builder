# NR-Query-Builder Agent Instructions

A React + TypeScript + Vite application for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications.

## Architecture

### Data Flow

```
QueryState (types/query.ts) → useQueryBuilder hook → buildNrqlQuery() → UI Components
```

- **Single source of truth**: `useQueryBuilder` hook manages all state via `useState`
- **Pure query generation**: `buildNrqlQuery()` is a pure, tested function exported separately
- **Controlled components**: All UI components receive state + callbacks from parent
- **Presets system**: Pre-configured query combinations in `src/data/presets.ts`

### Key Files

| Path | Purpose |
|------|---------|
| `src/hooks/useQueryBuilder.ts` | State management + NRQL generation logic |
| `src/types/query.ts` | All TypeScript types, constants, and domain config |
| `src/data/presets.ts` | Common query presets (Partial<QueryState> objects) |
| `src/components/index.ts` | Barrel export for all components |
| `src/App.tsx` | Main app layout, wires hook to components |

### Project Structure

```
src/
├── components/          # UI components (one file per component)
│   ├── ComponentName.tsx
│   └── ComponentName.test.tsx  # Co-located tests
├── hooks/
│   ├── useQueryBuilder.ts      # Main state hook + buildNrqlQuery
│   └── useQueryBuilder.test.ts
├── types/
│   └── query.ts                # All types, constants, domain config
├── data/
│   └── presets.ts              # Query presets
├── test/
│   └── setup.ts                # Vitest setup
└── App.tsx
e2e/                    # Playwright E2E tests
```

## Do

- Use `@xero/xui` components for all UI elements (see XUI section below)
- Acitvely use the Xero docs tool to search for XUI components, props, utility classes and patterns
- Define props interfaces inline above the component function
- Export pure functions separately from hooks for easier testing
- Use `useCallback` for all handler functions passed to children
- Use `useMemo` for derived values (like the generated query)
- Follow controlled component pattern (props down, events up)
- Co-locate test files with their source files
- Update tests when modifying code
- Use the constants from `types/query.ts` (e.g., `APPLICATIONS`, `METRIC_TYPES`)

## Don't

- Don't use raw HTML form elements (`<input>`, `<button>`, `<select>`, `<checkbox>`)
- Don't hardcode application names; use `APPLICATIONS` constant
- Don't hardcode health check paths; use `HEALTH_CHECK_PATHS` constant
- Don't put state management logic in components; keep it in the hook
- Don't import components directly; use the barrel export from `components/index.ts`
- Don't add new dependencies without approval
- Don't commit or push without explicit permission

## Commands

### File-scoped validation

```bash
# Type check single file
npx tsc --noEmit src/path/to/file.ts

# Lint single file
npm run lint -- src/path/to/file.ts

# Run single test file
npm run test:run -- src/path/to/file.test.ts
```

### Full project commands

```bash
npm run dev           # Start dev server (localhost:5173)
npm run build         # TypeScript compile + Vite build
npm run lint          # ESLint all files
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run (CI)
npm run test:e2e      # Playwright E2E tests
npm run test:e2e:ui   # Playwright with UI
```

### After making changes

Always run tests after modifications:
```bash
npm run test:run
```

## XUI Component Usage

Always use `@xero/xui` components. Never use raw HTML form elements.
Always search the XUI docs in the Xero docs tool

### Import patterns

```tsx
// ✅ Correct imports
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import XUIButton from '@xero/xui/react/button';
import XUIRadio, { XUIRadioGroup } from '@xero/xui/react/radio';
import XUITextInput from '@xero/xui/react/textinput';
import { Flex, FlexItem } from './components';

// ❌ Never use raw HTML
<input type="checkbox" />
<button>Click</button>
<select>...</select>
```

### XUI patterns used in this project

- `XUICheckboxGroup` with `isFieldLayout` for labeled checkbox groups
- `XUIRadioGroup` with `isFieldLayout` for radio button groups
- `Flex` and `FlexItem` components from `./components` for layout
- XUI utility classes: `xui-margin-*`, `xui-padding-*`, `xui-heading-*`

### Layout with Flex/FlexItem

Use the custom `Flex` and `FlexItem` components for layouts instead of XUI's `XUIRow`/`XUIColumn`:

```tsx
// ✅ Use Flex/FlexItem for multi-column layouts
import { Flex, FlexItem } from './components';

<Flex gap="1rem" className="xui-margin-top">
  <FlexItem flex={1}>Column 1</FlexItem>
  <FlexItem flex={1}>Column 2</FlexItem>
  <FlexItem flex={1}>Column 3</FlexItem>
</Flex>

// ✅ For single full-width content, use a simple div
<div className="xui-margin-top">
  <QueryPreview query={query} />
</div>
```

## Testing

### Setup

- **Framework**: Vitest with jsdom environment
- **Libraries**: `@testing-library/react`, `@testing-library/user-event`
- **Global `vi`**: Available without import (configured in vite.config.ts)
- **Setup file**: `src/test/setup.ts` imports `@testing-library/jest-dom`

### Component test pattern

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const mockHandler = vi.fn();

  beforeEach(() => {
    mockHandler.mockClear();
  });

  it('renders expected elements', () => {
    render(<ComponentName prop={value} onAction={mockHandler} />);
    expect(screen.getByLabelText('Label')).toBeInTheDocument();
  });

  it('calls handler on interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName prop={value} onAction={mockHandler} />);
    await user.click(screen.getByLabelText('Label'));
    expect(mockHandler).toHaveBeenCalledWith(expectedArg);
  });
});
```

### Pure function test pattern

```ts
import { buildNrqlQuery } from './useQueryBuilder';
import type { QueryState } from '../types/query';

function createTestState(overrides: Partial<QueryState> = {}): QueryState {
  return {
    applications: ['global-tax-mapper-api'],
    environment: 'prod',
    // ... default values
    ...overrides,
  };
}

describe('buildNrqlQuery', () => {
  it('generates expected output', () => {
    const state = createTestState({ applications: ['global-tax-mapper-api'] });
    const result = buildNrqlQuery(state);
    expect(result).toContain("appName in ('global-tax-mapper-api-prod')");
  });
});
```

### E2E test pattern

```ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('does expected behavior', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const element = page.getByRole('heading', { level: 1 });
    await expect(element).toBeVisible();
  });
});
```

## Domain Knowledge

### GTM Applications

Three applications defined in `types/query.ts`:
- `global-tax-mapper-api` (API)
- `global-tax-mapper-bff` (BFF)
- `global-tax-mapper-integrator-api` (Integrator API)

App names in NRQL combine with environment: `{app}-{env}` (e.g., `global-tax-mapper-api-prod`)

### NRQL Query Structure

Generated queries follow this format:
```sql
FROM Transaction 
SELECT [metrics] 
WHERE appName in ([apps]) and [filters] 
TIMESERIES AUTO 
SINCE '[datetime]' UNTIL '[datetime]' 
FACET [field]
```

### Metric Types

| Type | Description |
|------|-------------|
| `duration` | Response time (supports average, p95, count aggregations) |
| `transaction-count` | Request count (count only) |
| `response.status` | HTTP status code count |

### Filter Behavior

- Filters with empty values are ignored
- When all metrics share the same filters, they're lifted to global WHERE
- When filters differ, each metric uses `filter()` wrapper
- Status codes support: exact (`404`), multiple (`404, 503`), fuzzy (`4xx`, `5%`)

### Health Check Paths

`HEALTH_CHECK_PATHS` constant defines endpoints excluded when `excludeHealthChecks: true`:
- `/ping`, `/secureping`, `/health`, `/healthcheck`, `/secure-ping`, `/ready`, `/accountsV2/bulk`

## Good Examples

### Component structure (ApplicationSelector.tsx)

```tsx
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import { APPLICATIONS, type Application } from '../types/query';

interface ApplicationSelectorProps {
  selectedApplications: Application[];
  onToggle: (app: Application) => void;
}

export function ApplicationSelector({ selectedApplications, onToggle }: ApplicationSelectorProps) {
  return (
    <XUICheckboxGroup label="Applications" isFieldLayout>
      {APPLICATIONS.map(({ value, label }) => (
        <XUICheckbox
          key={value}
          isChecked={selectedApplications.includes(value)}
          onChange={() => onToggle(value)}
        >
          {label}
        </XUICheckbox>
      ))}
    </XUICheckboxGroup>
  );
}
```

### Hook state update pattern

```ts
const toggleApplication = useCallback((app: Application) => {
  setState(prev => ({
    ...prev,
    applications: prev.applications.includes(app)
      ? prev.applications.filter(a => a !== app)
      : [...prev.applications, app],
  }));
}, []);
```

## Avoid These Patterns

```tsx
// ❌ Don't use raw HTML elements
<input type="checkbox" checked={isChecked} onChange={handleChange} />

// ❌ Don't hardcode application names
const appName = 'global-tax-mapper-api-prod';

// ❌ Don't put logic in components
function MyComponent() {
  const [state, setState] = useState(initialState);
  const query = buildQuery(state); // Should be in hook
}

// ❌ Don't import components directly
import { ApplicationSelector } from './components/ApplicationSelector';
// ✅ Use barrel export
import { ApplicationSelector } from './components';
```

## Safety and Permissions

### Allowed without prompt
- Read files, list files
- Run type checks, lint, unit tests on single files
- Start dev server

### Ask first
- Package installs
- Git commit or push
- Deleting files
- Running full E2E test suite
- Modifying configuration files

## When Stuck

- Ask a clarifying question before making large speculative changes
- Propose a short plan for complex changes
- Check existing tests for expected behavior patterns
- Look at similar components for implementation patterns
