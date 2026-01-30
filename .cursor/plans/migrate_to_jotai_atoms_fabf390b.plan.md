---
name: Migrate to Jotai Atoms
overview: Migrate from the monolithic `useQueryBuilder` hook to Jotai atoms, splitting state into granular atoms with a derived atom for the NRQL query.
todos:
  - id: install-jotai
    content: Install jotai dependency
    status: completed
  - id: extract-build-query
    content: Extract buildNrqlQuery and helpers to src/lib/buildNrqlQuery.ts
    status: in_progress
  - id: create-primitive-atoms
    content: Create atoms/primitives.ts with simple atoms
    status: pending
  - id: create-metric-atoms
    content: Create atoms/metricItems.ts with add/update/remove helpers
    status: pending
  - id: create-derived-atom
    content: Create atoms/derived.ts with nrqlQueryAtom
    status: pending
  - id: create-action-atoms
    content: Create atoms/actions.ts with applyPreset and reset
    status: pending
  - id: migrate-app
    content: Migrate App.tsx to use Jotai Provider
    status: pending
  - id: migrate-components
    content: Migrate all components to use atoms directly
    status: pending
  - id: update-tests
    content: Update component and integration tests
    status: pending
  - id: cleanup
    content: Delete useQueryBuilder.ts
    status: pending
isProject: false
---

# Migrate to Jotai Atoms

## Current State

The `useQueryBuilder` hook manages a monolithic `QueryState` object with 20+ callbacks. This creates tight coupling and requires prop-drilling through the component tree.

```mermaid
flowchart LR
    subgraph current [Current Architecture]
        Hook[useQueryBuilder Hook]
        State[Monolithic QueryState]
        Callbacks[20+ Callbacks]
    end
    Hook --> State
    Hook --> Callbacks
    App --> Hook
    App -->|props down| Components
```

## Target Architecture

```mermaid
flowchart TB
    subgraph atoms [Atoms Layer - src/atoms/]
        applicationsAtom
        environmentAtom
        timePeriodAtom
        metricItemsAtom
        excludeHealthChecksAtom
        useTimeseriesAtom
        facetAtom
    end
    
    subgraph derived [Derived]
        nrqlQueryAtom
    end
    
    subgraph components [Components]
        ApplicationSelector
        EnvironmentSelector
        TimePeriodSelector
        MetricQueryBuilder
        HealthCheckToggle
        FacetSelector
        QueryPreview
    end
    
    applicationsAtom --> nrqlQueryAtom
    environmentAtom --> nrqlQueryAtom
    timePeriodAtom --> nrqlQueryAtom
    metricItemsAtom --> nrqlQueryAtom
    excludeHealthChecksAtom --> nrqlQueryAtom
    useTimeseriesAtom --> nrqlQueryAtom
    facetAtom --> nrqlQueryAtom
    
    ApplicationSelector --> applicationsAtom
    EnvironmentSelector --> environmentAtom
    TimePeriodSelector --> timePeriodAtom
    MetricQueryBuilder --> metricItemsAtom
    HealthCheckToggle --> excludeHealthChecksAtom
    HealthCheckToggle --> useTimeseriesAtom
    FacetSelector --> facetAtom
    QueryPreview --> nrqlQueryAtom
```

## File Structure

```
src/
├── atoms/
│   ├── index.ts              # Barrel export
│   ├── primitives.ts         # Simple primitive atoms
│   ├── metricItems.ts        # Metric items atom + actions
│   ├── derived.ts            # nrqlQueryAtom (derived from all)
│   └── actions.ts            # applyPreset, reset
├── lib/
│   └── buildNrqlQuery.ts     # Pure function (extracted from hook)
```

## Atom Design

**Primitive atoms** (`atoms/primitives.ts`):

- `applicationsAtom` - writable `Application[]`
- `environmentAtom` - writable `Environment`
- `timePeriodAtom` - writable `TimePeriod`
- `excludeHealthChecksAtom` - writable `boolean`
- `useTimeseriesAtom` - writable `boolean`
- `facetAtom` - writable `FacetOption`

**Complex atom** (`atoms/metricItems.ts`):

- `metricItemsAtom` - writable `MetricQueryItem[]`
- Helper atoms for add/update/remove metric items and filters using `atom` with write functions

**Derived atom** (`atoms/derived.ts`):

- `nrqlQueryAtom` - read-only derived atom that calls `buildNrqlQuery()`

**Action atoms** (`atoms/actions.ts`):

- `applyPresetAtom` - write-only atom that batch-updates multiple atoms
- `resetAtom` - write-only atom that resets all to defaults

## Component Migration

Components will use `useAtom()`, `useAtomValue()`, or `useSetAtom()` directly:

```tsx
// Before
function ApplicationSelector({ selectedApplications, onToggle }) {...}

// After
function ApplicationSelector() {
  const [applications, setApplications] = useAtom(applicationsAtom);
  const toggle = (app: Application) => {
    setApplications(prev => 
      prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]
    );
  };
  ...
}
```

## Key Changes

- **App.tsx**: Remove `useQueryBuilder()` call, wrap app in `<Provider>` from Jotai
- **Components**: Each component imports only the atoms it needs
- **Tests**: Update to render within a Jotai `<Provider>`, mock atoms as needed
- **buildNrqlQuery**: Remains a pure tested function, moved to `src/lib/`

## Dependencies

Add `jotai` package (latest version via npm).

## Migration Order

1. Install jotai, create atoms structure
2. Extract `buildNrqlQuery` to `src/lib/buildNrqlQuery.ts`
3. Create primitive atoms
4. Create metric items atom with action helpers
5. Create derived nrqlQueryAtom
6. Create applyPreset/reset action atoms
7. Migrate App.tsx (add Provider)
8. Migrate each component one-by-one
9. Update tests
10. Delete old `useQueryBuilder.ts`