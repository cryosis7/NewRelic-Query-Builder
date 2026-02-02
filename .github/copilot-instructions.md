# NR-Query-Builder Copilot Instructions

For comprehensive agent instructions, see the [AGENTS.md](../AGENTS.md) file in the project root.

## Quick Reference

### Project Summary

React + TypeScript + Vite app for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications. Uses **@xero/xui** design system and **Jotai** for state management.

### Critical Rules

1. **Always prefer XUI components** - never raw HTML form elements (`<input>`, `<button>`, `<select>`)
2. **Tests required** - update tests when modifying code, run `npm run test:run` after changes
3. **Jotai atoms for state** - state lives in `src/atoms/`, components consume via `useAtom`
4. **Use constants** - import types and constants from `src/types/query.ts`
5. **Barrel exports** - import from `src/atoms/index.ts` and `src/components/index.ts`

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
npm run dev        # Dev server
npm run test:run   # Run tests (always run after changes)
npm run lint       # Lint
npm run build      # Build
```

### Key Files

- `src/atoms/` - Jotai atoms (primitives, derived, actions)
- `src/lib/buildNrqlQuery.ts` - Pure NRQL generation function
- `src/types/query.ts` - Types, constants, domain config
- `src/components/` - UI components (co-located tests)

### XUI Import Example

```tsx
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import XUIButton from '@xero/xui/react/button';
import { Flex, FlexItem } from './components';
```

### Atom Import Example

```tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { applicationsAtom, nrqlQueryAtom, applyPresetAtom } from '../atoms';
```
