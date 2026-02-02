# NR-Query-Builder Agent Instructions

A React + TypeScript + Vite application for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications.

## Architecture Overview

### Architectural Diagram

```
App.tsx (Jotai Provider, Layout)
  │
  ├─ Components Layer (src/components/)
  │   └─ ApplicationSelector, EnvironmentSelector, MetricQueryBuilder, etc.
  │      └─ useAtom(...)
  │
  └─ Atoms Layer (src/atoms/)
      ├─ Primitive Atoms: applicationsAtom, environmentAtom, timePeriodAtom, facetAtom, etc.
      ├─ Derived Atoms: nrqlQueryAtom ← buildNrqlQuery(QueryState)
      └─ Action Atoms: applyPresetAtom, resetAtom, addMetricItemAtom, updateFilterAtom
          │
          ├─ Pure Functions (src/lib/)
          │   └─ buildNrqlQuery.ts: buildNrqlQuery(state), createMetricItem(), createMetricFilter()
          │
          └─ Types & Constants (src/types/)
              └─ query.ts: QueryState, Application, Environment, NRQL_FIELDS, etc.
```

### Data Flow Pattern

```
User Interaction → Component → useAtom(primitiveAtom) → State Update
                                         ↓
                              nrqlQueryAtom (derived)
                                         ↓
                              buildNrqlQuery(QueryState)
                                         ↓
                              NRQL Query String → QueryPreview
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Components** | `src/components/` | UI rendering, user interaction, atom consumption |
| **Atoms** | `src/atoms/` | State storage, derived computations, action handlers |
| **Pure Functions** | `src/lib/` | Stateless business logic, NRQL generation |
| **Types** | `src/types/` | TypeScript types, domain constants, field definitions |
| **Presets** | `src/data/` | Pre-configured query combinations |

---

## How to Use This Codebase

### State Management (`src/atoms/`)

Import atoms from `src/atoms/index.ts` (barrel export). The atoms folder uses a layered Jotai pattern:
- **Primitive atoms**: Store individual pieces of state
- **Derived atoms**: Compute values from other atoms (e.g., `nrqlQueryAtom`)
- **Action atoms**: Coordinate multi-atom updates (e.g., `applyPresetAtom`)
- **CRUD atoms**: Manage array operations (add, update, remove)

See [`src/atoms/AGENTS.md`](src/atoms/AGENTS.md) for detailed atom creation patterns.

### Components (`src/components/`)

Import components from `src/components/index.ts` (barrel export). Components:
- Consume atoms via `useAtom()`
- Use XUI components exclusively (never raw HTML)
- Have minimal internal logic
- Co-locate tests with implementation

See [`src/components/AGENTS.md`](src/components/AGENTS.md) for component patterns, XUI usage, and testing.

### Business Logic (`src/lib/`)

Pure functions for stateless business logic:
- No side effects, deterministic output
- Main export: `buildNrqlQuery(state: QueryState): string`
- Factory functions: `createMetricItem()`, `createMetricFilter()`

See [`src/lib/AGENTS.md`](src/lib/AGENTS.md) for pure function patterns and testing.

### Types & Constants (`src/types/`)

Single source of truth for types and domain constants:
- All types defined in `query.ts`
- Constants: `APPLICATIONS`, `ENVIRONMENTS`, `NRQL_FIELDS`, `HEALTH_CHECK_PATHS`
- Always use constants instead of hardcoding values

See [`src/types/AGENTS.md`](src/types/AGENTS.md) for type usage and domain knowledge.

### Presets (`src/data/`)

Pre-configured query combinations:
- Common monitoring scenarios (error rate, latency, throughput)
- Applied via `applyPresetAtom`

See [`src/data/AGENTS.md`](src/data/AGENTS.md) for preset structure and examples.

### E2E Tests (`e2e/`)

Playwright end-to-end tests:
- Test complete user workflows
- Use semantic selectors (`getByRole`, `getByLabel`)
- Run with `npm run test:e2e` or `npm run test:e2e:ui`

See [`e2e/AGENTS.md`](e2e/AGENTS.md) for E2E testing patterns.

---

## Project Structure

```
src/
├── atoms/                    # Jotai atoms (state management)
│   ├── index.ts              # Barrel export for all atoms
│   ├── primitives.ts         # Base state atoms
│   ├── derived.ts            # Computed atoms (nrqlQueryAtom)
│   ├── actions.ts            # Write-only action atoms
│   └── metricItems.ts        # CRUD atoms for metric items
├── components/               # React components (one per file)
│   ├── index.ts              # Barrel export for all components
│   ├── ComponentName.tsx     # Component implementation
│   └── ComponentName.test.tsx # Co-located tests
├── lib/                      # Pure business logic functions
│   ├── buildNrqlQuery.ts     # NRQL generation
│   └── buildNrqlQuery.test.ts
├── types/
│   └── query.ts              # All types, constants, domain config
├── data/
│   └── presets.ts            # Query preset definitions
├── test/
│   └── setup.ts              # Vitest setup
├── App.tsx                   # Main app with Jotai Provider
└── main.tsx                  # Entry point
e2e/                          # Playwright E2E tests
```

---

## Quick Reference

### Do

- Delegate tasks to subagents
- Update tests when modifying code
- Always run tests after modifications

---

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
WHERE appName IN ([apps]) AND [filters]
TIMESERIES AUTO
SINCE [time] UNTIL [time]
FACET [field]
```

### NRQL Fields

Field definitions live in `NRQL_FIELDS` constant:

| Field | Data Type | Can Aggregate | Can Facet |
|-------|-----------|---------------|-----------|
| `duration` | numeric | ✓ | ✗ |
| `response.status` | string | ✗ | ✓ |
| `request.uri` | string | ✗ | ✓ |
| `http.method` | string | ✗ | ✓ |
| `name` | string | ✗ | ✓ |

### Aggregation Types

| Type | Description |
|------|-------------|
| `count` | Total count (works for all fields) |
| `average` | Average value (numeric fields only) |
| `p95` | 95th percentile (numeric fields only) |

### Filter Behavior

- Filters with empty values are ignored
- When all metrics share the same filters, they're lifted to global WHERE
- When filters differ, each metric uses `filter()` wrapper
- Status codes support: exact (`404`), multiple (`404, 503`), fuzzy (`4xx`, `5%`)

### Health Check Paths

`HEALTH_CHECK_PATHS` constant defines endpoints excluded when `excludeHealthChecks: true`:
- `/ping`, `/secureping`, `/health`, `/healthcheck`, `/secure-ping`, `/ready`, `/accountsV2/bulk`

---