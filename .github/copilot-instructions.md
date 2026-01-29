# NR-Query-Builder Copilot Instructions

For comprehensive agent instructions, see the [AGENTS.md](../AGENTS.md) file in the project root.

## Quick Reference

### Project Summary

React + TypeScript + Vite app for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications. Uses **@xero/xui** design system for all UI components.

### Critical Rules

1. **Always prefer XUI components** - never raw HTML form elements  (`<input>`, `<button>`, `<select>`)
2. **Tests required** - update tests when modifying code, run `npm run test:run` after changes
3. **Controlled components** - state lives in `useQueryBuilder` hook, components receive props + callbacks
4. **Use constants** - import types and constants from `src/types/query.ts`
5. **Barrel exports** - import components from `src/components/index.ts`, not directly

### Commands

```bash
npm run dev        # Dev server
npm run test:run   # Run tests (always run after changes)
npm run lint       # Lint
npm run build      # Build
```

### Key Files

- `src/hooks/useQueryBuilder.ts` - State + NRQL generation
- `src/types/query.ts` - Types, constants, domain config
- `src/components/` - UI components (co-located tests)

### XUI Import Example

```tsx
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import XUIButton from '@xero/xui/react/button';
import { XUIRow, XUIColumn } from '@xero/xui/react/structural';
```
