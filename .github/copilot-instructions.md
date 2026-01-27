# NR-Query-Builder - Copilot Instructions

## Project Overview

A React + TypeScript + Vite app for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications. Uses **@xero/xui** (Xero's design system) for all UI components.

## Architecture

### Data Flow
```
QueryState (types/query.ts) → useQueryBuilder hook → buildNrqlQuery() → UI Components
```

- **Single source of truth**: `useQueryBuilder` hook manages all state via `useState`
- **Pure query generation**: `buildNrqlQuery()` is a pure function (exported separately for testing)
- **Presets system**: Pre-configured query combinations in `src/data/presets.ts`

### Key Files
- [src/hooks/useQueryBuilder.ts](src/hooks/useQueryBuilder.ts) - State management + NRQL generation logic
- [src/types/query.ts](src/types/query.ts) - All TypeScript types, constants, and domain config
- [src/data/presets.ts](src/data/presets.ts) - Common query presets
- [src/components/index.ts](src/components/index.ts) - Barrel export for all components

## Component Conventions

### XUI Usage
Always use `@xero/xui` components, never raw HTML form elements:
```tsx
// ✅ Correct
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import XUIButton from '@xero/xui/react/button';
import { XUIRow, XUIColumn } from '@xero/xui/react/structural';

// ❌ Never use raw HTML
<input type="checkbox" />
<button>Click</button>
```

XUI api's should be researched using the Xero Docs tool.

### Component Pattern
Each component follows this structure:
- Props interface defined inline above component
- Receives data + callbacks from parent (controlled components)
- Co-located test file: `ComponentName.test.tsx`

## Testing

### Commands
- `npm test` - Watch mode
- `npm run test:run` - Single run (CI)

### Test Setup
- Vitest with jsdom environment
- `@testing-library/react` + `@testing-library/user-event`
- Global `vi` available (no import needed)
- Test setup: [src/test/setup.ts](../src/test/setup.ts)

### Testing Pattern
```tsx
// Component tests: render, query, simulate user events
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('calls handler on click', async () => {
  const user = userEvent.setup();
  render(<Component onAction={mockFn} />);
  await user.click(screen.getByLabelText('Label'));
  expect(mockFn).toHaveBeenCalledWith(expectedArg);
});

// Hook/logic tests: test pure functions directly
import { buildNrqlQuery } from './useQueryBuilder';
expect(buildNrqlQuery(state)).toContain("expected output");
```

## Domain Knowledge

### Applications
Three GTM apps defined in `types/query.ts`:
- `global-tax-mapper-api`
- `global-tax-mapper-bff`  
- `global-tax-mapper-integrator-api`

App names in NRQL combine with environment: `{app}-{env}` (e.g., `global-tax-mapper-api-prod`)

### NRQL Query Structure
Generated queries follow this format:
```sql
FROM Transaction select [metrics] WHERE appName in ([apps]) and [filters] TIMESERIES 1 MINUTE SINCE '[datetime]' UNTIL '[datetime]' FACET request.uri
```

### Health Check Filtering
`HEALTH_CHECK_PATHS` constant defines endpoints excluded when `excludeHealthChecks: true`

## Development Commands
- `npm run dev` - Start dev server
- `npm run build` - TypeScript compile + Vite build
- `npm run lint` - ESLint
