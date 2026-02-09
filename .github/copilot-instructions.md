# NR-Query-Builder Copilot Instructions

For comprehensive agent instructions, see the [AGENTS.md](../AGENTS.md) file in the project root.

## Quick Reference

### Project Summary

React + TypeScript + Vite app for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications. Uses **@xero/xui** design system and **Jotai** for state management.

### Critical Rules

1. **Always use XUI components** — never raw HTML form elements (`<input>`, `<button>`, `<select>`)
2. **Tests required** — update tests when modifying code, run `npm run test` after changes
3. **Jotai atoms for state** — state lives in `src/atoms/`, components consume via `useAtom`
4. **Use constants** — import types and constants from `src/types/query.ts`, never hardcode
5. **Barrel exports** — import from `src/atoms/index.ts` and `src/components/index.ts`

### Architecture Pattern

```
Components → useAtom(primitiveAtom) → State
                    ↓
          nrqlQueryAtom (derived)
                    ↓
          buildNrqlQuery() (pure function)
```

### Commands

```bash
npm run dev        # Dev server (localhost:5173)
npm run test   # Run unit tests (always run after changes)
npm run test:e2e   # Run Playwright E2E tests
npm run lint       # Lint
npm run build      # Build
```

### Key Files

- `src/atoms/` — Jotai atoms (primitives, derived, actions, CRUD)
- `src/lib/buildNrqlQuery.ts` — Pure NRQL generation + factory functions
- `src/lib/dateTimeUtils.ts` — Date/time parsing utilities
- `src/types/query.ts` — All types, constants, derived constants, helpers
- `src/data/presets.ts` — `QueryPreset` definitions (`QUERY_PRESETS`)
- `src/components/` — UI components with co-located tests

### XUI Import Examples

```tsx
import XUIButton from '@xero/xui/react/button';
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import XUISingleSelect, { XUISingleSelectOption } from '@xero/xui/react/singleselect';
import XUIToggle, { XUIToggleOption } from '@xero/xui/react/toggle';
import { Flex, FlexItem } from './components';
```

### Atom Import Examples

```tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { applicationsAtom, nrqlQueryAtom, applyPresetAtom } from '../atoms';
```

### Key Domain Facts

- **2 environments**: `prod`, `uat` (not 3)
- **6 NRQL fields** in `NRQL_FIELDS` array (not Record): `duration`, `response.status`, `request.uri`, `request.method`, `name`, `appName`
- **5 aggregation types** in `AGGREGATION_TYPES` config: `average`, `count`, `p95`, `uniques`, `median`
- **Filters support negation** (`negated: boolean`) and type-dependent operators
- **Path exclusions** split into `HEALTH_CHECK_PATHS` and `BULK_ENDPOINT_PATHS`
