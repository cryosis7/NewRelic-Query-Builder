# Atoms - Jotai State Management

All Jotai atoms for the NR-Query-Builder. Import from `src/atoms/index.ts` (barrel export).

## File Organization

```
atoms/
├── index.ts          # Barrel export for all atoms
├── primitives.ts     # Base state atoms
├── derived.ts        # nrqlQueryAtom + read/write date/time atoms
├── derived.test.ts   # Tests (uses createStore() pattern)
├── actions.ts        # Write-only action atoms
└── metricItems.ts    # CRUD atoms for metric items + filters
```

## Atom Categories

### Primitive Atoms (`primitives.ts`)

One atom per piece of state, initialized with sensible defaults:

```ts
applicationsAtom    // Application[] — default: ['global-tax-mapper-api']
environmentAtom     // Environment — default: 'prod'
timePeriodAtom      // TimePeriod — default: { mode: 'relative', relative: '3h ago' }
excludeHealthChecksAtom // boolean — default: true
excludeBulkEndpointAtom // boolean — default: true
useTimeseriesAtom   // boolean — default: true
facetAtom           // FacetOption — default: 'request.uri'
```

### Derived Atoms (`derived.ts`)

**Read-only:**
```ts
nrqlQueryAtom       // Composes all primitives → buildNrqlQuery(QueryState) → string
```

**Read-write** (parse/format between raw `timePeriodAtom` and typed values):
```ts
sinceDateAtom       // read: Date | undefined, write: Date → updates timePeriod.since
sinceTimeAtom       // read: string (HH:mm), write: string → updates timePeriod.since
untilDateAtom       // read: Date | undefined, write: Date → updates timePeriod.until
untilTimeAtom       // read: string (HH:mm), write: string → updates timePeriod.until
initializeTimePeriodAtom // action: sets default since/until values
```

### Action Atoms (`actions.ts`)

Write-only atoms for coordinated multi-atom updates:
```ts
applyPresetAtom         // (Partial<QueryState>) → sets all matching atoms
resetAtom               // () → resets all atoms to getInitialState() defaults
setTimePeriodModeAtom   // (TimePeriodMode) → sets timePeriod.mode
setTimePeriodSinceAtom  // (string) → sets timePeriod.since
setTimePeriodUntilAtom  // (string) → sets timePeriod.until
setTimePeriodRelativeAtom // (string) → sets timePeriod.relative
```

### CRUD Atoms (`metricItems.ts`)

Array management for metric items and their filters:
```ts
// Metric items
metricItemsAtom       // MetricQueryItem[] — base state
addMetricItemAtom     // () → appends new item via createMetricItem()
updateMetricItemAtom  // ({ id, updates }) → patches item by ID
removeMetricItemAtom  // (id) → removes item by ID

// Filters
addFilterAtom         // (metricId) → appends new filter via createMetricFilter()
updateFilterAtom      // ({ metricId, filterId, updates }) → patches filter; resets operator on field change
removeFilterAtom      // ({ metricId, filterId }) → removes filter
```

## Patterns

### Read-Write Derived Atom

```ts
export const sinceDateAtom = atom(
  (get) => {
    const tp = get(timePeriodAtom);
    return tp.since ? parseDateStringToDate(tp.since.split('T')[0]) : undefined;
  },
  (get, set, newDate: Date) => {
    const tp = get(timePeriodAtom);
    const datePart = formatDateToString(newDate);
    const timePart = tp.since?.split('T')[1] ?? '00:00';
    set(timePeriodAtom, { ...tp, since: `${datePart}T${timePart}` });
  }
);
```

### Smart Filter Update (operator reset on field change)

`updateFilterAtom` automatically resets the operator when the field type changes (string fields → `=`, numeric fields → `>`).

### Testing Atoms with `createStore()`

Test atoms directly without React rendering:
```ts
import { createStore } from 'jotai';

const store = createStore();
store.set(timePeriodAtom, { mode: 'absolute', since: '2025-01-01T10:00', ... });
expect(store.get(sinceDateAtom)).toEqual(new Date(2025, 0, 1));
store.set(sinceDateAtom, new Date(2025, 5, 15));
expect(store.get(timePeriodAtom).since).toBe('2025-06-15T10:00');
```

## Rules

- Export all atoms from `index.ts`
- Import from `../atoms` barrel, not individual files
- Business logic goes in `../lib/` — atoms only coordinate state
- Use immutable updates (map, filter, spread)
- Type atoms with proper TypeScript types
