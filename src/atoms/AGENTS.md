# Atoms - Jotai State Management

This folder contains all Jotai atoms for state management in the NR-Query-Builder application.

## File Organization

```
atoms/
├── index.ts          # Barrel export for all atoms
├── primitives.ts     # Base state atoms
├── derived.ts        # Computed atoms (nrqlQueryAtom)
├── actions.ts        # Write-only action atoms
└── metricItems.ts    # CRUD atoms for metric items
```

---

## Atom Patterns

### Primitive Atoms (State Storage)

Primitive atoms store individual pieces of state. Each piece of state gets its own atom.

```ts
// primitives.ts
import { atom } from 'jotai';
import type { Application, Environment } from '../types/query';

// ✅ Each piece of state is a separate primitive atom
export const applicationsAtom = atom<Application[]>(['global-tax-mapper-api']);
export const environmentAtom = atom<Environment>('prod');
export const timePeriodAtom = atom<TimePeriod>({ mode: 'relative', relative: '3h ago' });
export const excludeHealthChecksAtom = atom<boolean>(true);
```

**Guidelines:**
- One atom per piece of state
- Initialize with sensible defaults
- Type the atom with the appropriate TypeScript type
- Export as named exports

---

### Derived Atoms (Computed Values)

Derived atoms compute values from other atoms. They automatically recompute when dependencies change.

```ts
// derived.ts
import { atom } from 'jotai';
import { buildNrqlQuery } from '../lib/buildNrqlQuery';
import type { QueryState } from '../types/query';

// ✅ Derived atoms compose multiple primitives
export const nrqlQueryAtom = atom((get) => {
  const state: QueryState = {
    applications: get(applicationsAtom),
    environment: get(environmentAtom),
    metricItems: get(metricItemsAtom),
    timePeriod: get(timePeriodAtom),
    excludeHealthChecks: get(excludeHealthChecksAtom),
    useTimeseries: get(useTimeseriesAtom),
    facet: get(facetAtom),
  };
  return buildNrqlQuery(state); // Pure function call
});
```

**Guidelines:**
- Read-only atoms that derive from other atoms
- Use `get()` to read atom values
- Call pure functions for business logic (don't implement logic here)
- Return computed value

---

### Action Atoms (Complex State Updates)

Action atoms coordinate updates across multiple atoms. They are write-only atoms.

```ts
// actions.ts
import { atom } from 'jotai';
import type { QueryState } from '../types/query';

// ✅ Write-only action atoms for multi-field updates
export const applyPresetAtom = atom(
  null, // No read value
  (get, set, preset: Partial<QueryState>) => {
    if (preset.applications !== undefined) set(applicationsAtom, preset.applications);
    if (preset.environment !== undefined) set(environmentAtom, preset.environment);
    if (preset.metricItems !== undefined) set(metricItemsAtom, preset.metricItems);
    if (preset.timePeriod !== undefined) set(timePeriodAtom, preset.timePeriod);
    if (preset.excludeHealthChecks !== undefined) set(excludeHealthChecksAtom, preset.excludeHealthChecks);
    if (preset.useTimeseries !== undefined) set(useTimeseriesAtom, preset.useTimeseries);
    if (preset.facet !== undefined) set(facetAtom, preset.facet);
  }
);

export const resetAtom = atom(null, (get, set) => {
  set(applicationsAtom, ['global-tax-mapper-api']);
  set(environmentAtom, 'prod');
  // ... reset all atoms to defaults
});
```

**Guidelines:**
- First parameter is `null` (write-only)
- Second parameter is the write function: `(get, set, ...args) => void`
- Use `set()` to update other atoms
- Check for `undefined` when applying partial updates
- Coordinate multi-atom updates that should happen together

---

### CRUD Action Atoms (For Arrays/Collections)

For atoms that store arrays, create separate action atoms for each CRUD operation.

```ts
// metricItems.ts
import { atom } from 'jotai';
import { createMetricItem } from '../lib/buildNrqlQuery';
import type { MetricQueryItem, AggregationType } from '../types/query';

// Base state atom
export const metricItemsAtom = atom<MetricQueryItem[]>([
  createMetricItem('duration', 'count'),
]);

// ✅ Separate action atoms for each CRUD operation
export const addMetricItemAtom = atom(null, (get, set) => {
  const current = get(metricItemsAtom);
  set(metricItemsAtom, [...current, createMetricItem('duration', 'count')]);
});

export const updateMetricItemAtom = atom(
  null,
  (get, set, { id, updates }: { id: string; updates: Partial<MetricQueryItem> }) => {
    const current = get(metricItemsAtom);
    set(metricItemsAtom, current.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }
);

export const removeMetricItemAtom = atom(null, (get, set, id: string) => {
  const current = get(metricItemsAtom);
  set(metricItemsAtom, current.filter(item => item.id !== id));
});

export const updateMetricFieldAtom = atom(
  null,
  (get, set, { id, field }: { id: string; field: string }) => {
    const current = get(metricItemsAtom);
    set(metricItemsAtom, current.map(item =>
      item.id === id ? { ...item, field, filters: [] } : item
    ));
  }
);
```

**Guidelines:**
- Create separate atoms for: add, update, remove operations
- Use immutable array operations (map, filter, spread)
- Type the parameters clearly
- Call factory functions (e.g., `createMetricItem`) for creating new items

---

### Barrel Export Pattern

Always export all atoms from `index.ts` for centralized imports.

```ts
// index.ts - Central export for all atoms
export { applicationsAtom, environmentAtom, timePeriodAtom } from './primitives';
export { nrqlQueryAtom } from './derived';
export { applyPresetAtom, resetAtom } from './actions';
export { 
  metricItemsAtom, 
  addMetricItemAtom, 
  updateMetricItemAtom, 
  removeMetricItemAtom 
} from './metricItems';
```

**Usage in components:**
```tsx
// ✅ Import from barrel export
import { applicationsAtom, environmentAtom } from '../atoms';

// ❌ Don't import directly from files
import { applicationsAtom } from '../atoms/primitives';
```

---

## Do

- Create primitive atoms for each piece of state
- Create action atoms for complex multi-atom updates
- Use derived atoms for computed values
- Export all atoms from `index.ts`
- Type atoms appropriately
- Initialize atoms with sensible defaults
- Use immutable updates for arrays/objects

## Don't

- Don't put business logic in atoms - call pure functions from `../lib/`
- Don't create stateful hooks - use Jotai atoms instead
- Don't import atoms directly from their files - use barrel export
- Don't mutate state - use immutable patterns
- Don't forget to export new atoms from `index.ts`
